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
  // Coupe-circuits TEMPORAIRES pour les campagnes de test (audit de charge / re-test cyber).
  // Défaut = false → comportement normal de production. À REMETTRE à false après les tests.
  //  - RATE_LIMIT_DISABLED=true coupe TOUS les limiteurs (login, 2FA, formulaires publics) :
  //    sinon une seule IP de test atteint le plafond en quelques secondes. ⚠ Une prod sans
  //    limite = brute-force ouvert sur le login → ne l'activer QUE le temps du test.
  //  - APPLICATION_NOTIFY_DISABLED=true coupe l'e-mail envoyé à chaque nouvelle demande
  //    (évite de noyer la boîte quand un scan soumet des centaines de demandes).
  // Tout changement exige un redémarrage du backend.
  rateLimitDisabled: (process.env.RATE_LIMIT_DISABLED ?? 'false').toLowerCase() === 'true',
  applicationNotifyDisabled: (process.env.APPLICATION_NOTIFY_DISABLED ?? 'false').toLowerCase() === 'true',
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
