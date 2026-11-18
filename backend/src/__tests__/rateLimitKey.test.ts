import { describe, it, expect } from 'vitest';
import type { Request } from 'express';
import { clientIpUnusable } from '../lib/rateLimit';

// clientIpUnusable décide si la clé des limiteurs d'authentification identifie un vrai client.
// Un faux négatif (adresse privée jugée exploitable) rendrait le limiteur actif avec une clé
// commune à tout le monde → 10 tentatives / 15 min pour la planète, donc verrouillage global du
// back-office offert au premier attaquant. Un faux positif (vraie IP jugée inexploitable)
// désactiverait silencieusement la protection. Les deux sens sont donc testés.

const req = (ip: string | undefined) => ({ ip }) as Request;

describe('clientIpUnusable', () => {
  it('juge inexploitable une adresse qui ne distingue pas les clients', () => {
    const unusable = [
      '172.18.0.1', // valeur observée en production : passerelle du bridge Docker
      '172.19.0.1',
      '172.16.0.1',
      '172.31.255.254', // bornes du /12
      '10.1.0.1',
      '192.168.1.10',
      '127.0.0.1',
      '::1',
      '::ffff:172.18.0.1', // forme mappée IPv4 que renvoie Node
      '169.254.10.1', // lien-local
      'fd00::1', // IPv6 unique-local
      'fe80::1', // IPv6 lien-local
    ];
    for (const ip of unusable) {
      expect(clientIpUnusable(req(ip)), `${ip} doit être jugée inexploitable`).toBe(true);
    }
  });

  it('juge exploitable une adresse publique', () => {
    const usable = [
      '203.0.113.7', // TEST-NET-3
      '198.51.100.9', // TEST-NET-2
      '8.8.8.8',
      '41.207.0.1', // plage africaine, cas réel attendu pour la MA2E
      '172.32.0.1', // juste AU-DESSUS du /12 privé : doit rester exploitable
      '172.15.0.1', // juste EN DESSOUS du /12 privé
      '2001:db8::1',
    ];
    for (const ip of usable) {
      expect(clientIpUnusable(req(ip)), `${ip} doit être jugée exploitable`).toBe(false);
    }
  });

  it('traite une IP absente ou vide comme inexploitable (fail-safe)', () => {
    expect(clientIpUnusable(req(undefined))).toBe(true);
    expect(clientIpUnusable(req(''))).toBe(true);
    expect(clientIpUnusable(req('   '))).toBe(true);
  });
});
