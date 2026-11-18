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

// Nombre EXACT de reverse proxies de confiance entre Internet et l'API
// (aujourd'hui : Vercel → ingress → Caddy). Express compte les sauts depuis la DROITE de
// X-Forwarded-For, d'où deux façons de se tromper :
//  - valeur trop BASSE  → req.ip retombe sur l'adresse ajoutée par le dernier proxy, soit la
//    passerelle Docker (172.18.0.1), IDENTIQUE pour tous les clients. Tous partagent alors un
//    seul compteur de rate-limit → le back-office se verrouille mondialement dès les premiers
//    échecs, et le journal d'audit n'enregistre plus que cette passerelle.
//  - valeur trop HAUTE  → Express remonte au-delà du premier proxy de confiance et retient une
//    valeur fournie par le client : X-Forwarded-For devient usurpable, donc la clé de
//    rate-limit est forgeable.
// Jamais `true` (confiance aveugle). Réglable sans reconstruire l'image, car la longueur de la
// chaîne change avec l'ingress (bascule du funnel Tailscale vers la passerelle openresty).
export function parseTrustProxy(raw: string | undefined): number {
  if (raw === undefined || raw.trim() === '') return 1;
  // Décimal uniquement : `Number()` accepterait "0x2" ou "1e1", qui n'ont aucun sens ici et
  // masqueraient une faute de frappe dans .env.prod derrière une valeur plausible.
  const txt = raw.trim();
  if (!/^\d+$/.test(txt)) {
    throw new Error(
      `TRUST_PROXY invalide : "${raw}". Attendu : un entier >= 0 en décimal (nombre de proxys de confiance devant l'API).`,
    );
  }
  return Number(txt);
}

export const env = {
  port: Number(process.env.PORT ?? 3000),
  nodeEnv,
  jwtSecret: requireJwtSecret(),
  trustProxy: parseTrustProxy(process.env.TRUST_PROXY),
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
