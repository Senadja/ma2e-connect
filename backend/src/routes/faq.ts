import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { requireAuth, requirePermission } from '../middleware/auth';

export const faqRouter = Router();

// GET public — toutes les questions (triées par catégorie puis ordre).
faqRouter.get('/', async (req, res) => {
  const category = req.query.category as string | undefined;
  const where = category ? { category } : {};
  const items = await prisma.faqItem.findMany({
    where,
    orderBy: [{ category: 'asc' }, { order: 'asc' }],
  });
  res.json(items);
});

faqRouter.use(requireAuth, requirePermission('faq:write'));

const schema = z.object({
  category: z.string().min(1),
  question: z.string().min(3),
  answer: z.string().min(3),
  order: z.number().int().default(0),
});

faqRouter.post('/', async (req, res) => {
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.issues[0].message });
  const item = await prisma.faqItem.create({ data: parsed.data });
  res.status(201).json(item);
});

faqRouter.put('/:id', async (req, res) => {
  const parsed = schema.partial().safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.issues[0].message });
  const item = await prisma.faqItem
    .update({ where: { id: req.params.id }, data: parsed.data })
    .catch(() => null);
  if (!item) return res.status(404).json({ error: 'Question introuvable' });
  res.json(item);
});

faqRouter.delete('/:id', async (req, res) => {
  await prisma.faqItem.delete({ where: { id: req.params.id } }).catch(() => null);
  res.status(204).end();
});
