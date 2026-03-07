import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface User {
  email: string;
  password: string; // plain-text mock — no real backend
  createdAt: number;
}

interface AuthState {
  users: User[];
  currentUser: User | null;

  /* ── Actions ── */
  register: (email: string, password: string) => { ok: boolean; error?: string };
  login:    (email: string, password: string) => { ok: boolean; error?: string };
  logout:   () => void;
  isLoggedIn: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      users: [],
      currentUser: null,

      register: (email, password) => {
        const existing = get().users.find(
          (u) => u.email.toLowerCase() === email.toLowerCase()
        );
        if (existing) {
          return { ok: false, error: "An account with this email already exists." };
        }
        const newUser: User = { email, password, createdAt: Date.now() };
        set((s) => ({ users: [...s.users, newUser], currentUser: newUser }));
        return { ok: true };
      },

      login: (email, password) => {
        const user = get().users.find(
          (u) =>
            u.email.toLowerCase() === email.toLowerCase() &&
            u.password === password
        );
        if (!user) {
          return { ok: false, error: "Incorrect email or password." };
        }
        set({ currentUser: user });
        return { ok: true };
      },

      logout: () => set({ currentUser: null }),

      isLoggedIn: () => get().currentUser !== null,
    }),
    {
      name: "lv_auth", // localStorage key
      partialize: (s) => ({ users: s.users, currentUser: s.currentUser }),
    }
  )
);
