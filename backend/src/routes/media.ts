import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { requireAuth, requirePermission } from '../middleware/auth';

export const mediaRouter = Router();

// Dossier des fichiers uploadés. En Docker, UPLOAD_DIR pointe vers un volume
// partagé ; en local, vers le dossier public du front (servi par Vite).
const UPLOAD_DIR = process.env.UPLOAD_DIR
  ? path.resolve(process.env.UPLOAD_DIR)
  : path.resolve(__dirname, '../../../public/documents/uploads');
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

// Médiathèque : documents/visuels publics. On bloque .svg/.html/.js… (XSS stockée first-party).
const ALLOWED_EXT = new Set(['.pdf', '.jpg', '.jpeg', '.png', '.webp', '.gif', '.doc', '.docx', '.xls', '.xlsx']);
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
  filename: (_req, file, cb) => cb(null, `${crypto.randomUUID()}${path.extname(file.originalname).toLowerCase()}`),
});
const upload = multer({
  storage,
  limits: { fileSize: 15 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => cb(null, ALLOWED_EXT.has(path.extname(file.originalname).toLowerCase())),
});

// GET public — uniquement les documents PUBLIÉS de la médiathèque.
mediaRouter.get('/', async (req, res) => {
  const category = req.query.category as string | undefined;
  const where = { published: true, ...(category ? { category } : {}) };
  const media = await prisma.mediaFile.findMany({ where, orderBy: { createdAt: 'desc' } });
  res.json(media);
});

mediaRouter.use(requireAuth, requirePermission('media:write'));

// GET admin — tous les fichiers (publiés ou non) pour la gestion.
mediaRouter.get('/all', async (_req, res) => {
  const media = await prisma.mediaFile.findMany({ orderBy: { createdAt: 'desc' } });
  res.json(media);
});

const metaSchema = z.object({
  title: z.string().min(1),
  category: z.string().min(1),
  desc: z.string().optional(),
  year: z.string().optional(),
});

mediaRouter.post('/', upload.single('file'), async (req, res) => {
  const parsed = metaSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.issues[0].message });
  if (!req.file) return res.status(400).json({ error: 'Fichier requis' });

  const sizeKo = `${Math.round(req.file.size / 1024)} Ko`;
  const media = await prisma.mediaFile.create({
    data: {
      title: parsed.data.title,
      category: parsed.data.category,
      desc: parsed.data.desc,
      year: parsed.data.year,
      size: sizeKo,
      path: `/documents/uploads/${req.file.filename}`,
      published: false, // un nouvel upload n'est pas public tant que l'admin ne le publie pas
    },
  });
  res.status(201).json(media);
});

// Mettre à jour un fichier : publier / masquer et/ou modifier les métadonnées.
const patchSchema = z.object({
  title: z.string().min(1).optional(),
  category: z.string().min(1).optional(),
  desc: z.string().optional(),
  year: z.string().optional(),
  published: z.boolean().optional(),
});

mediaRouter.patch('/:id', async (req, res) => {
  const parsed = patchSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Valeur invalide' });
  if (Object.keys(parsed.data).length === 0) return res.status(400).json({ error: 'Aucune donnée à mettre à jour' });
  const media = await prisma.mediaFile
    .update({ where: { id: req.params.id }, data: parsed.data })
    .catch(() => null);
  if (!media) return res.status(404).json({ error: 'Fichier introuvable' });
  res.json(media);
});

mediaRouter.delete('/:id', async (req, res) => {
  const media = await prisma.mediaFile.findUnique({ where: { id: req.params.id } });
  // Ne supprime physiquement que les fichiers réellement uploadés via l'API.
  if (media?.path?.startsWith('/documents/uploads/')) {
    fs.rm(path.resolve(UPLOAD_DIR, path.basename(media.path)), () => undefined);
  }
  await prisma.mediaFile.delete({ where: { id: req.params.id } }).catch(() => null);
  res.status(204).end();
});
