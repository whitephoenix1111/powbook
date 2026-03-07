import { create } from "zustand";
import type { Book } from "@/lib/mockData";

// ── Types ────────────────────────────────────────────────────
export interface BookList {
  id: string;
  name: string;
  books: Book[];
  createdAt: number;
}

interface LibraryState {
  currentEmail: string | null;
  ownedBooks: Book[];
  wishlist: Book[];
  lists: BookList[];

  /* ── Auth integration ── */
  setUser:   (email: string) => Promise<void>;  // fetch GET /api/library
  clearUser: () => void;

  /* ── Owned ── */
  isOwned:  (id: string) => boolean;
  acquire:  (book: Book) => Promise<void>;

  /* ── Wishlist ── */
  isWishlisted:   (id: string) => boolean;
  toggleWishlist: (book: Book) => Promise<void>;
  removeWishlist: (id: string) => Promise<void>;

  /* ── Lists ── */
  createList:     (name: string) => Promise<string>;
  renameList:     (listId: string, newName: string) => Promise<void>;
  deleteList:     (listId: string) => Promise<void>;
  addToList:      (listId: string, book: Book) => Promise<void>;
  removeFromList: (listId: string, bookId: string) => Promise<void>;
  isInList:       (listId: string, bookId: string) => boolean;
  getListsForBook:(bookId: string) => BookList[];
}

// ── API helper ───────────────────────────────────────────────
async function apiPost(action: string, payload: Record<string, unknown>) {
  const res = await fetch("/api/library", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action, payload }),
  });
  if (!res.ok) throw new Error(`Library API error: ${action}`);
  return res.json();
}

// ── Store (không persist — state là client cache, nguồn thật là library.json) ──
export const useLibraryStore = create<LibraryState>()((set, get) => ({
  currentEmail: null,
  ownedBooks: [],
  wishlist: [],
  lists: [],

  /* ── Auth ── */
  setUser: async (email) => {
    set({ currentEmail: email });
    try {
      const res = await fetch("/api/library");
      if (res.ok) {
        const data = await res.json();
        set({
          ownedBooks: data.ownedBooks ?? [],
          wishlist:   data.wishlist   ?? [],
          lists:      data.lists      ?? [],
        });
      }
    } catch {
      // Network error → để trống, user vẫn dùng được (sẽ sync lại sau)
    }
  },

  clearUser: () =>
    set({ currentEmail: null, ownedBooks: [], wishlist: [], lists: [] }),

  /* ── Owned ── */
  isOwned: (id) => get().ownedBooks.some((b) => b.id === id),

  acquire: async (book) => {
    if (get().isOwned(book.id)) return;
    // Optimistic update
    set((s) => ({
      ownedBooks: [...s.ownedBooks, book],
      wishlist:   s.wishlist.filter((b) => b.id !== book.id),
    }));
    try {
      await apiPost("acquire", { bookId: book.id });
    } catch {
      // Rollback nếu API lỗi
      set((s) => ({
        ownedBooks: s.ownedBooks.filter((b) => b.id !== book.id),
      }));
    }
  },

  /* ── Wishlist ── */
  isWishlisted: (id) => get().wishlist.some((b) => b.id === id),

  toggleWishlist: async (book) => {
    if (get().isOwned(book.id)) return;
    const wasIn = get().isWishlisted(book.id);
    // Optimistic update
    set((s) => ({
      wishlist: wasIn
        ? s.wishlist.filter((b) => b.id !== book.id)
        : [...s.wishlist, book],
    }));
    try {
      await apiPost("toggleWishlist", { bookId: book.id });
    } catch {
      // Rollback
      set((s) => ({
        wishlist: wasIn
          ? [...s.wishlist, book]
          : s.wishlist.filter((b) => b.id !== book.id),
      }));
    }
  },

  removeWishlist: async (bookId) => {
    const prev = get().wishlist;
    set((s) => ({ wishlist: s.wishlist.filter((b) => b.id !== bookId) }));
    try {
      await apiPost("removeWishlist", { bookId });
    } catch {
      set({ wishlist: prev });
    }
  },

  /* ── Lists ── */
  createList: async (name) => {
    const listId = `list_${Date.now()}`;
    const trimmed = name.trim();
    if (!trimmed) return listId;
    // Optimistic
    set((s) => ({
      lists: [...s.lists, { id: listId, name: trimmed, books: [], createdAt: Date.now() }],
    }));
    try {
      await apiPost("createList", { listId, name: trimmed });
    } catch {
      set((s) => ({ lists: s.lists.filter((l) => l.id !== listId) }));
    }
    return listId;
  },

  renameList: async (listId, newName) => {
    const trimmed = newName.trim();
    if (!trimmed) return;
    const prev = get().lists;
    set((s) => ({
      lists: s.lists.map((l) => l.id === listId ? { ...l, name: trimmed } : l),
    }));
    try {
      await apiPost("renameList", { listId, newName: trimmed });
    } catch {
      set({ lists: prev });
    }
  },

  deleteList: async (listId) => {
    const prev = get().lists;
    set((s) => ({ lists: s.lists.filter((l) => l.id !== listId) }));
    try {
      await apiPost("deleteList", { listId });
    } catch {
      set({ lists: prev });
    }
  },

  addToList: async (listId, book) => {
    const prev = get().lists;
    set((s) => ({
      lists: s.lists.map((l) =>
        l.id === listId && !l.books.some((b) => b.id === book.id)
          ? { ...l, books: [...l.books, book] }
          : l
      ),
    }));
    try {
      await apiPost("addToList", { listId, bookId: book.id });
    } catch {
      set({ lists: prev });
    }
  },

  removeFromList: async (listId, bookId) => {
    const prev = get().lists;
    set((s) => ({
      lists: s.lists.map((l) =>
        l.id === listId
          ? { ...l, books: l.books.filter((b) => b.id !== bookId) }
          : l
      ),
    }));
    try {
      await apiPost("removeFromList", { listId, bookId });
    } catch {
      set({ lists: prev });
    }
  },

  isInList: (listId, bookId) =>
    get().lists.find((l) => l.id === listId)?.books.some((b) => b.id === bookId) ?? false,

  getListsForBook: (bookId) =>
    get().lists.filter((l) => l.books.some((b) => b.id === bookId)),
}));
