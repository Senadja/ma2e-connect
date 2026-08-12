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
// Sécurité (audit GS2E #2) : les secrets ne sont JAMAIS renvoyés en clair. Le mot de passe SMTP
// est en écriture seule — on n'expose que sa présence via `hasPass`.
settingsRouter.get('/secure/:key', async (req, res) => {
  const key = String(req.params.key);
  const row = await prisma.setting.findUnique({ where: { key } });
  const value = row?.value ?? null;
  if (key === 'smtp' && value && typeof value === 'object') {
    const { pass, ...safe } = value as Record<string, unknown>;
    return res.json({ ...safe, hasPass: !!pass });
  }
  res.json(value);
});

// Envoi d'un e-mail de test pour valider la configuration SMTP.
// Sécurité (audit GS2E #1 — SSRF/usurpation/relais) : aucune donnée de la requête n'est utilisée.
// La connexion provient UNIQUEMENT de la config enregistrée côté serveur (clé « smtp », repli sur
// l'environnement), et le destinataire est FORCÉ à l'adresse du compte connecté (req.user.email) —
// impossible d'envoyer un test à une adresse arbitraire. Cela supprime le SSRF, l'usurpation
// d'expéditeur et le relais de courrier. Conséquence UX : enregistrer la configuration avant de la tester.
settingsRouter.post('/smtp/test', async (req, res) => {
  const to = req.user?.email;
  if (!to) return res.status(400).json({ error: 'Aucune adresse e-mail associée à votre compte.' });

  const saved = ((await prisma.setting.findUnique({ where: { key: 'smtp' } }))?.value as Record<string, any>) || {};

  const host = saved.host || env.smtp.host;
  const port = Number(saved.port) || env.smtp.port || 587;
  const user = saved.user || env.smtp.user || undefined;
  const pass = saved.pass || env.smtp.pass || undefined;
  const secure = saved.secure ?? port === 465;
  const from = saved.from || env.smtp.from;

  if (!host) return res.status(400).json({ error: 'Enregistrez la configuration SMTP (serveur/host) avant de la tester.' });

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
      to,
      subject: 'Test de configuration SMTP — site MA2E',
      // Message minimal : ne divulgue aucun détail technique (serveur, port, expéditeur…).
      text:
        'Cet e-mail confirme que la configuration SMTP du site MA2E fonctionne.\n\n' +
        'Vous pouvez activer les notifications par e-mail en toute confiance.',
    });
    return res.json({ ok: true, to });
  } catch (err) {
    return res.status(502).json({ error: `Envoi impossible : ${(err as Error).message}` });
  }
});

const schema = z.object({ value: z.any() });

// Retire le mot de passe d'une valeur SMTP et le remplace par un indicateur de présence.
function stripSmtpSecret(value: unknown): unknown {
  if (!value || typeof value !== 'object') return value;
  const { pass, ...safe } = value as Record<string, unknown>;
  return { ...safe, hasPass: !!pass };
}

// Met à jour (ou crée) un réglage par clé.
settingsRouter.put('/:key', async (req, res) => {
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Valeur invalide' });
  const key = String(req.params.key);
  let value = parsed.data.value;

  // Sécurité (audit GS2E #2) : le mot de passe SMTP est en écriture seule côté client. Le
  // formulaire ne le renvoie pas (champ vide) — on conserve alors celui déjà enregistré au lieu
  // de l'effacer, et on retire l'indicateur d'affichage `hasPass` avant de persister.
  if (key === 'smtp' && value && typeof value === 'object') {
    const incoming = { ...(value as Record<string, unknown>) };
    delete incoming.hasPass;
    if (!incoming.pass) {
      const existing = (await prisma.setting.findUnique({ where: { key } }))?.value as Record<string, unknown> | undefined;
      if (existing?.pass) incoming.pass = existing.pass;
      else delete incoming.pass;
    }
    value = incoming;
  }

  const row = await prisma.setting.upsert({
    where: { key },
    update: { value },
    create: { key, value },
  });
  res.json({ key: row.key, value: key === 'smtp' ? stripSmtpSecret(row.value) : row.value });
});
