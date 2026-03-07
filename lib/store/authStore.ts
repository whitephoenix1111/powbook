import { create } from "zustand";
import { persist } from "zustand/middleware";
import { useLibraryStore } from "@/lib/store/libraryStore";

export interface User {
  email: string;
  password: string;
  createdAt: number;
}

interface AuthState {
  users: User[];
  currentUser: User | null;

  register:  (email: string, password: string) => { ok: boolean; error?: string };
  login:     (email: string, password: string) => { ok: boolean; error?: string };
  logout:    () => void;
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
        // Load library cho user mới (sẽ là empty data)
        useLibraryStore.getState().setUser(email);
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
        // Load library của user này
        useLibraryStore.getState().setUser(email);
        return { ok: true };
      },

      logout: () => {
        set({ currentUser: null });
        // Xoá library khỏi active state
        useLibraryStore.getState().clearUser();
      },

      isLoggedIn: () => get().currentUser !== null,
    }),
    {
      name: "lv_auth",
      partialize: (s) => ({ users: s.users, currentUser: s.currentUser }),
      // Sau rehydrate → sync library cho currentUser nếu đang đăng nhập
      onRehydrateStorage: () => (state) => {
        if (!state) return;
        if (state.currentUser) {
          // Dùng setTimeout để đảm bảo libraryStore cũng đã rehydrate xong
          setTimeout(() => {
            useLibraryStore.getState().setUser(state.currentUser!.email);
          }, 0);
        }
      },
    }
  )
);
