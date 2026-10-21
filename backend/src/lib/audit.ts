import { Request, Response, NextFunction } from 'express';
import { prisma } from './prisma';

// Adresse de l'appelant, telle qu'elle doit se relire dans le journal. Node préfixe les
// IPv4 de « ::ffff: » quand la socket est en IPv6 : on retire ce bruit. La valeur vient de
// req.ip, donc du X-Forwarded-For posé par le proxy (voir `app.set('trust proxy', 1)`).
const clientIp = (req: Request) => req.ip?.replace(/^::ffff:/, '') ?? null;

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
          ip: clientIp(req),
        },
      })
      .catch(() => undefined);
  });

  next();
}

// Journalise un événement d'authentification — succès ET échec.
// Le journal automatique ci-dessus ne peut pas s'en charger : il ignore les réponses en
// erreur et ne connaît que les requêtes déjà authentifiées, si bien qu'une tentative de
// connexion refusée ne laissait aucune trace consultable (ANSSI R29). Or c'est le signal
// le plus utile : des échecs répétés, puis un succès depuis la même adresse, sont la
// signature d'une attaque réussie par force brute.
// Écriture « au mieux » : jamais d'exception, la réponse d'authentification ne doit pas
// dépendre de la bonne santé du journal.
export function logAuthEvent(
  req: Request,
  params: { email: string; name?: string | null; status: number; detail: string }
) {
  void prisma.auditLog
    .create({
      data: {
        userEmail: params.email,
        userName: params.name ?? null,
        method: req.method,
        path: req.originalUrl.split('?')[0],
        status: params.status,
        ip: clientIp(req),
        detail: params.detail,
      },
    })
    .catch(() => undefined);
}
