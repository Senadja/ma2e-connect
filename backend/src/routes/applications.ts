import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { prisma } from '../lib/prisma';
import { env } from '../lib/env';
import { requireAuth, requirePermission } from '../middleware/auth';
import { publicWriteLimiter } from '../lib/rateLimit';
import { signDoc, verifyDoc } from '../lib/docSign';
import { nextAppNumber } from '../lib/appRef';
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
// Durcissement (zéro-écriture) : le fichier reste EN MÉMOIRE le temps de valider sa signature.
// Rien n'est écrit sur le disque tant que le contenu n'est pas confirmé conforme (voir handler).
const docUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 8 * 1024 * 1024 }, // 8 Mo max par pièce (borne aussi la RAM par requête)
  fileFilter: (_req, file, cb) => cb(null, ALLOWED_EXT.has(path.extname(file.originalname).toLowerCase())),
});

// Sécurité (audit GS2E #4) : valide le CONTENU réel du fichier (magic bytes), pas seulement son
// extension. Un exécutable renommé « .pdf » ne présente pas la signature attendue → rejeté.
const MAGIC: Record<string, (b: Buffer) => boolean> = {
  '.pdf': (b) => b.slice(0, 5).toString('latin1') === '%PDF-',
  '.png': (b) => b.slice(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])),
  '.jpg': (b) => b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff,
  '.jpeg': (b) => b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff,
  '.docx': (b) => b[0] === 0x50 && b[1] === 0x4b && b[2] === 0x03 && b[3] === 0x04, // conteneur ZIP
  '.doc': (b) => b.slice(0, 8).equals(Buffer.from([0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1])), // OLE
};

function contentMatchesExt(buf: Buffer, ext: string): boolean {
  const check = MAGIC[ext];
  if (!check) return false;
  return check(buf.subarray(0, 8));
}

// Enrobe multer pour transformer ses erreurs en réponse JSON exploitable au lieu d'un 500 HTML
// opaque : fichier trop volumineux (413) ou multipart invalide (500 + log de la cause réelle).
const receiveDoc = (req: Request, res: Response, next: NextFunction) =>
  docUpload.single('file')(req, res, (err: unknown) => {
    if (!err) return next();
    if ((err as { code?: string }).code === 'LIMIT_FILE_SIZE') {
      return res.status(413).json({ error: 'Fichier trop volumineux (8 Mo max).' });
    }
    console.error('Échec réception pièce justificative:', (err as Error).message);
    return res.status(500).json({ error: "Le fichier n'a pas pu être enregistré. Réessayez." });
  });

// Public (rate-limité) : reçoit une pièce et renvoie une référence d'API (non résolvable sans signature).
applicationsRouter.post('/documents', publicWriteLimiter, receiveDoc, (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'Fichier requis (PDF, image ou Word, 8 Mo max).' });
  const ext = path.extname(req.file.originalname).toLowerCase();
  // Validation AVANT toute écriture : un contenu non conforme n'atteint jamais le disque.
  if (!contentMatchesExt(req.file.buffer, ext)) {
    return res.status(400).json({ error: 'Le contenu du fichier ne correspond pas à son type (PDF, image ou Word attendu).' });
  }
  // Contenu confirmé → écriture sous un nom NON devinable (UUID + extension validée).
  const filename = `${crypto.randomUUID()}${ext}`;
  try {
    fs.writeFileSync(path.join(APP_DOCS_DIR, filename), req.file.buffer);
  } catch (e) {
    console.error('Échec écriture pièce justificative:', (e as Error).message);
    return res.status(500).json({ error: "Le fichier n'a pas pu être enregistré. Réessayez." });
  }
  res.status(201).json({ path: `/api/applications/documents/${filename}`, name: req.file.originalname });
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

// Crée la demande avec une référence atomique (voir lib/appRef : séquence Postgres `nextval`).
// Le retry sur collision (Prisma P2002) reste en filet de sécurité — il ne se déclenche plus avec
// la séquence, mais couvre un éventuel doublon résiduel dans des données héritées.
async function createApplication(d: z.infer<typeof createSchema>) {
  const year = new Date().getFullYear();
  for (let attempt = 0; ; attempt++) {
    const appId = `MA2E-${year}-${String(await nextAppNumber()).padStart(4, '0')}`;
    try {
      return await prisma.application.create({
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
    } catch (err) {
      if ((err as { code?: string }).code === 'P2002' && attempt < 5) continue;
      throw err;
    }
  }
}

// POST public (rate-limité) — réception d'une demande depuis le site.
applicationsRouter.post('/', publicWriteLimiter, async (req, res) => {
  const parsed = createSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0].message });
  }
  const d = parsed.data;
  const application = await createApplication(d);

  // Notification e-mail (non bloquante). Désactivable via APPLICATION_NOTIFY_DISABLED
  // le temps d'une campagne de test (évite de noyer la boîte pendant un scan). Voir lib/env.
  if (!env.applicationNotifyDisabled) {
    void sendApplicationNotification({
      appId: application.appId,
      category: d.category,
      type: d.type,
      name: d.name,
      matricule: d.matricule,
      email: d.email || '',
      phone: d.phone,
      data: d.data,
    });
  }

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
