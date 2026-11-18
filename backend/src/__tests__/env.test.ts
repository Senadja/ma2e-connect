import { describe, it, expect } from 'vitest';
import { parseTrustProxy } from '../lib/env';

// TRUST_PROXY pilote `app.set('trust proxy', …)`, donc la valeur de req.ip, donc la clé de
// TOUS les limiteurs de débit et l'IP inscrite au journal d'audit. Une valeur acceptée à tort
// (chaîne vide, flottant, négatif, "true") se traduirait par un compteur partagé par tous les
// clients — verrouillage global du back-office — ou par un X-Forwarded-For usurpable.
// On vérifie donc que seul un entier >= 0 passe, et que le défaut reste l'ancien comportement.

describe('parseTrustProxy', () => {
  it('vaut 1 par défaut (comportement historique) quand la variable est absente ou vide', () => {
    expect(parseTrustProxy(undefined)).toBe(1);
    expect(parseTrustProxy('')).toBe(1);
    expect(parseTrustProxy('   ')).toBe(1);
  });

  it('accepte un entier >= 0', () => {
    expect(parseTrustProxy('0')).toBe(0);
    expect(parseTrustProxy('1')).toBe(1);
    expect(parseTrustProxy('3')).toBe(3);
    expect(parseTrustProxy(' 2 ')).toBe(2);
  });

  it('refuse tout ce qui n\'est pas un entier positif, plutôt que de deviner', () => {
    // '0x2' et '1e1' sont les pièges : Number() les accepterait (2 et 10) et masquerait
    // une faute de frappe dans .env.prod derrière une valeur plausible.
    for (const bad of ['true', 'false', 'yes', '-1', '1.5', 'deux', '1,5', 'NaN', 'Infinity', '0x2', '1e1']) {
      expect(() => parseTrustProxy(bad), `${bad} doit être refusé`).toThrow(/TRUST_PROXY invalide/);
    }
  });
});
