import { Router, Response } from 'express';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import rateLimit from 'express-rate-limit';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { env } from '../lib/env';
import { sendLoginCode } from '../lib/mailer';
import { signToken, requireAuth, AuthUser } from '../middleware/auth';

export const authRouter = Router();

// --- Paramètres de la double authentification -------------------------------
const CODE_TTL_MS = 5 * 60 * 1000; // validité du code : 5 minutes
const MAX_ATTEMPTS = 5; // saisies erronées avant de devoir refaire le mot de passe
const MAX_RESENDS = 3; // « Renvoyer le code » par tentative de connexion
const RESEND_COOLDOWN_MS = 60 * 1000; // délai minimal entre deux envois
const BACKUP_CODE_COUNT = 8;

// Limite les tentatives de connexion (anti brute-force).
// `skip` le coupe via RATE_LIMIT_DISABLED, le temps d'une campagne de test (voir lib/env).
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  skip: () => env.rateLimitDisabled,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Trop de tentatives. Réessayez dans quelques minutes.' },
});

// Étape 2 : plafond par IP, en complément du compteur de tentatives porté par le challenge
// lui-même. Plus permissif que le login car une saisie de code se rate facilement.
const verifyLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  skip: () => env.rateLimitDisabled,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Trop de tentatives. Réessayez dans quelques minutes.' },
});

const loginSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(1, 'Mot de passe requis'),
});

// Hash factice : on compare TOUJOURS avec bcrypt, même si l'utilisateur n'existe pas,
// pour égaliser le temps de réponse et supprimer l'oracle temporel d'énumération d'utilisateurs.
const DUMMY_HASH = bcrypt.hashSync('ma2e-timing-equalizer-not-a-real-password', 10);

function toAuthUser(u: {
  id: string;
  email: string;
  name: string;
  role: string;
  permissions: string[];
}): AuthUser {
  return {
    id: u.id,
    email: u.email,
    name: u.name,
    role: u.role.toLowerCase(),
    permissions: u.permissions || [],
  };
}

// Masque l'adresse de destination : « adama.toure@gmail.com » → « a***@gmail.com ».
// L'API ne renvoie JAMAIS l'adresse complète : elle sert seulement à confirmer à
// l'utilisateur quelle boîte consulter, sans la divulguer à qui aurait volé le mot de passe.
function maskEmail(email: string): string {
  const [local, domain] = email.split('@');
  if (!domain) return '***';
  return `${local.slice(0, 1)}***@${domain}`;
}

// Code à 6 chiffres tiré d'une source cryptographique (jamais Math.random).
function generateCode(): string {
  return String(crypto.randomInt(0, 1_000_000)).padStart(6, '0');
}

// Alphabet sans I, O, 0 ni 1 : les codes de secours se lisent sur papier, on supprime
// les caractères qu'on confond à la retranscription.
const BACKUP_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

function generateBackupCode(): string {
  const block = () =>
    Array.from({ length: 4 }, () => BACKUP_ALPHABET[crypto.randomInt(0, BACKUP_ALPHABET.length)]).join('');
  return `${block()}-${block()}`;
}

// Tolère les minuscules, les espaces et l'absence de tiret à la saisie.
function normalizeBackupCode(input: string): string {
  const raw = input.toUpperCase().replace(/[^A-Z0-9]/g, '');
  return raw.length === 8 ? `${raw.slice(0, 4)}-${raw.slice(4)}` : raw;
}

function issueToken(
  res: Response,
  user: { id: string; email: string; name: string; role: string; permissions: string[] },
  backupCodesLeft: number
) {
  const authUser = toAuthUser(user);
  return res.json({ token: signToken(authUser), user: authUser, backupCodesLeft });
}

// --- Étape 1 : identifiants -------------------------------------------------
// Le mot de passe valide n'ouvre PLUS de session : il ouvre un « challenge » à confirmer
// par un code envoyé par e-mail.
authRouter.post('/login', loginLimiter, async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0].message });
  }
  const { email, password } = parsed.data;

  const user = await prisma.user.findUnique({ where: { email } });
  // Comparaison bcrypt systématique (hash factice si l'utilisateur n'existe pas) → temps constant.
  const ok = await bcrypt.compare(password, user?.password ?? DUMMY_HASH);
  if (!user || !ok) {
    return res.status(401).json({ error: 'Identifiants invalides' });
  }

  // Coupe-circuit d'urgence (MFA_ENABLED=false) : retour au comportement d'origine.
  if (!env.mfaEnabled) {
    return issueToken(res, user, user.backupCodes.length);
  }

  // Ménage opportuniste : évite d'accumuler les challenges morts sans tâche planifiée.
  await prisma.loginChallenge.deleteMany({ where: { expiresAt: { lt: new Date() } } });
  // Une seule tentative de connexion vivante à la fois par compte : un nouveau login
  // invalide le code précédemment envoyé.
  await prisma.loginChallenge.deleteMany({ where: { userId: user.id, consumedAt: null } });

  const code = generateCode();
  const challenge = await prisma.loginChallenge.create({
    data: {
      userId: user.id,
      codeHash: await bcrypt.hash(code, 10),
      expiresAt: new Date(Date.now() + CODE_TTL_MS),
    },
  });

  // Si l'e-mail ne part pas, on garde quand même le challenge ouvert : c'est exactement
  // la situation où les codes de secours doivent prendre le relais. Le front prévient
  // l'utilisateur au lieu d'afficher « code envoyé » à tort.
  let emailSent = true;
  try {
    await sendLoginCode(user.email, user.name, code);
  } catch (err) {
    emailSent = false;
    // Le détail SMTP reste dans les logs serveur : inutile de l'exposer côté client.
    console.error('Échec envoi du code de connexion:', (err as Error).message);
  }

  res.status(202).json({
    challengeId: challenge.id,
    maskedEmail: maskEmail(user.email),
    expiresIn: Math.floor(CODE_TTL_MS / 1000),
    emailSent,
    backupCodesLeft: user.backupCodes.length,
  });
});

// --- Étape 2 : code de vérification ----------------------------------------
const verifySchema = z.object({
  challengeId: z.string().uuid('Session de connexion invalide'),
  code: z.string().min(1, 'Code requis'),
});

authRouter.post('/verify', verifyLimiter, async (req, res) => {
  const parsed = verifySchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0].message });
  }
  const { challengeId, code } = parsed.data;

  const challenge = await prisma.loginChallenge.findUnique({
    where: { id: challengeId },
    include: { user: true },
  });
  const now = new Date();

  // Message unique pour « inconnu », « déjà utilisé » et « expiré » : rien ne filtre.
  if (!challenge || challenge.consumedAt || challenge.expiresAt < now) {
    return res.status(401).json({ error: 'Code expiré ou session de connexion invalide. Reprenez la connexion.' });
  }

  if (challenge.attempts >= MAX_ATTEMPTS) {
    await prisma.loginChallenge.update({ where: { id: challenge.id }, data: { consumedAt: now } });
    return res.status(429).json({ error: 'Trop de codes erronés. Reprenez la connexion depuis le début.' });
  }

  const submitted = code.trim();
  const looksLikeEmailCode = /^\d{6}$/.test(submitted);

  // 1) Code reçu par e-mail.
  if (looksLikeEmailCode && (await bcrypt.compare(submitted, challenge.codeHash))) {
    await prisma.loginChallenge.update({ where: { id: challenge.id }, data: { consumedAt: now } });
    return issueToken(res, challenge.user, challenge.user.backupCodes.length);
  }

  // 2) Code de secours — la voie de récupération quand l'e-mail n'arrive pas.
  if (!looksLikeEmailCode) {
    const candidate = normalizeBackupCode(submitted);
    for (const hash of challenge.user.backupCodes) {
      if (await bcrypt.compare(candidate, hash)) {
        const remaining = challenge.user.backupCodes.filter((h) => h !== hash);
        // Consommation du code ET du challenge dans la même transaction : un code de
        // secours ne peut pas être rejoué, même si deux requêtes arrivent ensemble.
        await prisma.$transaction([
          prisma.user.update({
            where: { id: challenge.user.id },
            data: { backupCodes: { set: remaining } },
          }),
          prisma.loginChallenge.update({ where: { id: challenge.id }, data: { consumedAt: now } }),
        ]);
        return issueToken(res, challenge.user, remaining.length);
      }
    }
  }

  const updated = await prisma.loginChallenge.update({
    where: { id: challenge.id },
    data: { attempts: { increment: 1 } },
  });
  const left = Math.max(0, MAX_ATTEMPTS - updated.attempts);
  return res.status(401).json({
    error: left > 0 ? `Code incorrect. ${left} tentative(s) restante(s).` : 'Code incorrect. Reprenez la connexion.',
  });
});

// --- Renvoi du code ---------------------------------------------------------
authRouter.post('/resend', verifyLimiter, async (req, res) => {
  const parsed = z
    .object({ challengeId: z.string().uuid('Session de connexion invalide') })
    .safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0].message });
  }

  const challenge = await prisma.loginChallenge.findUnique({
    where: { id: parsed.data.challengeId },
    include: { user: true },
  });
  const now = new Date();

  if (!challenge || challenge.consumedAt || challenge.expiresAt < now) {
    return res.status(401).json({ error: 'Session de connexion expirée. Reprenez la connexion.' });
  }
  if (challenge.resendCount >= MAX_RESENDS) {
    return res.status(429).json({ error: 'Nombre de renvois atteint. Reprenez la connexion depuis le début.' });
  }
  const waited = now.getTime() - challenge.lastSentAt.getTime();
  if (waited < RESEND_COOLDOWN_MS) {
    return res.status(429).json({
      error: 'Patientez avant de demander un nouveau code.',
      retryAfter: Math.ceil((RESEND_COOLDOWN_MS - waited) / 1000),
    });
  }

  const code = generateCode();
  try {
    await sendLoginCode(challenge.user.email, challenge.user.name, code);
  } catch (err) {
    console.error('Échec renvoi du code de connexion:', (err as Error).message);
    return res.status(502).json({ error: "Le serveur e-mail n'a pas pu envoyer le code. Utilisez un code de secours." });
  }

  // Le compteur de tentatives n'est PAS remis à zéro : le plafond vaut pour toute la
  // tentative de connexion, sinon les renvois deviendraient un contournement.
  await prisma.loginChallenge.update({
    where: { id: challenge.id },
    data: {
      codeHash: await bcrypt.hash(code, 10),
      lastSentAt: now,
      resendCount: { increment: 1 },
      expiresAt: new Date(now.getTime() + CODE_TTL_MS),
    },
  });

  res.json({ ok: true, expiresIn: Math.floor(CODE_TTL_MS / 1000) });
});

authRouter.get('/me', requireAuth, async (req, res) => {
  const row = await prisma.user.findUnique({
    where: { id: req.user!.id },
    select: { backupCodes: true, backupCodesCreatedAt: true },
  });
  res.json({
    user: req.user,
    mfaEnabled: env.mfaEnabled,
    backupCodesLeft: row?.backupCodes.length ?? 0,
    backupCodesCreatedAt: row?.backupCodesCreatedAt ?? null,
  });
});

// --- Codes de secours -------------------------------------------------------
// Génère (ou remplace) le jeu de codes. Les codes en clair ne sont renvoyés QU'ICI et
// une seule fois : la base ne contient que leurs empreintes, personne ne peut les relire.
// Le mot de passe est redemandé car le jeton d'accès vit dans le localStorage.
const regenerateSchema = z.object({
  password: z.string().min(1, 'Mot de passe requis'),
});

authRouter.post('/backup-codes', requireAuth, async (req, res) => {
  const parsed = regenerateSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.issues[0].message });

  const user = await prisma.user.findUnique({ where: { id: req.user!.id } });
  if (!user) return res.status(404).json({ error: 'Utilisateur introuvable' });
  if (!(await bcrypt.compare(parsed.data.password, user.password))) {
    return res.status(401).json({ error: 'Mot de passe incorrect' });
  }

  const codes = Array.from({ length: BACKUP_CODE_COUNT }, generateBackupCode);
  const backupCodes = await Promise.all(codes.map((c) => bcrypt.hash(c, 10)));
  await prisma.user.update({
    where: { id: user.id },
    data: { backupCodes: { set: backupCodes }, backupCodesCreatedAt: new Date() },
  });

  res.json({ codes });
});

// Changement de son propre mot de passe (self-service). Exige le mot de passe actuel.
const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Mot de passe actuel requis'),
  newPassword: z.string().min(6, 'Nouveau mot de passe : 6 caractères minimum'),
});

authRouter.post('/change-password', requireAuth, async (req, res) => {
  const parsed = changePasswordSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.issues[0].message });
  const { currentPassword, newPassword } = parsed.data;

  const user = await prisma.user.findUnique({ where: { id: req.user!.id } });
  if (!user) return res.status(404).json({ error: 'Utilisateur introuvable' });

  const ok = await bcrypt.compare(currentPassword, user.password);
  if (!ok) return res.status(401).json({ error: 'Mot de passe actuel incorrect' });

  const password = await bcrypt.hash(newPassword, 10);
  await prisma.user.update({ where: { id: user.id }, data: { password } });
  res.json({ ok: true });
});
