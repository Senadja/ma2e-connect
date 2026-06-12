import { Router } from 'express';
import { z } from 'zod';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { prisma } from '../lib/prisma';
import { requireAuth, requirePermission } from '../middleware/auth';
import { sendApplicationNotification, sendApplicationDecision } from '../lib/mailer';

export const applicationsRouter = Router();

// --- Upload PUBLIC des pièces jointes d'une demande (le formulaire est public) ---
const UPLOAD_DIR = process.env.UPLOAD_DIR
  ? path.resolve(process.env.UPLOAD_DIR)
  : path.resolve(__dirname, '../../../public/documents/uploads');
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const ALLOWED_EXT = new Set(['.pdf', '.jpg', '.jpeg', '.png', '.doc', '.docx']);
const docStorage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
  filename: (_req, file, cb) => {
    const safe = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
    cb(null, `${Date.now()}-${safe}`);
  },
});
const docUpload = multer({
  storage: docStorage,
  limits: { fileSize: 8 * 1024 * 1024 }, // 8 Mo max par pièce
  fileFilter: (_req, file, cb) => cb(null, ALLOWED_EXT.has(path.extname(file.originalname).toLowerCase())),
});

// Public : reçoit une pièce justificative et renvoie son chemin (rattaché à la demande ensuite).
applicationsRouter.post('/documents', docUpload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'Fichier requis (PDF, image ou Word, 8 Mo max).' });
  res.status(201).json({ path: `/documents/uploads/${req.file.filename}`, name: req.file.originalname });
});

const createSchema = z.object({
  category: z.string().min(1), // épargne | crédit | immobilier | adhésion
  type: z.string().min(1), // produit précis ou "adhésion"
  name: z.string().min(3),
  matricule: z.string().min(1).default('—'),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().min(6),
  data: z.record(z.string(), z.any()).default({}),
});

// Génère une référence lisible : MA2E-2026-0001
async function nextAppId(): Promise<string> {
  const year = new Date().getFullYear();
  const count = await prisma.application.count();
  return `MA2E-${year}-${String(count + 1).padStart(4, '0')}`;
}

// POST public — réception d'une demande depuis le site.
applicationsRouter.post('/', async (req, res) => {
  const parsed = createSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0].message });
  }
  const d = parsed.data;
  const appId = await nextAppId();

  const application = await prisma.application.create({
    data: {
      appId,
      category: d.category,
      type: d.type,
      name: d.name,
      matricule: d.matricule,
      email: d.email || '',
      phone: d.phone,
      data: d.data,
    },
  });

  // Notification e-mail (non bloquante).
  void sendApplicationNotification({
    appId,
    category: d.category,
    type: d.type,
    name: d.name,
    matricule: d.matricule,
    email: d.email || '',
    phone: d.phone,
    data: d.data,
  });

  res.status(201).json({ appId: application.appId, id: application.id });
});

// Routes admin — lecture & gestion des demandes.
applicationsRouter.use(requireAuth, requirePermission('applications:manage'));

applicationsRouter.get('/', async (req, res) => {
  const status = req.query.status as string | undefined;
  const where = status && status !== 'all' ? { status: status as any } : {};
  const applications = await prisma.application.findMany({
    where,
    orderBy: { createdAt: 'desc' },
  });
  res.json(applications);
});

const patchSchema = z.object({
  status: z.enum(['PENDING', 'REVIEWING', 'APPROVED', 'REJECTED']).optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH']).optional(),
  reason: z.string().trim().max(2000).optional(),
});

applicationsRouter.patch('/:id', async (req, res) => {
  const parsed = patchSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.issues[0].message });
  const { status, priority, reason } = parsed.data;

  // Règle métier : un refus doit être motivé.
  if (status === 'REJECTED' && (!reason || reason.trim().length < 3)) {
    return res.status(400).json({ error: 'Un motif est requis pour rejeter une demande.' });
  }

  const existing = await prisma.application.findUnique({ where: { id: req.params.id } });
  if (!existing) return res.status(404).json({ error: 'Demande introuvable' });

  const data: Record<string, unknown> = {};
  if (priority) data.priority = priority;
  if (status) {
    data.status = status;
    const isDecision = status === 'APPROVED' || status === 'REJECTED';
    if (isDecision) {
      data.decisionReason = reason?.trim() || null;
      data.decidedAt = new Date();
      data.decidedBy = req.user?.email ?? null;
    } else {
      // Retour à un état non décidé : on efface la décision précédente.
      data.decisionReason = null;
      data.decidedAt = null;
      data.decidedBy = null;
    }
  } else if (reason !== undefined) {
    // Mise à jour du motif seul (note interne) sans changement de statut.
    data.decisionReason = reason.trim() || null;
  }

  const application = await prisma.application.update({ where: { id: req.params.id }, data });

  // Notification au demandeur lors d'une décision (non bloquante).
  if (status === 'APPROVED' || status === 'REJECTED') {
    void sendApplicationDecision({
      appId: application.appId,
      category: application.category,
      type: application.type,
      name: application.name,
      email: application.email,
      status,
      reason: application.decisionReason ?? undefined,
    });
  }

  res.json(application);
});
