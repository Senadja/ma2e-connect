import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../app';

// Tests d'intégration de l'API (non destructifs).
// Pré-requis : PostgreSQL démarré + seed exécuté (admin@ma2e.ci / admin123).

async function adminToken(): Promise<string> {
  const res = await request(app)
    .post('/api/auth/login')
    .send({ email: 'admin@ma2e.ci', password: 'admin123' });
  return res.body.token;
}

describe('Santé & Auth', () => {
  it('GET /api/health → 200 ok', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });

  it('login refuse de mauvais identifiants → 401', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@ma2e.ci', password: 'mauvais' });
    expect(res.status).toBe(401);
  });

  it('login valide → token JWT + rôle admin', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@ma2e.ci', password: 'admin123' });
    expect(res.status).toBe(200);
    expect(res.body.token).toBeTruthy();
    expect(res.body.user.role).toBe('admin');
  });

  it('login rejette une entrée invalide → 400', async () => {
    const res = await request(app).post('/api/auth/login').send({ email: 'pas-un-email' });
    expect(res.status).toBe(400);
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
