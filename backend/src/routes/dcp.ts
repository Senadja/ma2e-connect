import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { requireAuth, requireRole } from '../middleware/auth';
import { sendErasureConfirmation } from '../lib/mailer';
import {
  dossierToCsv,
  eraseRecords,
  logDcpAction,
  retentionReport,
  runPurge,
  subjectDossier,
  writeRetention,
} from '../lib/dcp';

export const dcpRouter = Router();

// Droits des personnes et conservation des données : réservé aux ADMINISTRATEURS.
// DEV-10 prévoit explicitement des mécanismes « opérés par un administrateur habilité » ;
// un éditeur, même avec `applications:manage`, n'a pas à effacer des données.
dcpRouter.use(requireAuth, requireRole('admin'));

const querySchema = z.object({ q: z.string().trim().min(2, 'Saisissez au moins 2 caractères.') });

// Droit d'accès — dossier complet d'une personne (JSON).
dcpRouter.get('/subject', async (req, res) => {
  const parsed = querySchema.safeParse({ q: req.query.q ?? '' });
  if (!parsed.success) return res.status(400).json({ error: parsed.error.issues[0].message });
  const dossier = await subjectDossier(parsed.data.q);
  await logDcpAction({
    kind: 'access',
    subject: parsed.data.q,
    actorEmail: req.user!.email,
    details: {
      applications: dossier.applications.length,
      contactMessages: dossier.contactMessages.length,
      accounts: dossier.accounts.length,
    },
  });
  res.json(dossier);
});

// Droit à la portabilité — même dossier, format réutilisable (CSV ; le JSON ci-dessus
// couvre l'autre format demandé par SD_PDCP).
dcpRouter.get('/subject.csv', async (req, res) => {
  const parsed = querySchema.safeParse({ q: req.query.q ?? '' });
  if (!parsed.success) return res.status(400).json({ error: parsed.error.issues[0].message });
  const dossier = await subjectDossier(parsed.data.q);
  await logDcpAction({
    kind: 'portability',
    subject: parsed.data.q,
    actorEmail: req.user!.email,
    details: { format: 'csv', applications: dossier.applications.length, contactMessages: dossier.contactMessages.length },
  });
  const safe = parsed.data.q.replace(/[^A-Za-z0-9._@-]/g, '_').slice(0, 60);
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="dcp-${safe}.csv"`);
  res.send(dossierToCsv(dossier));
});

// Droit de rectification — correction des données d'identité d'un enregistrement.
// Volontairement limité à l'identité : le contenu d'une demande (montants, pièces) relève
// de la gestion du dossier, pas de la rectification DCP.
const rectifySchema = z
  .object({
    name: z.string().trim().min(2).max(120).optional(),
    email: z.string().trim().email().or(z.literal('')).optional(),
    phone: z.string().trim().min(6).max(40).optional(),
    matricule: z.string().trim().min(1).max(60).optional(),
  })
  .refine((o) => Object.keys(o).length > 0, { error: 'Aucune donnée à rectifier.' });

dcpRouter.patch('/application/:id', async (req, res) => {
  const parsed = rectifySchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.issues[0].message });
  const before = await prisma.application.findUnique({ where: { id: req.params.id } });
  if (!before) return res.status(404).json({ error: 'Demande introuvable' });
  const after = await prisma.application.update({ where: { id: req.params.id }, data: parsed.data });
  await logDcpAction({
    kind: 'rectification',
    subject: before.email || before.name,
    actorEmail: req.user!.email,
    details: { source: 'application', appId: before.appId, champs: Object.keys(parsed.data) },
  });
  res.json(after);
});

dcpRouter.patch('/contact/:id', async (req, res) => {
  // Un message de contact n'a pas de matricule : on retire le champ s'il est fourni.
  const parsed = rectifySchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.issues[0].message });
  const { matricule: _ignored, ...data } = parsed.data;
  if (Object.keys(data).length === 0) return res.status(400).json({ error: 'Aucune donnée à rectifier.' });
  const before = await prisma.contactMessage.findUnique({ where: { id: req.params.id } });
  if (!before) return res.status(404).json({ error: 'Message introuvable' });
  const after = await prisma.contactMessage.update({ where: { id: req.params.id }, data });
  await logDcpAction({
    kind: 'rectification',
    subject: before.email || before.name,
    actorEmail: req.user!.email,
    details: { source: 'contactMessage', id: before.id, champs: Object.keys(data) },
  });
  res.json(after);
});

// Droit à l'effacement — sur des identifiants explicitement désignés par l'administrateur
// (jamais « tout ce qui ressemble à ce nom ») : l'homonymie ne doit pas détruire le dossier
// d'un tiers.
const eraseSchema = z.object({
  subject: z.string().trim().min(2),
  applicationIds: z.array(z.string().uuid()).default([]),
  contactIds: z.array(z.string().uuid()).default([]),
  mode: z.enum(['anonymize', 'delete']).default('anonymize'),
  // Confirmation à la personne concernée (exigée par DEV-10, mais inutile si l'on ne
  // dispose pas d'une adresse e-mail valide).
  notify: z.boolean().default(false),
  notifyEmail: z.string().trim().email().optional(),
  notifyName: z.string().trim().min(1).optional(),
  reason: z.string().trim().max(500).optional(),
});

dcpRouter.post('/erase', async (req, res) => {
  const parsed = eraseSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.issues[0].message });
  const d = parsed.data;
  if (d.applicationIds.length === 0 && d.contactIds.length === 0) {
    return res.status(400).json({ error: 'Aucun enregistrement sélectionné.' });
  }
  if (d.notify && !d.notifyEmail) {
    return res.status(400).json({ error: 'Adresse e-mail requise pour confirmer l\'effacement à la personne.' });
  }

  const result = await eraseRecords({
    applicationIds: d.applicationIds,
    contactIds: d.contactIds,
    mode: d.mode,
  });

  await logDcpAction({
    kind: 'erasure',
    subject: d.subject,
    actorEmail: req.user!.email,
    details: { ...result, motif: d.reason ?? null, notifie: d.notify },
  });

  // Envoi non bloquant : l'effacement est déjà effectif, un SMTP indisponible ne doit pas
  // transformer une opération réussie en erreur.
  if (d.notify && d.notifyEmail) {
    void sendErasureConfirmation({
      email: d.notifyEmail,
      name: d.notifyName || d.subject,
      applications: result.applications,
      contactMessages: result.contactMessages,
      mode: result.mode,
    });
  }

  res.json(result);
});

// --- Conservation et purge (DEV-09) -------------------------------------------------

dcpRouter.get('/retention', async (_req, res) => {
  res.json(await retentionReport());
});

const retentionSchema = z.object({
  applicationsMonths: z.number().int().min(1).max(600).nullable().default(null),
  contactMonths: z.number().int().min(1).max(600).nullable().default(null),
  auditMonths: z.number().int().min(1).max(600).nullable().default(null),
  autoPurge: z.boolean().default(false),
});

dcpRouter.put('/retention', async (req, res) => {
  const parsed = retentionSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.issues[0].message });
  await writeRetention(parsed.data);
  res.json(await retentionReport());
});

dcpRouter.post('/purge', async (req, res) => {
  try {
    res.json(await runPurge(req.user!.email));
  } catch (e) {
    const status = (e as { statusCode?: number }).statusCode ?? 500;
    res.status(status).json({ error: (e as Error).message });
  }
});

// Registre des opérations DCP (preuve de traçabilité pour SD_PDCP).
dcpRouter.get('/actions', async (_req, res) => {
  const actions = await prisma.dcpAction.findMany({ orderBy: { createdAt: 'desc' }, take: 200 });
  res.json(actions);
});
