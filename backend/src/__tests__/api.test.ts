import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import bcrypt from 'bcrypt';
import { app } from '../app';
import { prisma } from '../lib/prisma';

// Tests d'intégration de l'API (non destructifs).
// Pré-requis : PostgreSQL démarré + seed exécuté (admin@ma2e.ci / admin123).

const ADMIN_EMAIL = 'admin@ma2e.ci';
const ADMIN_PASSWORD = 'admin123';

// Chaque appel se présente avec une IP distincte. Le rate-limiter est keyé sur req.ip
// (l'app fait `set('trust proxy', 1)`, donc X-Forwarded-For fait foi) : les tests ne se
// gênent donc pas entre eux, et le limiteur reste pleinement actif en production.
let ipSeed = 0;
const nextIp = () => `10.1.0.${(ipSeed++ % 250) + 1}`;

function startLogin(email: string, password: string) {
  return request(app).post('/api/auth/login').set('X-Forwarded-For', nextIp()).send({ email, password });
}

function submitCode(challengeId: string, code: string) {
  return request(app)
    .post('/api/auth/verify')
    .set('X-Forwarded-For', nextIp())
    .send({ challengeId, code });
}

// Le code de vérification est stocké haché (bcrypt) : il est impossible de le relire,
// y compris depuis un test. On réécrit donc l'empreinte du challenge avec un code connu.
// Tout le chemin de vérification est ainsi exercé pour de vrai, sans jamais exposer de
// code sur le réseau — même en développement.
async function setChallengeCode(challengeId: string, code: string) {
  await prisma.loginChallenge.update({
    where: { id: challengeId },
    data: { codeHash: await bcrypt.hash(code, 10) },
  });
}

let cachedToken: string | null = null;

async function adminToken(): Promise<string> {
  if (cachedToken) return cachedToken;
  const res = await startLogin(ADMIN_EMAIL, ADMIN_PASSWORD);
  // Coupe-circuit MFA_ENABLED=false : le jeton arrive dès la première étape.
  if (res.status === 200 && res.body.token) {
    cachedToken = res.body.token;
    return cachedToken;
  }
  await setChallengeCode(res.body.challengeId, '123456');
  const verified = await submitCode(res.body.challengeId, '123456');
  cachedToken = verified.body.token;
  return cachedToken;
}

describe('Santé & Auth', () => {
  it('GET /api/health → 200 ok', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });

  it('login refuse de mauvais identifiants → 401', async () => {
    const res = await startLogin(ADMIN_EMAIL, 'mauvais');
    expect(res.status).toBe(401);
  });

  it('login rejette une entrée invalide → 400', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .set('X-Forwarded-For', nextIp())
      .send({ email: 'pas-un-email' });
    expect(res.status).toBe(400);
  });

  it('un mot de passe valide ouvre une session complète', async () => {
    const token = await adminToken();
    expect(token).toBeTruthy();
    const me = await request(app).get('/api/auth/me').set('Authorization', `Bearer ${token}`);
    expect(me.status).toBe(200);
    expect(me.body.user.role).toBe('admin');
  });
});

describe('Double authentification', () => {
  it("le mot de passe seul ne délivre AUCUN jeton", async () => {
    const res = await startLogin(ADMIN_EMAIL, ADMIN_PASSWORD);
    expect(res.status).toBe(202);
    expect(res.body.token).toBeUndefined();
    expect(res.body.challengeId).toBeTruthy();
    expect(res.body.expiresIn).toBe(300);
  });

  it("l'adresse de destination est masquée", async () => {
    const res = await startLogin(ADMIN_EMAIL, ADMIN_PASSWORD);
    expect(res.body.maskedEmail).toBe('a***@ma2e.ci');
    expect(res.body.maskedEmail).not.toContain('dmin');
  });

  it('un code correct délivre le jeton', async () => {
    const login = await startLogin(ADMIN_EMAIL, ADMIN_PASSWORD);
    await setChallengeCode(login.body.challengeId, '424242');
    const res = await submitCode(login.body.challengeId, '424242');
    expect(res.status).toBe(200);
    expect(res.body.token).toBeTruthy();
    expect(res.body.user.role).toBe('admin');
  });

  it('un code ne sert qu\'une seule fois', async () => {
    const login = await startLogin(ADMIN_EMAIL, ADMIN_PASSWORD);
    await setChallengeCode(login.body.challengeId, '111222');
    expect((await submitCode(login.body.challengeId, '111222')).status).toBe(200);
    expect((await submitCode(login.body.challengeId, '111222')).status).toBe(401);
  });

  it('un code expiré est refusé', async () => {
    const login = await startLogin(ADMIN_EMAIL, ADMIN_PASSWORD);
    await setChallengeCode(login.body.challengeId, '333444');
    await prisma.loginChallenge.update({
      where: { id: login.body.challengeId },
      data: { expiresAt: new Date(Date.now() - 1000) },
    });
    const res = await submitCode(login.body.challengeId, '333444');
    expect(res.status).toBe(401);
  });

  it('5 codes erronés brûlent la tentative de connexion', async () => {
    const login = await startLogin(ADMIN_EMAIL, ADMIN_PASSWORD);
    await setChallengeCode(login.body.challengeId, '999888');
    for (let i = 0; i < 5; i++) {
      expect((await submitCode(login.body.challengeId, '000000')).status).toBe(401);
    }
    // Plafond atteint : même le bon code ne passe plus.
    const res = await submitCode(login.body.challengeId, '999888');
    expect(res.status).toBe(429);
  });

  it('un challenge inconnu est refusé', async () => {
    const res = await submitCode('11111111-1111-4111-8111-111111111111', '123456');
    expect(res.status).toBe(401);
  });
});

describe('Codes de secours', () => {
  const EMAIL = 'test-2fa@ma2e.local';
  const PASSWORD = 'test-2fa-password';
  let codes: string[] = [];

  // Compte jetable : on ne touche pas aux codes de secours du compte admin réel.
  beforeAll(async () => {
    await prisma.user.deleteMany({ where: { email: EMAIL } });
    await prisma.user.create({
      data: { email: EMAIL, password: await bcrypt.hash(PASSWORD, 10), name: 'Test 2FA', role: 'USER' },
    });
  });

  afterAll(async () => {
    // La suppression en cascade emporte les challenges associés.
    await prisma.user.deleteMany({ where: { email: EMAIL } });
  });

  async function tokenFor(): Promise<string> {
    const login = await startLogin(EMAIL, PASSWORD);
    if (login.status === 200 && login.body.token) return login.body.token;
    await setChallengeCode(login.body.challengeId, '654321');
    return (await submitCode(login.body.challengeId, '654321')).body.token;
  }

  it('la génération renvoie 8 codes, une seule fois', async () => {
    const token = await tokenFor();
    const res = await request(app)
      .post('/api/auth/backup-codes')
      .set('Authorization', `Bearer ${token}`)
      .send({ password: PASSWORD });
    expect(res.status).toBe(200);
    expect(res.body.codes).toHaveLength(8);
    codes = res.body.codes;

    // La base ne contient que des empreintes : aucun code n'y est lisible.
    const stored = await prisma.user.findUnique({ where: { email: EMAIL } });
    expect(stored!.backupCodes).toHaveLength(8);
    expect(stored!.backupCodes).not.toContain(codes[0]);
  });

  it('la génération exige le mot de passe', async () => {
    const token = await tokenFor();
    const res = await request(app)
      .post('/api/auth/backup-codes')
      .set('Authorization', `Bearer ${token}`)
      .send({ password: 'mauvais' });
    expect(res.status).toBe(401);
  });

  it('un code de secours remplace le code e-mail', async () => {
    const login = await startLogin(EMAIL, PASSWORD);
    const res = await submitCode(login.body.challengeId, codes[0]);
    expect(res.status).toBe(200);
    expect(res.body.token).toBeTruthy();
    expect(res.body.backupCodesLeft).toBe(7);
  });

  it('un code de secours ne peut pas être rejoué', async () => {
    const login = await startLogin(EMAIL, PASSWORD);
    const res = await submitCode(login.body.challengeId, codes[0]);
    expect(res.status).toBe(401);
  });

  it('la saisie tolère minuscules et absence de tiret', async () => {
    const login = await startLogin(EMAIL, PASSWORD);
    const res = await submitCode(login.body.challengeId, codes[1].replace('-', '').toLowerCase());
    expect(res.status).toBe(200);
  });
});

describe('RBAC', () => {
  it('refuse les demandes sans token → 401', async () => {
    const res = await request(app).get('/api/applications');
    expect(res.status).toBe(401);
  });

  it('autorise un admin authentifié → 200 + liste', async () => {
    const token = await adminToken();
    const res = await request(app)
      .get('/api/applications')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('refuse une écriture article sans token → 401', async () => {
    const res = await request(app).post('/api/articles').send({ title: 'X', excerpt: 'Y', category: 'Z' });
    expect(res.status).toBe(401);
  });
});

describe('Lecture publique', () => {
  it('GET /api/articles → liste publiée', async () => {
    const res = await request(app).get('/api/articles');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('GET /api/products?type=credit → produits', async () => {
    const res = await request(app).get('/api/products?type=credit');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('GET /api/stats → tableau de statistiques', async () => {
    const res = await request(app).get('/api/stats');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});

describe('Validation des demandes', () => {
  it('POST /api/applications incomplet → 400', async () => {
    const res = await request(app).post('/api/applications').send({ category: 'crédit' });
    expect(res.status).toBe(400);
  });
});

describe("Rôle éditeur — 2FA, permissions et gestion par l'admin", () => {
  const EDITOR_EMAIL = 'editeur-test@ma2e.local';
  const EDITOR_EMAIL_2 = 'editeur-mute@ma2e.local';
  const EDITOR_PASSWORD = 'editeur-mdp-initial';
  const EDITOR_PASSWORD_2 = 'editeur-mdp-reinitialise';
  let editorId = '';
  const createdArticleIds: string[] = [];

  afterAll(async () => {
    for (const id of createdArticleIds) {
      await prisma.article.delete({ where: { id } }).catch(() => null);
    }
    await prisma.user.deleteMany({ where: { email: { in: [EDITOR_EMAIL, EDITOR_EMAIL_2] } } });
  });

  // Jeton d'un éditeur : identique au flux réel (mot de passe puis code), avec un code
  // connu réécrit dans le challenge (jamais exposé sur le réseau).
  async function editorToken(email: string, password: string): Promise<string> {
    const login = await startLogin(email, password);
    if (login.status === 200 && login.body.token) return login.body.token;
    await setChallengeCode(login.body.challengeId, '246810');
    return (await submitCode(login.body.challengeId, '246810')).body.token;
  }

  it("l'admin crée un éditeur avec des permissions ciblées", async () => {
    const token = await adminToken();
    const res = await request(app)
      .post('/api/users')
      .set('Authorization', `Bearer ${token}`)
      .set('X-Forwarded-For', nextIp())
      .send({ email: EDITOR_EMAIL, name: 'Éditeur Test', password: EDITOR_PASSWORD, role: 'EDITOR', permissions: ['news:write'] });
    expect(res.status).toBe(201);
    expect(res.body.role).toBe('EDITOR');
    expect(res.body.permissions).toEqual(['news:write']);
    editorId = res.body.id;
  });

  it("l'éditeur reçoit lui aussi un code à chaque connexion (202, aucun jeton)", async () => {
    const res = await startLogin(EDITOR_EMAIL, EDITOR_PASSWORD);
    expect(res.status).toBe(202);
    expect(res.body.token).toBeUndefined();
    expect(res.body.challengeId).toBeTruthy();
    expect(res.body.maskedEmail).toBe('e***@ma2e.local');
    // Aucun code de secours proposé à un éditeur.
    expect(res.body.backupCodesLeft).toBe(0);
  });

  it("après le code, la session de l'éditeur a bien le rôle editor", async () => {
    const token = await editorToken(EDITOR_EMAIL, EDITOR_PASSWORD);
    const me = await request(app).get('/api/auth/me').set('Authorization', `Bearer ${token}`);
    expect(me.status).toBe(200);
    expect(me.body.user.role).toBe('editor');
  });

  it("l'éditeur peut écrire là où il a la permission (news:write) → 201", async () => {
    const token = await editorToken(EDITOR_EMAIL, EDITOR_PASSWORD);
    const res = await request(app)
      .post('/api/articles')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: "Test éditeur 2FA", excerpt: 'Extrait de test', category: 'Actualité' });
    expect(res.status).toBe(201);
    createdArticleIds.push(res.body.id);
  });

  it("l'éditeur sans users:manage ne peut pas lister les comptes → 403", async () => {
    const token = await editorToken(EDITOR_EMAIL, EDITOR_PASSWORD);
    const res = await request(app).get('/api/users').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(403);
  });

  it("l'éditeur ne peut pas créer d'utilisateur → 403", async () => {
    const token = await editorToken(EDITOR_EMAIL, EDITOR_PASSWORD);
    const res = await request(app)
      .post('/api/users')
      .set('Authorization', `Bearer ${token}`)
      .send({ email: 'usurpateur@ma2e.local', name: 'X', password: 'xxxxxx', role: 'EDITOR' });
    expect(res.status).toBe(403);
  });

  it("l'admin réinitialise le mot de passe de l'éditeur", async () => {
    const token = await adminToken();
    const res = await request(app)
      .put(`/api/users/${editorId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ password: EDITOR_PASSWORD_2 });
    expect(res.status).toBe(200);
    // L'ancien mot de passe ne fonctionne plus, le nouveau ouvre bien un challenge.
    expect((await startLogin(EDITOR_EMAIL, EDITOR_PASSWORD)).status).toBe(401);
    expect((await startLogin(EDITOR_EMAIL, EDITOR_PASSWORD_2)).status).toBe(202);
  });

  it("l'admin change l'e-mail de l'éditeur → le code part vers la nouvelle adresse", async () => {
    const token = await adminToken();
    const res = await request(app)
      .put(`/api/users/${editorId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ email: EDITOR_EMAIL_2 });
    expect(res.status).toBe(200);
    expect(res.body.email).toBe(EDITOR_EMAIL_2);
    // La connexion se fait désormais avec la nouvelle adresse…
    const login = await startLogin(EDITOR_EMAIL_2, EDITOR_PASSWORD_2);
    expect(login.status).toBe(202);
    expect(login.body.maskedEmail).toBe('e***@ma2e.local');
    // …et plus avec l'ancienne (elle n'est plus un identifiant valide).
    expect((await startLogin(EDITOR_EMAIL, EDITOR_PASSWORD_2)).status).toBe(401);
  });

  it("changer l'e-mail vers une adresse déjà utilisée → 409", async () => {
    const token = await adminToken();
    const res = await request(app)
      .put(`/api/users/${editorId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ email: ADMIN_EMAIL });
    expect(res.status).toBe(409);
  });

  it('un administrateur ne peut pas modifier son propre rôle → 400', async () => {
    const token = await adminToken();
    const list = await request(app).get('/api/users').set('Authorization', `Bearer ${token}`);
    const admin = list.body.find((u: { email: string; id: string }) => u.email === ADMIN_EMAIL);
    const res = await request(app)
      .put(`/api/users/${admin.id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ role: 'EDITOR' });
    expect(res.status).toBe(400);
  });
});
