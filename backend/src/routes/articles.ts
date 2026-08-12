import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { requireAuth, requirePermission, optionalAuth } from '../middleware/auth';
import { slugify } from '../lib/slug';

export const articlesRouter = Router();

const blockSchema = z.object({
  type: z.enum(['p', 'h2', 'quote', 'list', 'gallery']),
  text: z.string().optional(),
  items: z.array(z.string()).optional(), // 'list' = puces texte ; 'gallery' = chemins d'images
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

// Schéma d'update SANS .default() : évite qu'un PUT partiel réinjecte content=[]/tags=[]/status=draft
// (perte de données / dépublication silencieuse sous Zod v4).
const articleUpdateSchema = z.object({
  title: z.string().min(3).optional(),
  excerpt: z.string().min(3).optional(),
  category: z.string().min(1).optional(),
  content: z.array(blockSchema).optional(),
  image: z.string().optional(),
  author: z.string().optional(),
  readTime: z.string().optional(),
  date: z.string().optional(),
  tags: z.array(z.string()).optional(),
  status: z.enum(['draft', 'published']).optional(),
});

// GET public — ne renvoie QUE les articles publiés. Les brouillons (status/all) ne sont visibles
// qu'aux rédacteurs authentifiés (optionalAuth) : sinon un simple ?status=draft les divulguerait.
articlesRouter.get('/', optionalAuth, async (req, res) => {
  const canSeeAll = !!req.user && (req.user.role.toLowerCase() === 'admin' || (req.user.permissions || []).includes('news:write'));
  const status = req.query.status !== undefined ? String(req.query.status) : undefined;
  const where = canSeeAll ? (status && status !== 'all' ? { status } : {}) : { status: 'published' };
  const articles = await prisma.article.findMany({ where, orderBy: { createdAt: 'desc' } });
  res.json(articles);
});

// Sécurité (audit GS2E #3) : un brouillon ne doit pas fuiter par son slug (dérivé du titre,
// donc devinable). Seul un admin ou un rédacteur authentifié peut le consulter ; sinon 404
// (pas 403, pour ne pas confirmer son existence).
articlesRouter.get('/:slug', optionalAuth, async (req, res) => {
  const article = await prisma.article.findUnique({ where: { slug: String(req.params.slug) } });
  if (!article) return res.status(404).json({ error: 'Article introuvable' });
  const canSeeAll = !!req.user && (req.user.role.toLowerCase() === 'admin' || (req.user.permissions || []).includes('news:write'));
  if (article.status !== 'published' && !canSeeAll) {
    return res.status(404).json({ error: 'Article introuvable' });
  }
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
  const parsed = articleUpdateSchema.safeParse(req.body);
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
