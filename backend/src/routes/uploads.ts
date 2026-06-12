import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { requireAuth } from '../middleware/auth';

// Upload générique de fichier (images de produits, visuels d'articles…).
// Contrairement à /media, ne crée PAS d'entrée dans la médiathèque :
// il se contente de stocker le fichier et de renvoyer son chemin public.
export const uploadsRouter = Router();

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

// Tout admin authentifié peut téléverser un fichier ; le chemin n'est utile
// qu'une fois rattaché à une entité que l'utilisateur a le droit de modifier.
uploadsRouter.post('/', requireAuth, upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'Fichier requis' });
  res.status(201).json({ path: `/documents/uploads/${req.file.filename}` });
});
