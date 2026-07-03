import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { requireAuth, requirePermission } from '../middleware/auth';
import { publicWriteLimiter } from '../lib/rateLimit';
import { sendApplicationNotification } from '../lib/mailer';

export const contactRouter = Router();

const createSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional(),
  subject: z.string().optional(),
  message: z.string().min(5),
});

// POST public (rate-limité) — message de contact depuis le site.
contactRouter.post('/', publicWriteLimiter, async (req, res) => {
  const parsed = createSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.issues[0].message });
  const d = parsed.data;
  const msg = await prisma.contactMessage.create({
    data: { name: d.name, email: d.email, phone: d.phone, subject: d.subject, message: d.message },
  });
  // Réutilise le mailer (notification au service MA2E).
  void sendApplicationNotification({
    appId: `CONTACT-${msg.id.slice(0, 8)}`,
    category: 'contact',
    type: d.subject || 'Message de contact',
    name: d.name,
    matricule: '—',
    email: d.email,
    phone: d.phone || '—',
    data: { message: d.message },
  });
  res.status(201).json({ ok: true });
});

// Admin — boîte de réception.
contactRouter.use(requireAuth, requirePermission('contact:manage'));

contactRouter.get('/', async (_req, res) => {
  const messages = await prisma.contactMessage.findMany({ orderBy: { createdAt: 'desc' } });
  res.json(messages);
});

contactRouter.patch('/:id', async (req, res) => {
  const read = Boolean(req.body?.read);
  const m = await prisma.contactMessage
    .update({ where: { id: req.params.id }, data: { read } })
    .catch(() => null);
  if (!m) return res.status(404).json({ error: 'Message introuvable' });
  res.json(m);
});

contactRouter.delete('/:id', async (req, res) => {
  await prisma.contactMessage.delete({ where: { id: req.params.id } }).catch(() => null);
  res.status(204).end();
});
