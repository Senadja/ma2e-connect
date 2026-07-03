import crypto from 'crypto';
import { env } from './env';

// Signature HMAC à durée limitée pour servir les pièces justificatives (CNI, passeport, photo)
// SANS les exposer publiquement. L'admin authentifié reçoit des URLs signées (via GET /applications) ;
// le navigateur peut alors charger l'image (<img src>) sans en-tête Authorization, et la signature
// expire. Réutilise le secret JWT (déjà requis fort au démarrage).
const TTL_MS = 60 * 60 * 1000; // 1 h

export function signDoc(file: string, ttlMs: number = TTL_MS): string {
  const exp = Date.now() + ttlMs;
  const sig = crypto.createHmac('sha256', env.jwtSecret).update(`${file}.${exp}`).digest('hex');
  return `?e=${exp}&s=${sig}`;
}

export function verifyDoc(file: string, expRaw: string, sigRaw: string): boolean {
  const exp = Number(expRaw);
  if (!Number.isFinite(exp) || exp < Date.now()) return false;
  if (!/^[a-f0-9]{64}$/i.test(sigRaw)) return false;
  const expected = crypto.createHmac('sha256', env.jwtSecret).update(`${file}.${exp}`).digest('hex');
  const a = Buffer.from(sigRaw, 'hex');
  const b = Buffer.from(expected, 'hex');
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}
