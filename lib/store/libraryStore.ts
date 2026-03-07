import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Book } from "@/lib/mockData";

export interface BookList {
  id: string;
  name: string;
  books: Book[];
  createdAt: number;
}

interface UserLibraryData {
  ownedBooks: Book[];
  wishlist:   Book[];
  lists:      BookList[];
}

const EMPTY_DATA = (): UserLibraryData => ({
  ownedBooks: [],
  wishlist:   [],
  lists:      [],
});

interface LibraryState extends UserLibraryData {
  currentEmail: string | null;
  _storage: Record<string, UserLibraryData>;

  /* ── Auth integration ── */
  setUser:   (email: string) => void;
  clearUser: () => void;

  /* ── Owned ── */
  isOwned: (id: string) => boolean;
  acquire: (book: Book) => void;

  /* ── Wishlist ── */
  isWishlisted: (id: string) => boolean;
  toggleWishlist: (book: Book) => void;
  removeWishlist: (id: string) => void;

  /* ── Lists (requires login) ── */
  createList:      (name: string) => string;
  renameList:      (listId: string, newName: string) => void;
  deleteList:      (listId: string) => void;
  addToList:       (listId: string, book: Book) => void;
  removeFromList:  (listId: string, bookId: string) => void;
  isInList:        (listId: string, bookId: string) => boolean;
  getListsForBook: (bookId: string) => BookList[];
}

function syncToStorage(state: LibraryState): Pick<LibraryState, "_storage"> {
  if (!state.currentEmail) return { _storage: state._storage };
  return {
    _storage: {
      ...state._storage,
      [state.currentEmail]: {
        ownedBooks: state.ownedBooks,
        wishlist:   state.wishlist,
        lists:      state.lists,
      },
    },
  };
}

export const useLibraryStore = create<LibraryState>()(
  persist(
    (set, get) => ({
      currentEmail: null,
      _storage:     {},
      ownedBooks:   [],
      wishlist:     [],
      lists:        [],

      /* ── Auth ── */
      setUser: (email) => {
        const state = get();
        const updatedStorage = syncToStorage(state)._storage;
        const data = updatedStorage[email] ?? EMPTY_DATA();
        set({ currentEmail: email, _storage: updatedStorage, ...data });
      },

      clearUser: () => {
        const state = get();
        const updatedStorage = syncToStorage(state)._storage;
        set({ currentEmail: null, _storage: updatedStorage, ownedBooks: [], wishlist: [], lists: [] });
      },

      /* ── Owned ── */
      isOwned: (id) => get().ownedBooks.some((b) => b.id === id),

      acquire: (book) => {
        if (get().isOwned(book.id)) return;
        set((s) => {
          const next = { ownedBooks: [...s.ownedBooks, book], wishlist: s.wishlist.filter((b) => b.id !== book.id) };
          return { ...next, ...syncToStorage({ ...s, ...next }) };
        });
      },

      /* ── Wishlist ── */
      isWishlisted: (id) => get().wishlist.some((b) => b.id === id),

      toggleWishlist: (book) => {
        const s = get();
        if (s.isOwned(book.id)) return;
        set((s) => {
          const next = { wishlist: s.isWishlisted(book.id) ? s.wishlist.filter((b) => b.id !== book.id) : [...s.wishlist, book] };
          return { ...next, ...syncToStorage({ ...s, ...next }) };
        });
      },

      removeWishlist: (id) =>
        set((s) => {
          const next = { wishlist: s.wishlist.filter((b) => b.id !== id) };
          return { ...next, ...syncToStorage({ ...s, ...next }) };
        }),

      /* ── Lists ── */
      createList: (name) => {
        const id = `list_${Date.now()}`;
        set((s) => {
          const next = { lists: [...s.lists, { id, name: name.trim(), books: [], createdAt: Date.now() }] };
          return { ...next, ...syncToStorage({ ...s, ...next }) };
        });
        return id;
      },

      renameList: (listId, newName) => {
        const trimmed = newName.trim();
        if (!trimmed) return;
        set((s) => {
          const next = { lists: s.lists.map((l) => l.id === listId ? { ...l, name: trimmed } : l) };
          return { ...next, ...syncToStorage({ ...s, ...next }) };
        });
      },

      deleteList: (listId) =>
        set((s) => {
          const next = { lists: s.lists.filter((l) => l.id !== listId) };
          return { ...next, ...syncToStorage({ ...s, ...next }) };
        }),

      addToList: (listId, book) =>
        set((s) => {
          const next = { lists: s.lists.map((l) => l.id === listId && !l.books.some((b) => b.id === book.id) ? { ...l, books: [...l.books, book] } : l) };
          return { ...next, ...syncToStorage({ ...s, ...next }) };
        }),

      removeFromList: (listId, bookId) =>
        set((s) => {
          const next = { lists: s.lists.map((l) => l.id === listId ? { ...l, books: l.books.filter((b) => b.id !== bookId) } : l) };
          return { ...next, ...syncToStorage({ ...s, ...next }) };
        }),

      isInList: (listId, bookId) =>
        get().lists.find((l) => l.id === listId)?.books.some((b) => b.id === bookId) ?? false,

      getListsForBook: (bookId) =>
        get().lists.filter((l) => l.books.some((b) => b.id === bookId)),
    }),
    {
      name: "lv_library",
      partialize: (s) => ({ currentEmail: s.currentEmail, _storage: s._storage }),
      onRehydrateStorage: () => (state) => {
        if (!state) return;
        const email = state.currentEmail;
        if (email && state._storage[email]) {
          const data = state._storage[email];
          state.ownedBooks = data.ownedBooks;
          state.wishlist   = data.wishlist;
          state.lists      = data.lists;
        }
      },
    }
  )
);
