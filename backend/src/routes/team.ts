import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { requireAuth, requirePermission } from '../middleware/auth';

export const teamRouter = Router();

teamRouter.get('/', async (_req, res) => {
  const team = await prisma.teamMember.findMany({ orderBy: [{ order: 'asc' }] });
  res.json(team);
});

teamRouter.use(requireAuth, requirePermission('team:write'));

const schema = z.object({
  name: z.string().min(1),
  role: z.string().min(1),
  initials: z.string().min(1).max(4),
  photo: z.string().optional(),
  category: z.string().default('Gouvernance'),
  order: z.number().int().default(0),
});

// Update sans .default() : évite d'écraser category/order sur un PUT partiel (Zod v4).
const updateSchema = z.object({
  name: z.string().min(1).optional(),
  role: z.string().min(1).optional(),
  initials: z.string().min(1).max(4).optional(),
  photo: z.string().optional(),
  category: z.string().optional(),
  order: z.number().int().optional(),
});

teamRouter.post('/', async (req, res) => {
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.issues[0].message });
  res.status(201).json(await prisma.teamMember.create({ data: parsed.data }));
});

teamRouter.put('/:id', async (req, res) => {
  const parsed = updateSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.issues[0].message });
  const m = await prisma.teamMember.update({ where: { id: req.params.id }, data: parsed.data }).catch(() => null);
  if (!m) return res.status(404).json({ error: 'Membre introuvable' });
  res.json(m);
});

teamRouter.delete('/:id', async (req, res) => {
  await prisma.teamMember.delete({ where: { id: req.params.id } }).catch(() => null);
  res.status(204).end();
});
