import dotenv from 'dotenv';

dotenv.config();

const nodeEnv = process.env.NODE_ENV ?? 'development';

function required(name: string): string {
  const v = process.env[name];
  if (v === undefined || v === '') {
    throw new Error(`Variable d'environnement manquante : ${name}`);
  }
  return v;
}

// JWT_SECRET : AUCUNE valeur par défaut. Un secret par défaut public permettrait à quiconque
// de forger des jetons admin → l'app DOIT refuser de démarrer si la variable est absente
// (fail-fast). En production, on rejette aussi les secrets manifestement faibles/connus.
function requireJwtSecret(): string {
  const secret = required('JWT_SECRET');
  const weak = secret.length < 32 || secret.startsWith('dev-') || secret.startsWith('change-me');
  if (nodeEnv === 'production' && weak) {
    throw new Error('JWT_SECRET trop faible : fournissez une chaîne aléatoire d’au moins 32 caractères en production.');
  }
  return secret;
}

export const env = {
  port: Number(process.env.PORT ?? 3000),
  nodeEnv,
  jwtSecret: requireJwtSecret(),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? '8h',
  // URL publique du site (lien de connexion glissé dans les e-mails de bienvenue).
  // Configurable pour la bascule vers le domaine définitif de la MA2E.
  publicUrl: (process.env.PUBLIC_SITE_URL ?? 'https://ma2e-connect.vercel.app').replace(/\/+$/, ''),
  // Double authentification par code envoyé par e-mail. Activée par défaut.
  // MFA_ENABLED=false est un COUPE-CIRCUIT D'URGENCE : il ne sert que si l'envoi d'e-mail
  // tombe en panne ET que les codes de secours sont perdus. Il exige un accès au serveur
  // (SSH + redémarrage), donc il reste hors de portée d'un attaquant venant d'Internet.
  mfaEnabled: (process.env.MFA_ENABLED ?? 'true').toLowerCase() !== 'false',
  // Rate limiting (anti brute-force sur le login 2FA + anti-spam sur les formulaires publics).
  // Pilotable par variables d'env pour les audits de charge : RATE_LIMIT_DISABLED=true coupe
  // TOUS les limiteurs, ou ajustez chaque plafond. Les défauts reproduisent le comportement
  // historique. ⚠ À ne relâcher QUE sur un serveur de TEST et à restaurer après : une prod
  // sans limite = brute-force ouvert sur le login. Un changement exige un redémarrage du backend.
  rateLimit: {
    disabled: (process.env.RATE_LIMIT_DISABLED ?? 'false').toLowerCase() === 'true',
    windowMs: Number(process.env.RATE_LIMIT_WINDOW_MIN ?? 15) * 60 * 1000,
    loginMax: Number(process.env.RATE_LIMIT_LOGIN_MAX ?? 10),
    verifyMax: Number(process.env.RATE_LIMIT_VERIFY_MAX ?? 30),
    publicWriteMax: Number(process.env.RATE_LIMIT_PUBLIC_WRITE_MAX ?? 20),
  },
  corsOrigins: (process.env.CORS_ORIGIN ?? 'http://localhost:8080,http://localhost:5173')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean),
  smtp: {
    host: process.env.SMTP_HOST ?? '',
    port: Number(process.env.SMTP_PORT ?? 587),
    user: process.env.SMTP_USER ?? '',
    pass: process.env.SMTP_PASS ?? '',
    from: process.env.MAIL_FROM ?? 'MA2E <no-reply@ma2e.ci>',
    toApplications: process.env.MAIL_TO_APPLICATIONS ?? 'contact@ma2e.ci',
  },
};
