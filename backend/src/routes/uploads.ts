import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { requireAuth, requirePermission } from '../middleware/auth';
import { fileContentMatchesExt, discardUpload } from '../lib/uploadGuard';

// Upload générique de fichier (images de produits, visuels d'articles…).
// Contrairement à /media, ne crée PAS d'entrée dans la médiathèque :
// il se contente de stocker le fichier et de renvoyer son chemin public.
export const uploadsRouter = Router();

const UPLOAD_DIR = process.env.UPLOAD_DIR
  ? path.resolve(process.env.UPLOAD_DIR)
  : path.resolve(__dirname, '../../../public/documents/uploads');
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

// Visuels uniquement : on bloque .svg/.html/.js… qui, servis en first-party via la rewrite,
// exécuteraient du JS (XSS stockée → vol du JWT admin en localStorage).
const ALLOWED_EXT = new Set(['.pdf', '.jpg', '.jpeg', '.png', '.webp', '.gif']);
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
  filename: (_req, file, cb) => cb(null, `${crypto.randomUUID()}${path.extname(file.originalname).toLowerCase()}`),
});
const upload = multer({
  storage,
  limits: { fileSize: 15 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => cb(null, ALLOWED_EXT.has(path.extname(file.originalname).toLowerCase())),
});

// Écriture réservée aux profils habilités à gérer les médias (même droit que /media).
uploadsRouter.post('/', requireAuth, requirePermission('media:write'), upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'Fichier requis' });

  // Audit manuel 2026-11-13 : l'extension ne suffit pas. Le fichier est déjà écrit sur disque
  // (diskStorage) — on valide son en-tête et on le supprime s'il ne correspond pas.
  const ext = path.extname(req.file.filename).toLowerCase();
  if (!fileContentMatchesExt(req.file.path, ext)) {
    discardUpload(req.file.path);
    return res.status(400).json({ error: `Le contenu du fichier ne correspond pas à son extension (${ext}).` });
  }

  res.status(201).json({ path: `/documents/uploads/${req.file.filename}` });
});
