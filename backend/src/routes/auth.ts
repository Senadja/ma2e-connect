import { Router } from 'express';
import bcrypt from 'bcrypt';
import rateLimit from 'express-rate-limit';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { signToken, requireAuth, AuthUser } from '../middleware/auth';

export const authRouter = Router();

// Limite les tentatives de connexion (anti brute-force).
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Trop de tentatives. Réessayez dans quelques minutes.' },
});

const loginSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(1, 'Mot de passe requis'),
});

function toAuthUser(u: {
  id: string;
  email: string;
  name: string;
  role: string;
  permissions: string[];
}): AuthUser {
  return {
    id: u.id,
    email: u.email,
    name: u.name,
    role: u.role.toLowerCase(),
    permissions: u.permissions || [],
  };
}

authRouter.post('/login', loginLimiter, async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0].message });
  }
  const { email, password } = parsed.data;

  const user = await prisma.user.findUnique({ where: { email } });
  // Comparaison systématique pour limiter l'oracle temporel (user enum).
  const ok = user ? await bcrypt.compare(password, user.password) : false;
  if (!user || !ok) {
    return res.status(401).json({ error: 'Identifiants invalides' });
  }

  const authUser = toAuthUser(user);
  const token = signToken(authUser);
  res.json({ token, user: authUser });
});

authRouter.get('/me', requireAuth, (req, res) => {
  res.json({ user: req.user });
});
