import { Router } from 'express';
import { z } from 'zod';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { prisma } from '../lib/prisma';
import { requireAuth, requirePermission } from '../middleware/auth';
import { publicWriteLimiter } from '../lib/rateLimit';
import { signDoc, verifyDoc } from '../lib/docSign';
import { sendApplicationNotification, sendApplicationDecision } from '../lib/mailer';

export const applicationsRouter = Router();

// --- Pièces justificatives (CNI, passeport, photo) : données personnelles SENSIBLES ---
// Stockées dans un dossier PRIVÉ (jamais servi par l'express.static public de app.ts) et
// accessibles uniquement via une URL signée à durée limitée (voir GET /documents/:file).
const PUBLIC_UPLOAD_DIR = process.env.UPLOAD_DIR
  ? path.resolve(process.env.UPLOAD_DIR)
  : path.resolve(__dirname, '../../../public/documents/uploads');
const APP_DOCS_DIR = process.env.APP_DOCS_DIR
  ? path.resolve(process.env.APP_DOCS_DIR)
  : path.resolve(PUBLIC_UPLOAD_DIR, '..', 'app-docs');
fs.mkdirSync(APP_DOCS_DIR, { recursive: true });

const ALLOWED_EXT = new Set(['.pdf', '.jpg', '.jpeg', '.png', '.doc', '.docx']);
const DOC_FILE_RE = /^[A-Za-z0-9._-]+$/;
const docStorage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, APP_DOCS_DIR),
  // Nom NON devinable (pas d'énumération de masse) : UUID + extension d'origine validée.
  filename: (_req, file, cb) => cb(null, `${crypto.randomUUID()}${path.extname(file.originalname).toLowerCase()}`),
});
const docUpload = multer({
  storage: docStorage,
  limits: { fileSize: 8 * 1024 * 1024 }, // 8 Mo max par pièce
  fileFilter: (_req, file, cb) => cb(null, ALLOWED_EXT.has(path.extname(file.originalname).toLowerCase())),
});

// Public (rate-limité) : reçoit une pièce et renvoie une référence d'API (non résolvable sans signature).
applicationsRouter.post('/documents', publicWriteLimiter, docUpload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'Fichier requis (PDF, image ou Word, 8 Mo max).' });
  res.status(201).json({ path: `/api/applications/documents/${req.file.filename}`, name: req.file.originalname });
});

// Sert une pièce justificative UNIQUEMENT avec une signature valide et non expirée
// (fournie à l'admin authentifié par GET /). Bloque tout accès public/IDOR aux pièces d'identité.
applicationsRouter.get('/documents/:file', (req, res) => {
  const file = req.params.file;
  if (!DOC_FILE_RE.test(file) || file.includes('..')) {
    return res.status(400).json({ error: 'Nom de fichier invalide' });
  }
  if (!verifyDoc(file, String(req.query.e ?? ''), String(req.query.s ?? ''))) {
    return res.status(403).json({ error: 'Lien expiré ou invalide' });
  }
  const full = path.join(APP_DOCS_DIR, file);
  if (!full.startsWith(APP_DOCS_DIR + path.sep)) {
    return res.status(400).json({ error: 'Chemin invalide' });
  }
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.sendFile(full, (err) => {
    if (err && !res.headersSent) res.status(404).json({ error: 'Fichier introuvable' });
  });
});

// Ajoute une signature courte aux chemins des pièces d'une demande (nouveau schéma d'API),
// pour que seul l'admin authentifié — et le temps de la signature — puisse les afficher.
function signApplicationDocs<T extends { data?: unknown }>(appRow: T): T {
  const data = appRow?.data;
  if (!data || typeof data !== 'object') return appRow;
  const docs = (data as Record<string, unknown>).documents;
  if (!docs || typeof docs !== 'object') return appRow;
  const signed: Record<string, unknown> = {};
  for (const [slot, v] of Object.entries(docs as Record<string, unknown>)) {
    const p = v && typeof v === 'object' ? (v as { path?: unknown }).path : undefined;
    if (typeof p === 'string') {
      const m = p.match(/\/api\/applications\/documents\/([A-Za-z0-9._-]+)$/);
      signed[slot] = m ? { ...(v as object), path: `${p}${signDoc(m[1])}` } : v;
    } else {
      signed[slot] = v;
    }
  }
  return { ...appRow, data: { ...(data as object), documents: signed } };
}

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

// POST public (rate-limité) — réception d'une demande depuis le site.
applicationsRouter.post('/', publicWriteLimiter, async (req, res) => {
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
  res.json(applications.map(signApplicationDocs));
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
