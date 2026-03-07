import { create } from "zustand";
import { useLibraryStore } from "@/lib/store/libraryStore";

// ── Types ────────────────────────────────────────────────────
export interface User {
  id:    string;
  email: string;
}

interface AuthState {
  currentUser: User | null;

  /** Đăng ký tài khoản mới → gọi POST /api/auth/register */
  register: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>;

  /** Đăng nhập → gọi POST /api/auth/login */
  login: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>;

  /** Đăng xuất → gọi POST /api/auth/logout + clear state */
  logout: () => Promise<void>;

  /** Gọi GET /api/auth/me để restore session khi app mount */
  hydrate: () => Promise<void>;

  isLoggedIn: () => boolean;
}

// ── Store ────────────────────────────────────────────────────
// Không dùng persist — session được giữ bằng httpOnly cookie phía server.
// currentUser chỉ là client cache, hydrate() restore từ cookie mỗi khi load.
export const useAuthStore = create<AuthState>()((set, get) => ({
  currentUser: null,

  register: async (email, password) => {
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) return { ok: false, error: data.error };

    set({ currentUser: { id: data.id, email: data.email } });
    useLibraryStore.getState().setUser(data.id);
    return { ok: true };
  },

  login: async (email, password) => {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) return { ok: false, error: data.error };

    set({ currentUser: { id: data.id, email: data.email } });
    useLibraryStore.getState().setUser(data.id);
    return { ok: true };
  },

  logout: async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    set({ currentUser: null });
    useLibraryStore.getState().clearUser();
  },

  hydrate: async () => {
    try {
      const res = await fetch("/api/auth/me");
      const data = await res.json();
      if (data.user) {
        set({ currentUser: data.user });
        useLibraryStore.getState().setUser(data.user.id);
      }
    } catch {
      // Không làm gì nếu network lỗi — user vẫn ở trạng thái logged out
    }
  },

  isLoggedIn: () => get().currentUser !== null,
}));
