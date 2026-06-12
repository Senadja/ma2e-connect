import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { requireAuth, requirePermission } from '../middleware/auth';
import { slugify } from '../lib/slug';

export const productsRouter = Router();

const productSchema = z.object({
  type: z.enum(['epargne', 'credit', 'immobilier']),
  name: z.string().min(2),
  description: z.string().default(''),
  features: z.array(z.string()).default([]),
  meta: z.record(z.string(), z.any()).optional(),
  image: z.string().optional(),
  form: z.string().optional(),
  active: z.boolean().default(true),
  order: z.number().int().default(0),
});

// GET public — filtrable par type, uniquement les produits actifs.
productsRouter.get('/', async (req, res) => {
  const type = req.query.type as string | undefined;
  const includeInactive = req.query.all === 'true';
  const where: Record<string, unknown> = {};
  if (type) where.type = type;
  if (!includeInactive) where.active = true;
  const products = await prisma.product.findMany({
    where,
    orderBy: [{ type: 'asc' }, { order: 'asc' }],
  });
  res.json(products);
});

productsRouter.use(requireAuth, requirePermission('products:write'));

productsRouter.post('/', async (req, res) => {
  const parsed = productSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.issues[0].message });
  const d = parsed.data;
  const product = await prisma.product.create({
    data: { ...d, slug: slugify(d.name) },
  });
  res.status(201).json(product);
});

productsRouter.put('/:id', async (req, res) => {
  const parsed = productSchema.partial().safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.issues[0].message });
  const d = parsed.data;
  const data = { ...d, ...(d.name ? { slug: slugify(d.name) } : {}) };
  const product = await prisma.product
    .update({ where: { id: req.params.id }, data })
    .catch(() => null);
  if (!product) return res.status(404).json({ error: 'Produit introuvable' });
  res.json(product);
});

productsRouter.delete('/:id', async (req, res) => {
  await prisma.product.delete({ where: { id: req.params.id } }).catch(() => null);
  res.status(204).end();
});
