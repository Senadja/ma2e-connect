import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
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
