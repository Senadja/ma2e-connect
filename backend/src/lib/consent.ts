import { prisma } from './prisma';

// Preuve de consentement (check-list de recette DCP SD_PDCP) : à chaque soumission d'un
// formulaire public, on enregistre la date ET la version du texte réellement affiché.
//
// La version est lue CÔTÉ SERVEUR dans le réglage « formsDcp » (éditable au back-office,
// cf. src/data/formsDcp.ts pour les valeurs de repli du front) : le client ne peut donc pas
// forger une version, et la preuve correspond bien à ce que le site servait à cet instant.
// ⚠️ Ces valeurs doivent rester ALIGNÉES sur DEFAULT_FORMS_DCP (src/data/formsDcp.ts) :
// le réglage « formsDcp » n'existe pas en base tant que le back-office ne l'a pas enregistré,
// donc c'est ce repli qui horodate les consentements. Un écart ferait signer aux personnes une
// version de texte différente de celle réellement affichée.
// version    : mentions d'information DCP livrées par SD_PDCP (R02), intégrées le 2026-11-10.
// tcuVersion : inchangée — SD_PDCP maintient les TCU en ligne (R01).
const FALLBACK = { version: '2026-11-10', tcuVersion: '2026-10-20' } as const;

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
