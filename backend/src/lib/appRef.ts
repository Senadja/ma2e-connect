import { prisma } from './prisma';

// Séquence Postgres dédiée aux références de demandes (MA2E-AAAA-NNNN).
// Remplace un `count()+1` non atomique qui, sous forte concurrence, produisait deux fois la même
// référence → violation de la contrainte @unique → HTTP 500 (défaut révélé par le test de charge
// Gatling). `nextval` est atomique : chaque appel renvoie un entier unique, sans course ni retry.
const SEQ = 'application_ref_seq';

// À appeler au démarrage du serveur (et dans les tests). Idempotent :
//  - crée la séquence si absente ;
//  - l'aligne sur le plus grand numéro déjà présent en base, ce qui la fait redescendre au dernier
//    numéro réel après une purge de demandes (pas de trou dans la numérotation visible du client).
export async function ensureAppRefSequence(): Promise<void> {
  await prisma.$executeRawUnsafe(`CREATE SEQUENCE IF NOT EXISTS ${SEQ}`);
  // setval(seq, valeur, is_called) : is_called=true → prochain nextval = valeur+1 ;
  // is_called=false (base vide) → prochain nextval = 1 (première référence = 0001).
  await prisma.$queryRawUnsafe(
    `SELECT setval('${SEQ}',
       GREATEST((SELECT COALESCE(MAX(CAST(SUBSTRING("appId" FROM '[0-9]+$') AS INTEGER)), 0) FROM "Application"), 1),
       (SELECT COUNT(*) > 0 FROM "Application"))`
  );
}

// Prochain numéro de référence, atomique et sans collision.
export async function nextAppNumber(): Promise<number> {
  const rows = await prisma.$queryRawUnsafe<Array<{ n: bigint }>>(`SELECT nextval('${SEQ}') AS n`);
  return Number(rows[0].n);
}
