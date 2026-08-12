import rateLimit from 'express-rate-limit';
import { env } from './env';

// Limiteur pour les endpoints PUBLICS en écriture (soumission de demande, upload de pièce,
// message de contact). Empêche le spam d'e-mails, le remplissage de la BDD et la saturation
// disque par un client non authentifié. La clé est l'IP (voir `app.set('trust proxy', 1)`).
// `skip` le coupe via RATE_LIMIT_DISABLED, le temps d'une campagne de test (voir lib/env).
export const publicWriteLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 20,
  skip: () => env.rateLimitDisabled,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Trop de requêtes depuis cette adresse. Réessayez dans quelques minutes.' },
});

// Limiteur GLOBAL et souple pour toute l'API, y compris les LECTURES (audit GS2E #6).
// Objectif : freiner le scraping massif / le déni de service par un client non authentifié,
// sans gêner un usage normal (une page du site déclenche plusieurs requêtes). Seuil large ;
// coupable via RATE_LIMIT_DISABLED le temps d'une campagne de test.
export const apiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 min
  max: 300,
  skip: () => env.rateLimitDisabled,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Trop de requêtes. Réessayez dans une minute.' },
});
