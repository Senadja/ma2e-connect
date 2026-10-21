import { prisma } from './prisma';
import { docFilesOf, removeDocFiles } from './appDocs';

// Mécanismes DCP de la check-list de recette SD_PDCP :
//  - DEV-10 : droits d'accès, de rectification, d'effacement et de portabilité ;
//  - DEV-09 : conservation et purge des données en fin de durée de conservation.
//
// Deux endroits détiennent des données personnelles issues des formulaires publics :
// `Application` (adhésions et demandes de produit/service/renseignement, pièces jointes
// incluses) et `ContactMessage`. Les comptes du back-office (`User`) sont listés en
// lecture seule dans le dossier d'une personne : leur cycle de vie est géré dans
// « Utilisateurs », pas ici.

export const RETENTION_KEY = 'dcpRetention';

export interface Retention {
  // Durées en MOIS. null = non définie par MA2E → aucune purge possible sur cette source.
  applicationsMonths: number | null;
  contactMonths: number | null;
  auditMonths: number | null;
  // Interrupteur de la passe quotidienne. Faux par défaut : le mécanisme est livré
  // INACTIF, conformément au point d'attention de DEV-09 (ne rien supprimer avant que
  // MA2E ait validé les durées, cf. demande R07).
  autoPurge: boolean;
}

const EMPTY: Retention = {
  applicationsMonths: null,
  contactMonths: null,
  auditMonths: null,
  autoPurge: false,
};

// Borne volontairement large (1 mois à 50 ans) : c'est MA2E qui fixe les durées, on
// se contente de refuser les valeurs absurdes qui videraient la base par inadvertance.
function sanitizeMonths(v: unknown): number | null {
  const n = typeof v === 'number' ? v : typeof v === 'string' ? Number(v) : NaN;
  if (!Number.isFinite(n) || n < 1) return null;
  return Math.min(Math.floor(n), 600);
}

export function sanitizeRetention(raw: unknown): Retention {
  const o = (raw ?? {}) as Record<string, unknown>;
  return {
    applicationsMonths: sanitizeMonths(o.applicationsMonths),
    contactMonths: sanitizeMonths(o.contactMonths),
    auditMonths: sanitizeMonths(o.auditMonths),
    autoPurge: o.autoPurge === true,
  };
}

export async function readRetention(): Promise<Retention> {
  const row = await prisma.setting.findUnique({ where: { key: RETENTION_KEY } }).catch(() => null);
  if (!row) return EMPTY;
  return sanitizeRetention(row.value);
}

export async function writeRetention(value: Retention): Promise<Retention> {
  const clean = sanitizeRetention(value);
  await prisma.setting.upsert({
    where: { key: RETENTION_KEY },
    create: { key: RETENTION_KEY, value: clean as unknown as object },
    update: { value: clean as unknown as object },
  });
  return clean;
}

function monthsAgo(months: number): Date {
  const d = new Date();
  d.setMonth(d.getMonth() - months);
  return d;
}

export async function logDcpAction(entry: {
  kind: 'access' | 'portability' | 'rectification' | 'erasure' | 'purge';
  subject: string;
  actorEmail: string;
  details: Record<string, unknown>;
}) {
  // Une trace manquante ne doit jamais faire échouer l'opération demandée par la personne.
  await prisma.dcpAction
    .create({ data: { ...entry, details: entry.details as unknown as object } })
    .catch((e) => console.error('Échec écriture registre DCP:', (e as Error).message));
}

// --- Droit d'accès et portabilité : dossier complet d'une personne -------------------

export async function subjectDossier(q: string) {
  const term = q.trim();
  const like = { contains: term, mode: 'insensitive' as const };
  const [applications, contactMessages, accounts] = await Promise.all([
    prisma.application.findMany({
      where: { OR: [{ email: like }, { name: like }, { phone: like }, { matricule: like }, { appId: like }] },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.contactMessage.findMany({
      where: { OR: [{ email: like }, { name: like }, { phone: like }] },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.user.findMany({
      where: { OR: [{ email: like }, { name: like }] },
      select: { id: true, email: true, name: true, role: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
    }),
  ]);
  return { query: term, generatedAt: new Date().toISOString(), applications, contactMessages, accounts };
}

export type Dossier = Awaited<ReturnType<typeof subjectDossier>>;

function csvCell(v: unknown): string {
  const s =
    v === null || v === undefined
      ? ''
      : v instanceof Date
        ? v.toISOString()
        : typeof v === 'object'
          ? JSON.stringify(v)
          : String(v);
  // Guillemets doublés : format CSV standard (RFC 4180), relu tel quel par Excel/LibreOffice.
  return `"${s.replace(/"/g, '""')}"`;
}

// Portabilité : un CSV unique, une ligne par enregistrement, colonne `source` pour
// distinguer l'origine. Les champs propres à une seule source vont dans `details`.
export function dossierToCsv(d: Dossier): string {
  const header = [
    'source',
    'reference',
    'date',
    'nom',
    'email',
    'telephone',
    'matricule',
    'objet',
    'consentement_le',
    'consentement_version',
    'details',
  ];
  const rows: string[][] = [];
  for (const a of d.applications) {
    rows.push([
      'Demande',
      a.appId,
      a.createdAt.toISOString(),
      a.name,
      a.email,
      a.phone,
      a.matricule,
      `${a.category} — ${a.type}`,
      a.consentAt ? a.consentAt.toISOString() : '',
      a.consentVersion ?? '',
      JSON.stringify(a.data ?? {}),
    ]);
  }
  for (const m of d.contactMessages) {
    rows.push([
      'Message de contact',
      m.id,
      m.createdAt.toISOString(),
      m.name,
      m.email,
      m.phone ?? '',
      '',
      m.subject ?? '',
      m.consentAt ? m.consentAt.toISOString() : '',
      m.consentVersion ?? '',
      JSON.stringify({ message: m.message }),
    ]);
  }
  for (const u of d.accounts) {
    rows.push([
      'Compte back-office',
      u.id,
      u.createdAt.toISOString(),
      u.name,
      u.email,
      '',
      '',
      u.role,
      '',
      '',
      '',
    ]);
  }
  // BOM UTF-8 : sans lui, Excel sous Windows affiche « Ã© » à la place des accents.
  return '﻿' + [header, ...rows].map((r) => r.map(csvCell).join(';')).join('\r\n') + '\r\n';
}

// --- Droit à l'effacement -----------------------------------------------------------

const ANON = {
  name: '— (effacé)',
  matricule: '—',
  email: '',
  phone: '—',
} as const;

export interface EraseResult {
  mode: 'anonymize' | 'delete';
  applications: number;
  contactMessages: number;
  documents: number;
}

// Efface les enregistrements désignés.
//  - `anonymize` retire l'identité et les pièces jointes d'une demande, mais conserve la
//    ligne (catégorie, dates, statut) pour que les statistiques d'adhésion restent justes ;
//  - `delete` supprime la ligne.
// Un message de contact est toujours SUPPRIMÉ : anonymisé, il ne resterait qu'un texte
// libre sans valeur, susceptible de contenir des données personnelles résiduelles.
export async function eraseRecords(opts: {
  applicationIds: string[];
  contactIds: string[];
  mode: 'anonymize' | 'delete';
}): Promise<EraseResult> {
  const result: EraseResult = { mode: opts.mode, applications: 0, contactMessages: 0, documents: 0 };

  if (opts.applicationIds.length) {
    const rows = await prisma.application.findMany({
      where: { id: { in: opts.applicationIds } },
      select: { id: true, data: true },
    });
    for (const row of rows) {
      // Les pièces justificatives partent dans les deux modes : ce sont les données les
      // plus sensibles du dossier (pièces d'identité).
      result.documents += removeDocFiles(docFilesOf(row.data));
      if (opts.mode === 'delete') {
        await prisma.application.delete({ where: { id: row.id } });
      } else {
        await prisma.application.update({
          where: { id: row.id },
          data: { ...ANON, data: {}, anonymizedAt: new Date() },
        });
      }
      result.applications++;
    }
  }

  if (opts.contactIds.length) {
    const { count } = await prisma.contactMessage.deleteMany({ where: { id: { in: opts.contactIds } } });
    result.contactMessages = count;
  }

  return result;
}

// --- Conservation et purge (DEV-09) -------------------------------------------------

export interface RetentionReport {
  retention: Retention;
  // Faux tant qu'aucune durée n'est renseignée : la purge est alors refusée.
  configured: boolean;
  due: { applications: number; contactMessages: number; auditLogs: number };
  cutoffs: { applications: string | null; contactMessages: string | null; auditLogs: string | null };
}

export async function retentionReport(): Promise<RetentionReport> {
  const r = await readRetention();
  const appCut = r.applicationsMonths ? monthsAgo(r.applicationsMonths) : null;
  const contactCut = r.contactMonths ? monthsAgo(r.contactMonths) : null;
  const auditCut = r.auditMonths ? monthsAgo(r.auditMonths) : null;

  const [applications, contactMessages, auditLogs] = await Promise.all([
    appCut
      ? prisma.application.count({ where: { createdAt: { lt: appCut }, anonymizedAt: null } })
      : Promise.resolve(0),
    contactCut ? prisma.contactMessage.count({ where: { createdAt: { lt: contactCut } } }) : Promise.resolve(0),
    auditCut ? prisma.auditLog.count({ where: { createdAt: { lt: auditCut } } }) : Promise.resolve(0),
  ]);

  return {
    retention: r,
    configured: Boolean(appCut || contactCut || auditCut),
    due: { applications, contactMessages, auditLogs },
    cutoffs: {
      applications: appCut?.toISOString() ?? null,
      contactMessages: contactCut?.toISOString() ?? null,
      auditLogs: auditCut?.toISOString() ?? null,
    },
  };
}

export interface PurgeResult {
  applications: number;
  contactMessages: number;
  auditLogs: number;
  documents: number;
}

// Exécute la purge des enregistrements arrivés en fin de conservation.
// Les demandes sont ANONYMISÉES (on garde la ligne pour les statistiques), les messages de
// contact et les entrées du journal d'activité sont SUPPRIMÉS.
// Lève une erreur si aucune durée n'est renseignée : impossible de purger sans règle.
export async function runPurge(actorEmail: string): Promise<PurgeResult> {
  const report = await retentionReport();
  if (!report.configured) {
    throw Object.assign(new Error('Aucune durée de conservation définie : purge impossible.'), {
      statusCode: 409,
    });
  }

  const result: PurgeResult = { applications: 0, contactMessages: 0, auditLogs: 0, documents: 0 };

  if (report.cutoffs.applications) {
    const cut = new Date(report.cutoffs.applications);
    const rows = await prisma.application.findMany({
      where: { createdAt: { lt: cut }, anonymizedAt: null },
      select: { id: true, data: true },
    });
    for (const row of rows) {
      result.documents += removeDocFiles(docFilesOf(row.data));
      await prisma.application.update({
        where: { id: row.id },
        data: { ...ANON, data: {}, anonymizedAt: new Date() },
      });
      result.applications++;
    }
  }

  if (report.cutoffs.contactMessages) {
    const { count } = await prisma.contactMessage.deleteMany({
      where: { createdAt: { lt: new Date(report.cutoffs.contactMessages) } },
    });
    result.contactMessages = count;
  }

  if (report.cutoffs.auditLogs) {
    const { count } = await prisma.auditLog.deleteMany({
      where: { createdAt: { lt: new Date(report.cutoffs.auditLogs) } },
    });
    result.auditLogs = count;
  }

  await logDcpAction({
    kind: 'purge',
    subject: '—',
    actorEmail,
    details: { ...result, retention: report.retention, cutoffs: report.cutoffs },
  });

  return result;
}

// Passe de purge quotidienne. Ne fait RIEN tant que `autoPurge` n'est pas activé au
// back-office : le mécanisme est en place, inerte jusqu'à validation des durées par MA2E.
const DAY_MS = 24 * 60 * 60 * 1000;

export function scheduleRetentionPurge() {
  const tick = async () => {
    try {
      const r = await readRetention();
      if (!r.autoPurge) return;
      const res = await runPurge('purge automatique');
      if (res.applications || res.contactMessages || res.auditLogs) {
        console.log(
          `🧹 Purge DCP : ${res.applications} demande(s) anonymisée(s), ` +
            `${res.contactMessages} message(s) supprimé(s), ${res.auditLogs} entrée(s) de journal, ` +
            `${res.documents} pièce(s) effacée(s).`
        );
      }
    } catch (e) {
      console.error('Échec de la purge DCP automatique :', (e as Error).message);
    }
  };
  // Premier passage une minute après le démarrage (laisse la base se stabiliser), puis
  // toutes les 24 h. `unref` : ce minuteur ne doit pas empêcher le processus de s'arrêter.
  const first = setTimeout(() => {
    void tick();
    setInterval(() => void tick(), DAY_MS).unref();
  }, 60_000);
  first.unref();
}
