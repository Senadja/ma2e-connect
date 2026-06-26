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

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  can: (permission: string) => boolean;
}

export const useAuth = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      login: async (email, password) => {
        const { token, user } = await api<{ token: string; user: User }>('/auth/login', {
          method: 'POST',
          body: { email, password },
        });
        setToken(token);
        set({ user, isAuthenticated: true });
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
