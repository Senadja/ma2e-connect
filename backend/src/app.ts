import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';
import { env } from './lib/env';
import { authRouter } from './routes/auth';
import { articlesRouter } from './routes/articles';
import { productsRouter } from './routes/products';
import { applicationsRouter } from './routes/applications';
import { mediaRouter } from './routes/media';
import { uploadsRouter } from './routes/uploads';
import { statsRouter } from './routes/stats';
import { usersRouter } from './routes/users';
import { faqRouter } from './routes/faq';
import { settingsRouter } from './routes/settings';
import { partnersRouter } from './routes/partners';
import { teamRouter } from './routes/team';
import { contactRouter } from './routes/contact';
import { auditRouter } from './routes/audit';
import { auditMiddleware } from './lib/audit';

export const app = express();

// Derrière le reverse proxy (Caddy/OVH, Vercel), fait confiance à 1 hop pour que req.ip
// reflète la vraie IP client (sinon le rate-limit login partage un unique bucket → DoS/lockout).
// Nombre exact de proxys, PAS `true` (sinon X-Forwarded-For serait usurpable).
app.set('trust proxy', 1);

app.use(helmet());
app.use(
  cors({
    origin: (origin, cb) => {
      // Autorise les requêtes sans origine (curl, same-origin) et les origines listées.
      if (!origin || env.corsOrigins.includes(origin)) return cb(null, true);
      cb(new Error(`Origine non autorisée par CORS : ${origin}`));
    },
    credentials: true,
  })
);
app.use(express.json({ limit: '2mb' }));
app.use(auditMiddleware);

// Sert les fichiers uploadés (pièces jointes, visuels). En prod (front sur Vercel),
// c'est le backend qui les expose, derrière le reverse proxy ; le front les atteint
// via une rewrite "/documents/uploads/*".
const UPLOAD_DIR = process.env.UPLOAD_DIR
  ? path.resolve(process.env.UPLOAD_DIR)
  : path.resolve(__dirname, '../../public/documents/uploads');
// Sert UNIQUEMENT les visuels publics (produits, articles, splash, photos d'équipe…).
// Les pièces justificatives sensibles (CNI/passeport/photo d'identité) ne sont PAS ici :
// elles vont dans un dossier privé servi par une route signée (voir routes/applications.ts).
app.use(
  '/documents/uploads',
  express.static(UPLOAD_DIR, {
    setHeaders: (res, filePath) => {
      res.setHeader('X-Content-Type-Options', 'nosniff');
      // Défense en profondeur : tout fichier au type « exécutable en navigateur » est forcé
      // en téléchargement (neutralise une éventuelle XSS stockée via un .html/.svg résiduel).
      if (/\.(html?|svg|xml|xht(ml)?)$/i.test(filePath)) {
        res.setHeader('Content-Disposition', 'attachment');
      }
    },
  })
);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', message: 'MA2E Connect Backend API is running' });
});

app.use('/api/auth', authRouter);
app.use('/api/articles', articlesRouter);
app.use('/api/products', productsRouter);
app.use('/api/applications', applicationsRouter);
app.use('/api/media', mediaRouter);
app.use('/api/uploads', uploadsRouter);
app.use('/api/stats', statsRouter);
app.use('/api/users', usersRouter);
app.use('/api/faq', faqRouter);
app.use('/api/settings', settingsRouter);
app.use('/api/partners', partnersRouter);
app.use('/api/team', teamRouter);
app.use('/api/contact', contactRouter);
app.use('/api/audit', auditRouter);

// Gestion centralisée des erreurs.
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err);
  res.status(500).json({ error: 'Erreur serveur interne' });
});
