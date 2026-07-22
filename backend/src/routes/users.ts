import { Router } from 'express';
import bcrypt from 'bcrypt';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { requireAuth, requirePermission } from '../middleware/auth';
import { PERMISSIONS, PROFILES } from '../lib/permissions';
import { sendStaffWelcome } from '../lib/mailer';

export const usersRouter = Router();

const SELECT = { id: true, email: true, name: true, role: true, permissions: true, createdAt: true };

const ROLE_LABELS: Record<string, string> = { ADMIN: 'Administrateur', EDITOR: 'Éditeur', USER: 'Utilisateur' };

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

// Seul un ADMIN peut créer/promouvoir un ADMIN ou déléguer la permission users:manage.
function grantsAdminPower(role?: string, permissions?: string[]): boolean {
  return role === 'ADMIN' || !!permissions?.includes('users:manage');
}

usersRouter.post('/', async (req, res) => {
  const parsed = createSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.issues[0].message });
  const d = parsed.data;
  if (grantsAdminPower(d.role, d.permissions) && req.user!.role.toLowerCase() !== 'admin') {
    return res.status(403).json({ error: 'Seul un administrateur peut accorder le rôle ADMIN ou la permission users:manage.' });
  }
  const exists = await prisma.user.findUnique({ where: { email: d.email } });
  if (exists) return res.status(409).json({ error: 'Cet email est déjà utilisé' });
  const password = await bcrypt.hash(d.password, 10);
  const user = await prisma.user.create({
    data: { email: d.email, name: d.name, password, role: d.role, permissions: d.permissions },
    select: SELECT,
  });
  // Mail de bienvenue, non bloquant : un échec d'envoi ne doit pas annuler la création
  // (la fonction avale ses propres erreurs, d'où le fire-and-forget).
  void sendStaffWelcome(user.email, user.name, ROLE_LABELS[user.role] ?? user.role);
  res.status(201).json(user);
});

const updateSchema = z.object({
  // L'e-mail est l'identifiant de connexion ET l'adresse qui reçoit le code à 6 chiffres :
  // le modifier ré-aiguille la double authentification. Réservé à la gestion des comptes
  // (utile quand un éditeur change de boîte ou lors d'un changement de personnel côté admin).
  email: z.string().email().optional(),
  name: z.string().min(2).optional(),
  password: z.string().min(6).optional(),
  role: z.enum(['USER', 'EDITOR', 'ADMIN']).optional(),
  permissions: z.array(z.string()).optional(),
});

usersRouter.put('/:id', async (req, res) => {
  const parsed = updateSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.issues[0].message });
  const d = parsed.data;
  // Anti-escalade : seul un ADMIN peut octroyer le rôle ADMIN / la permission users:manage.
  if (grantsAdminPower(d.role, d.permissions) && req.user!.role.toLowerCase() !== 'admin') {
    return res.status(403).json({ error: 'Seul un administrateur peut accorder le rôle ADMIN ou la permission users:manage.' });
  }
  // Anti auto-promotion : on ne modifie pas son propre rôle ni ses propres permissions.
  if (req.params.id === req.user!.id && (d.role !== undefined || d.permissions !== undefined)) {
    return res.status(400).json({ error: 'Vous ne pouvez pas modifier votre propre rôle ou vos permissions.' });
  }
  // Un compte détenant des pouvoirs admin (rôle ADMIN ou users:manage) ne peut être modifié
  // — y compris son mot de passe — que par un ADMIN (sinon un non-admin users:manage réinitialiserait
  // le mot de passe d'un admin puis se connecterait à sa place).
  const target = await prisma.user.findUnique({ where: { id: req.params.id } });
  if (!target) return res.status(404).json({ error: 'Utilisateur introuvable' });
  if (grantsAdminPower(target.role, target.permissions) && req.user!.role.toLowerCase() !== 'admin') {
    return res.status(403).json({ error: 'Seul un administrateur peut modifier un compte administrateur.' });
  }
  // Changement d'e-mail : refuse si l'adresse est déjà portée par un AUTRE compte
  // (un e-mail inchangé retombe sur la cible elle-même et reste autorisé).
  if (d.email !== undefined && d.email !== target.email) {
    const clash = await prisma.user.findUnique({ where: { email: d.email } });
    if (clash) return res.status(409).json({ error: 'Cet email est déjà utilisé' });
  }
  const data: Record<string, unknown> = {};
  if (d.email !== undefined) data.email = d.email;
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
