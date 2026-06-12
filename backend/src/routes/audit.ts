import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { requireAuth, requirePermission } from '../middleware/auth';

export const auditRouter = Router();

// Consultation réservée aux administrateurs (gestion des utilisateurs).
auditRouter.use(requireAuth, requirePermission('users:manage'));

auditRouter.get('/', async (req, res) => {
  const take = Math.min(Number(req.query.limit) || 200, 500);
  const logs = await prisma.auditLog.findMany({ orderBy: { createdAt: 'desc' }, take });
  res.json(logs);
});
