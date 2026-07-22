import rateLimit from 'express-rate-limit';

// Limiteur pour les endpoints PUBLICS en écriture (soumission de demande, upload de pièce,
// message de contact). Empêche le spam d'e-mails, le remplissage de la BDD et la saturation
// disque par un client non authentifié. La clé est l'IP (voir `app.set('trust proxy', 1)`).
// ⚠ BRANCHE test-charge : `skip` neutralise le limiteur pour les tests de charge.
// NE PAS merger dans main (main garde le rate limiting pour l'audit de sécurité).
export const publicWriteLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 20,
  skip: () => true,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Trop de requêtes depuis cette adresse. Réessayez dans quelques minutes.' },
});
