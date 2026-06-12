import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { requireAuth, requirePermission } from '../middleware/auth';

export const partnersRouter = Router();

partnersRouter.get('/', async (_req, res) => {
  const partners = await prisma.partner.findMany({ orderBy: [{ order: 'asc' }, { name: 'asc' }] });
  res.json(partners);
});

partnersRouter.use(requireAuth, requirePermission('partners:write'));

const schema = z.object({
  name: z.string().min(1),
  type: z.string().min(1),
  desc: z.string().default(''),
  logo: z.string().optional(),
  url: z.string().optional(),
  order: z.number().int().default(0),
});

partnersRouter.post('/', async (req, res) => {
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.issues[0].message });
  res.status(201).json(await prisma.partner.create({ data: parsed.data }));
});

partnersRouter.put('/:id', async (req, res) => {
  const parsed = schema.partial().safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.issues[0].message });
  const p = await prisma.partner.update({ where: { id: req.params.id }, data: parsed.data }).catch(() => null);
  if (!p) return res.status(404).json({ error: 'Partenaire introuvable' });
  res.json(p);
});

partnersRouter.delete('/:id', async (req, res) => {
  await prisma.partner.delete({ where: { id: req.params.id } }).catch(() => null);
  res.status(204).end();
});
