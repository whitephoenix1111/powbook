import { create } from "zustand";
import { Book } from "@/lib/mockData";

interface LibraryState {
  // Sách đã mua / Get Free → hiện ở tab "Titles"
  ownedBooks: Book[];
  // Sách đã wishlist → hiện ở tab "Wishlist"
  wishlist: Book[];

  // Owned
  isOwned: (id: string) => boolean;
  acquire: (book: Book) => void;        // Get Free hoặc Buy

  // Wishlist
  isWishlisted: (id: string) => boolean;
  toggleWishlist: (book: Book) => void;
  removeWishlist: (id: string) => void;
}

export const useLibraryStore = create<LibraryState>((set, get) => ({
  ownedBooks: [],
  wishlist: [],

  /* ── Owned ── */
  isOwned: (id) => get().ownedBooks.some((b) => b.id === id),

  acquire: (book) => {
    if (!get().isOwned(book.id)) {
      set((s) => ({
        ownedBooks: [...s.ownedBooks, book],
        // Nếu đang trong wishlist thì xoá luôn sau khi mua
        wishlist: s.wishlist.filter((b) => b.id !== book.id),
      }));
    }
  },

  /* ── Wishlist ── */
  isWishlisted: (id) => get().wishlist.some((b) => b.id === id),

  toggleWishlist: (book) => {
    // Không cho wishlist nếu đã owned
    if (get().isOwned(book.id)) return;
    if (get().isWishlisted(book.id)) {
      set((s) => ({ wishlist: s.wishlist.filter((b) => b.id !== book.id) }));
    } else {
      set((s) => ({ wishlist: [...s.wishlist, book] }));
    }
  },

  removeWishlist: (id) =>
    set((s) => ({ wishlist: s.wishlist.filter((b) => b.id !== id) })),
}));
