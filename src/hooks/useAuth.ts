import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { api, setToken } from '@/lib/api';

interface User {
  id: string;
  name: string;
  email: string;
  role: string; // 'admin' | 'editor' | 'user'
  permissions: string[];
}

// Réponse de l'étape 1 : le mot de passe est bon, un code a été envoyé par e-mail.
// La session n'est PAS encore ouverte.
export interface LoginChallenge {
  challengeId: string;
  maskedEmail: string;
  expiresIn: number;
  // false = le serveur e-mail n'a pas répondu : il faut basculer sur un code de secours.
  emailSent: boolean;
  backupCodesLeft: number;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  // Renvoie le challenge à confirmer, ou null si la session a été ouverte directement
  // (coupe-circuit MFA_ENABLED=false côté serveur).
  login: (email: string, password: string) => Promise<LoginChallenge | null>;
  verifyCode: (challengeId: string, code: string) => Promise<void>;
  resendCode: (challengeId: string) => Promise<void>;
  logout: () => void;
  can: (permission: string) => boolean;
}

export const useAuth = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      login: async (email, password) => {
        const res = await api<Partial<LoginChallenge> & { token?: string; user?: User }>(
          '/auth/login',
          { method: 'POST', body: { email, password } }
        );
        // Le serveur a rendu un jeton directement : la double authentification est
        // désactivée côté serveur, on ouvre la session comme avant.
        if (res.token && res.user) {
          setToken(res.token);
          set({ user: res.user, isAuthenticated: true });
          return null;
        }
        return res as LoginChallenge;
      },
      verifyCode: async (challengeId, code) => {
        const { token, user } = await api<{ token: string; user: User }>('/auth/verify', {
          method: 'POST',
          body: { challengeId, code },
        });
        setToken(token);
        set({ user, isAuthenticated: true });
      },
      resendCode: async (challengeId) => {
        await api('/auth/resend', { method: 'POST', body: { challengeId } });
      },
      logout: () => {
        setToken(null);
        set({ user: null, isAuthenticated: false });
      },
      // L'ADMIN possède toutes les permissions implicitement.
      can: (permission) => {
        const u = get().user;
        if (!u) return false;
        return u.role?.toLowerCase() === 'admin' || (u.permissions || []).includes(permission);
      },
    }),
    { name: 'auth-storage' }
  )
);
