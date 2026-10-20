import { prisma } from './prisma';

// Preuve de consentement (check-list de recette DCP SD_PDCP) : à chaque soumission d'un
// formulaire public, on enregistre la date ET la version du texte réellement affiché.
//
// La version est lue CÔTÉ SERVEUR dans le réglage « formsDcp » (éditable au back-office,
// cf. src/data/formsDcp.ts pour les valeurs de repli du front) : le client ne peut donc pas
// forger une version, et la preuve correspond bien à ce que le site servait à cet instant.
const FALLBACK = { version: '2026-10-20', tcuVersion: '2026-10-20' } as const;

export type ConsentKind = 'dcp' | 'tcu';

export async function consentStamp(kind: ConsentKind) {
  const field = kind === 'tcu' ? 'tcuVersion' : 'version';
  const row = await prisma.setting.findUnique({ where: { key: 'formsDcp' } }).catch(() => null);
  const stored = (row?.value ?? {}) as Record<string, unknown>;
  const raw = typeof stored[field] === 'string' ? (stored[field] as string).trim() : '';
  const version = raw || FALLBACK[field];
  return {
    consentAt: new Date(),
    consentVersion: `${kind === 'tcu' ? 'TCU' : 'DCP'} ${version}`,
  };
}
