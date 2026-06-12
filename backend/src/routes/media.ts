import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
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

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
  filename: (_req, file, cb) => {
    const safe = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
    cb(null, `${Date.now()}-${safe}`);
  },
});
const upload = multer({ storage, limits: { fileSize: 15 * 1024 * 1024 } });

// GET public — liste des documents de la médiathèque.
mediaRouter.get('/', async (req, res) => {
  const category = req.query.category as string | undefined;
  const where = category ? { category } : {};
  const media = await prisma.mediaFile.findMany({ where, orderBy: { createdAt: 'desc' } });
  res.json(media);
});

mediaRouter.use(requireAuth, requirePermission('media:write'));

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
    },
  });
  res.status(201).json(media);
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
