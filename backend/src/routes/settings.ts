import { Router } from 'express';
import { z } from 'zod';
import nodemailer from 'nodemailer';
import { prisma } from '../lib/prisma';
import { env } from '../lib/env';
import { requireAuth, requirePermission } from '../middleware/auth';

export const settingsRouter = Router();

// Clés sensibles : jamais exposées publiquement (contiennent des secrets).
const PRIVATE_KEYS = new Set(['smtp']);

// GET public — réglages publics agrégés { key: value } (hors clés sensibles).
settingsRouter.get('/', async (_req, res) => {
  const rows = await prisma.setting.findMany();
  const out: Record<string, unknown> = {};
  for (const r of rows) if (!PRIVATE_KEYS.has(r.key)) out[r.key] = r.value;
  res.json(out);
});

settingsRouter.get('/:key', async (req, res) => {
  const key = String(req.params.key);
  if (PRIVATE_KEYS.has(key)) return res.status(403).json({ error: 'Réglage protégé' });
  const row = await prisma.setting.findUnique({ where: { key } });
  res.json(row?.value ?? null);
});

// ── Au-delà : réservé aux gestionnaires des paramètres ──
settingsRouter.use(requireAuth, requirePermission('settings:write'));

// Lecture admin d'une clé sensible (ex. smtp). /secure/:key = 2 segments, ne heurte pas /:key public.
settingsRouter.get('/secure/:key', async (req, res) => {
  const row = await prisma.setting.findUnique({ where: { key: String(req.params.key) } });
  res.json(row?.value ?? null);
});

// Envoi d'un e-mail de test pour valider la configuration SMTP.
// Utilise les valeurs envoyées (formulaire en cours, sans obligation d'enregistrer),
// avec repli sur le réglage déjà sauvegardé puis sur l'environnement.
const smtpTestSchema = z.object({
  to: z.string().email('Adresse de réception invalide'),
  host: z.string().optional(),
  port: z.coerce.number().int().positive().optional(),
  user: z.string().optional(),
  pass: z.string().optional(),
  secure: z.boolean().optional(),
  from: z.string().optional(),
});

settingsRouter.post('/smtp/test', async (req, res) => {
  const parsed = smtpTestSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0]?.message || 'Paramètres invalides' });
  }
  const b = parsed.data;
  const saved = ((await prisma.setting.findUnique({ where: { key: 'smtp' } }))?.value as Record<string, any>) || {};

  const host = b.host || saved.host;
  const port = b.port || Number(saved.port) || 587;
  const user = b.user || saved.user || undefined;
  const pass = b.pass || saved.pass || undefined;
  const secure = b.secure ?? saved.secure ?? port === 465;
  const from = b.from || saved.from || env.smtp.from;

  if (!host) return res.status(400).json({ error: 'Renseignez au moins le serveur (host) avant de tester.' });

  try {
    const transporter = nodemailer.createTransport({
      host,
      port,
      secure,
      auth: user ? { user, pass } : undefined,
      connectionTimeout: 10_000,
      greetingTimeout: 10_000,
      socketTimeout: 15_000,
    });
    await transporter.sendMail({
      from,
      to: b.to,
      subject: 'Test de configuration SMTP — site MA2E',
      text:
        `Cet e-mail confirme que la configuration SMTP du site MA2E fonctionne.\n\n` +
        `Serveur : ${host}:${port}\n` +
        `Sécurisé : ${secure ? 'oui (SSL/TLS)' : 'non (STARTTLS si disponible)'}\n` +
        `Authentifié : ${user ? 'oui' : 'non'}\n` +
        `Expéditeur : ${from}\n\n` +
        `Vous pouvez activer les notifications par e-mail en toute confiance.`,
    });
    return res.json({ ok: true });
  } catch (err) {
    return res.status(502).json({ error: `Envoi impossible : ${(err as Error).message}` });
  }
});

const schema = z.object({ value: z.any() });

// Met à jour (ou crée) un réglage par clé.
settingsRouter.put('/:key', async (req, res) => {
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Valeur invalide' });
  const key = String(req.params.key);
  const row = await prisma.setting.upsert({
    where: { key },
    update: { value: parsed.data.value },
    create: { key, value: parsed.data.value },
  });
  res.json({ key: row.key, value: row.value });
});
