import rateLimit from 'express-rate-limit';
import type { Request } from 'express';
import { env } from './env';

// Vrai quand req.ip ne désigne PAS un client distinct : adresse privée, loopback, lien-local,
// ou absente. C'est l'état actuel de la production — Caddy ajoute la passerelle du bridge
// Docker (172.18.0.1) en bout de X-Forwarded-For et TRUST_PROXY n'est pas encore calibré sur
// la chaîne réelle, donc TOUS les clients produisent la même clé.
//
// Conséquence : un limiteur d'authentification actif dans cet état ne protège personne et
// offre à n'importe qui un verrouillage GLOBAL du back-office (10 tentatives / 15 min pour le
// monde entier). On s'en sert donc pour neutraliser ces seuls limiteurs tant que la clé est
// inexploitable ; ils se réactivent d'eux-mêmes dès que TRUST_PROXY est juste, sans nouveau
// déploiement. Le brute-force ciblé reste couvert par ailleurs : verrouillage de compte
// (`lockedAt`, routes/auth) et compteur d'essais porté par le challenge 2FA.
export function clientIpUnusable(req: Request): boolean {
  const ip = req.ip?.replace(/^::ffff:/, '').trim();
  if (!ip) return true;
  if (ip === '::1' || ip === '127.0.0.1') return true;
  if (/^127\./.test(ip)) return true; // loopback
  if (/^10\./.test(ip)) return true; // privé /8
  if (/^192\.168\./.test(ip)) return true; // privé /16
  if (/^172\.(1[6-9]|2\d|3[01])\./.test(ip)) return true; // privé /12 (dont les bridges Docker)
  if (/^169\.254\./.test(ip)) return true; // lien-local
  if (/^(f[cd])/i.test(ip)) return true; // IPv6 unique-local fc00::/7
  if (/^fe80:/i.test(ip)) return true; // IPv6 lien-local
  return false;
}

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
