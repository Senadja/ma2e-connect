import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { requireAuth, requirePermission } from '../middleware/auth';
import { slugify } from '../lib/slug';

export const articlesRouter = Router();

const blockSchema = z.object({
  type: z.enum(['p', 'h2', 'quote', 'list']),
  text: z.string().optional(),
  items: z.array(z.string()).optional(),
});

const articleSchema = z.object({
  title: z.string().min(3),
  excerpt: z.string().min(3),
  category: z.string().min(1),
  content: z.array(blockSchema).default([]),
  image: z.string().optional(),
  author: z.string().optional(),
  readTime: z.string().optional(),
  date: z.string().optional(),
  tags: z.array(z.string()).default([]),
  status: z.enum(['draft', 'published']).default('draft'),
});

// GET public — par défaut uniquement les articles publiés.
articlesRouter.get('/', async (req, res) => {
  const status = req.query.status as string | undefined;
  const where = status === 'all' ? {} : { status: status ?? 'published' };
  const articles = await prisma.article.findMany({ where, orderBy: { createdAt: 'desc' } });
  res.json(articles);
});

articlesRouter.get('/:slug', async (req, res) => {
  const article = await prisma.article.findUnique({ where: { slug: req.params.slug } });
  if (!article) return res.status(404).json({ error: 'Article introuvable' });
  res.json(article);
});

// Routes d'écriture — réservées aux profils disposant de la permission.
articlesRouter.use(requireAuth, requirePermission('news:write'));

async function uniqueSlug(base: string, ignoreId?: string): Promise<string> {
  let slug = base || 'article';
  let i = 1;
  // garantit l'unicité du slug
  while (true) {
    const found = await prisma.article.findUnique({ where: { slug } });
    if (!found || found.id === ignoreId) return slug;
    slug = `${base}-${++i}`;
  }
}

articlesRouter.post('/', async (req, res) => {
  const parsed = articleSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.issues[0].message });
  const d = parsed.data;
  const slug = await uniqueSlug(slugify(d.title));
  const article = await prisma.article.create({
    data: {
      ...d,
      slug,
      publishedAt: d.status === 'published' ? new Date() : null,
    },
  });
  res.status(201).json(article);
});

articlesRouter.put('/:id', async (req, res) => {
  const parsed = articleSchema.partial().safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.issues[0].message });
  const existing = await prisma.article.findUnique({ where: { id: req.params.id } });
  if (!existing) return res.status(404).json({ error: 'Article introuvable' });

  const d = parsed.data;
  const slug = d.title ? await uniqueSlug(slugify(d.title), existing.id) : existing.slug;
  const becomesPublished = d.status === 'published' && existing.status !== 'published';

  const article = await prisma.article.update({
    where: { id: req.params.id },
    data: {
      ...d,
      slug,
      publishedAt: becomesPublished ? new Date() : existing.publishedAt,
    },
  });
  res.json(article);
});

articlesRouter.delete('/:id', async (req, res) => {
  await prisma.article.delete({ where: { id: req.params.id } }).catch(() => null);
  res.status(204).end();
});
