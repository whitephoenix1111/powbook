import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Book } from "@/lib/mockData";

export interface BookList {
  id: string;
  name: string;
  books: Book[];
  createdAt: number;
}

interface LibraryState {
  ownedBooks: Book[];
  wishlist: Book[];
  lists: BookList[];

  /* ── Owned ── */
  isOwned: (id: string) => boolean;
  acquire: (book: Book) => void;

  /* ── Wishlist ── */
  isWishlisted: (id: string) => boolean;
  toggleWishlist: (book: Book) => void;
  removeWishlist: (id: string) => void;

  /* ── Lists ── */
  createList: (name: string) => string;           // returns new list id
  deleteList: (listId: string) => void;
  addToList: (listId: string, book: Book) => void;
  removeFromList: (listId: string, bookId: string) => void;
  isInList: (listId: string, bookId: string) => boolean;
  getListsForBook: (bookId: string) => BookList[];
}

export const useLibraryStore = create<LibraryState>()(
  persist(
    (set, get) => ({
  ownedBooks: [],
  wishlist: [],
  lists: [],

  /* ── Owned ── */
  isOwned: (id) => get().ownedBooks.some((b) => b.id === id),

  acquire: (book) => {
    if (!get().isOwned(book.id)) {
      set((s) => ({
        ownedBooks: [...s.ownedBooks, book],
        wishlist: s.wishlist.filter((b) => b.id !== book.id),
      }));
    }
  },

  /* ── Wishlist ── */
  isWishlisted: (id) => get().wishlist.some((b) => b.id === id),

  toggleWishlist: (book) => {
    if (get().isOwned(book.id)) return;
    if (get().isWishlisted(book.id)) {
      set((s) => ({ wishlist: s.wishlist.filter((b) => b.id !== book.id) }));
    } else {
      set((s) => ({ wishlist: [...s.wishlist, book] }));
    }
  },

  removeWishlist: (id) =>
    set((s) => ({ wishlist: s.wishlist.filter((b) => b.id !== id) })),

  /* ── Lists ── */
  createList: (name) => {
    const id = `list_${Date.now()}`;
    set((s) => ({
      lists: [
        ...s.lists,
        { id, name: name.trim(), books: [], createdAt: Date.now() },
      ],
    }));
    return id;
  },

  deleteList: (listId) =>
    set((s) => ({ lists: s.lists.filter((l) => l.id !== listId) })),

  addToList: (listId, book) =>
    set((s) => ({
      lists: s.lists.map((l) =>
        l.id === listId && !l.books.some((b) => b.id === book.id)
          ? { ...l, books: [...l.books, book] }
          : l
      ),
    })),

  removeFromList: (listId, bookId) =>
    set((s) => ({
      lists: s.lists.map((l) =>
        l.id === listId
          ? { ...l, books: l.books.filter((b) => b.id !== bookId) }
          : l
      ),
    })),

  isInList: (listId, bookId) =>
    get().lists.find((l) => l.id === listId)?.books.some((b) => b.id === bookId) ?? false,

  getListsForBook: (bookId) =>
    get().lists.filter((l) => l.books.some((b) => b.id === bookId)),
    }),
    {
      name: "lv_library", // localStorage key
      partialize: (s) => ({
        ownedBooks: s.ownedBooks,
        wishlist: s.wishlist,
        lists: s.lists,
      }),
    }
  )
);
