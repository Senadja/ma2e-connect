import { Router } from 'express';
import bcrypt from 'bcrypt';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { requireAuth, requirePermission } from '../middleware/auth';
import { PERMISSIONS, PROFILES } from '../lib/permissions';

export const usersRouter = Router();

const SELECT = { id: true, email: true, name: true, role: true, permissions: true, createdAt: true };

usersRouter.use(requireAuth, requirePermission('users:manage'));

// Métadonnées pour l'UI (liste des permissions et profils prédéfinis).
usersRouter.get('/meta', (_req, res) => {
  res.json({ permissions: PERMISSIONS, profiles: PROFILES });
});

usersRouter.get('/', async (_req, res) => {
  const users = await prisma.user.findMany({ select: SELECT, orderBy: { createdAt: 'asc' } });
  res.json(users);
});

const createSchema = z.object({
  email: z.string().email(),
  name: z.string().min(2),
  password: z.string().min(6, 'Mot de passe : 6 caractères minimum'),
  role: z.enum(['USER', 'EDITOR', 'ADMIN']).default('EDITOR'),
  permissions: z.array(z.string()).default([]),
});

usersRouter.post('/', async (req, res) => {
  const parsed = createSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.issues[0].message });
  const d = parsed.data;
  const exists = await prisma.user.findUnique({ where: { email: d.email } });
  if (exists) return res.status(409).json({ error: 'Cet email est déjà utilisé' });
  const password = await bcrypt.hash(d.password, 10);
  const user = await prisma.user.create({
    data: { email: d.email, name: d.name, password, role: d.role, permissions: d.permissions },
    select: SELECT,
  });
  res.status(201).json(user);
});

const updateSchema = z.object({
  name: z.string().min(2).optional(),
  password: z.string().min(6).optional(),
  role: z.enum(['USER', 'EDITOR', 'ADMIN']).optional(),
  permissions: z.array(z.string()).optional(),
});

usersRouter.put('/:id', async (req, res) => {
  const parsed = updateSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.issues[0].message });
  const d = parsed.data;
  const data: Record<string, unknown> = {};
  if (d.name !== undefined) data.name = d.name;
  if (d.role !== undefined) data.role = d.role;
  if (d.permissions !== undefined) data.permissions = d.permissions;
  if (d.password) data.password = await bcrypt.hash(d.password, 10);
  const user = await prisma.user
    .update({ where: { id: req.params.id }, data, select: SELECT })
    .catch(() => null);
  if (!user) return res.status(404).json({ error: 'Utilisateur introuvable' });
  res.json(user);
});

usersRouter.delete('/:id', async (req, res) => {
  if (req.params.id === req.user!.id) {
    return res.status(400).json({ error: 'Vous ne pouvez pas supprimer votre propre compte' });
  }
  // Empêche la suppression du dernier administrateur.
  const target = await prisma.user.findUnique({ where: { id: req.params.id } });
  if (target?.role === 'ADMIN') {
    const admins = await prisma.user.count({ where: { role: 'ADMIN' } });
    if (admins <= 1) return res.status(400).json({ error: 'Impossible de supprimer le dernier administrateur' });
  }
  await prisma.user.delete({ where: { id: req.params.id } }).catch(() => null);
  res.status(204).end();
});
