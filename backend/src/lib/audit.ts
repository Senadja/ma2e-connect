import { Request, Response, NextFunction } from 'express';
import { prisma } from './prisma';

// Journalise automatiquement toute écriture authentifiée et réussie.
// S'exécute au niveau de l'app ; req.user est renseigné par requireAuth au moment du "finish".
export function auditMiddleware(req: Request, res: Response, next: NextFunction) {
  const mutating = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method);
  if (!mutating) return next();

  res.on('finish', () => {
    if (res.statusCode >= 400) return;
    const user = req.user;
    if (!user) return; // on ne journalise que les actions authentifiées
    void prisma.auditLog
      .create({
        data: {
          userEmail: user.email,
          userName: user.name,
          method: req.method,
          path: req.originalUrl.split('?')[0],
          status: res.statusCode,
        },
      })
      .catch(() => undefined);
  });

  next();
}
