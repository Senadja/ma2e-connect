import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'editor';
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

export const useAuth = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      login: async (email, password) => {
        // Simulating API call
        return new Promise((resolve, reject) => {
          setTimeout(() => {
            if (email === "admin@ma2e.ci" && password === "admin123") {
              set({
                user: { id: "1", name: "Administrateur MA2E", email: "admin@ma2e.ci", role: "admin" },
                isAuthenticated: true,
              });
              resolve();
            } else if (email === "editor@ma2e.ci" && password === "editor123") {
              set({
                user: { id: "2", name: "Éditeur Com", email: "editor@ma2e.ci", role: "editor" },
                isAuthenticated: true,
              });
              resolve();
            } else {
              reject(new Error("Identifiants incorrects"));
            }
          }, 1000);
        });
      },
      logout: () => set({ user: null, isAuthenticated: false }),
    }),
    { name: 'auth-storage' }
  )
);
