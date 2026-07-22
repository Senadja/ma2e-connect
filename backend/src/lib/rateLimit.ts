import rateLimit from 'express-rate-limit';
import { env } from './env';

// Limiteur pour les endpoints PUBLICS en écriture (soumission de demande, upload de pièce,
// message de contact). Empêche le spam d'e-mails, le remplissage de la BDD et la saturation
// disque par un client non authentifié. La clé est l'IP (voir `app.set('trust proxy', 1)`).
// Fenêtre et plafond pilotables par l'env ; `skip` le coupe via RATE_LIMIT_DISABLED.
export const publicWriteLimiter = rateLimit({
  windowMs: env.rateLimit.windowMs,
  max: env.rateLimit.publicWriteMax,
  skip: () => env.rateLimit.disabled,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Trop de requêtes depuis cette adresse. Réessayez dans quelques minutes.' },
});
