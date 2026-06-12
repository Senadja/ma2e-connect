import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../lib/env';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: string; // 'admin' | 'editor' | 'user'
  permissions: string[];
}

// Étend la requête Express avec l'utilisateur authentifié.
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

export function signToken(user: AuthUser): string {
  return jwt.sign(user, env.jwtSecret, { expiresIn: env.jwtExpiresIn } as jwt.SignOptions);
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentification requise' });
  }
  const token = header.slice('Bearer '.length);
  try {
    const payload = jwt.verify(token, env.jwtSecret) as AuthUser;
    req.user = {
      id: payload.id,
      email: payload.email,
      name: payload.name,
      role: payload.role,
      permissions: payload.permissions || [],
    };
    next();
  } catch {
    return res.status(401).json({ error: 'Session invalide ou expirée' });
  }
}

// RBAC par rôle (insensible à la casse).
export function requireRole(...roles: string[]) {
  const allowed = roles.map((r) => r.toLowerCase());
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) return res.status(401).json({ error: 'Authentification requise' });
    if (!allowed.includes(req.user.role.toLowerCase())) {
      return res.status(403).json({ error: 'Accès refusé : privilèges insuffisants' });
    }
    next();
  };
}

// Autorisation par permission fine. L'ADMIN possède toutes les permissions implicitement.
export function requirePermission(permission: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) return res.status(401).json({ error: 'Authentification requise' });
    const isAdmin = req.user.role.toLowerCase() === 'admin';
    if (isAdmin || req.user.permissions.includes(permission)) return next();
    return res.status(403).json({ error: 'Accès refusé : permission manquante' });
  };
}
