import { create } from "zustand";
import { Book } from "@/lib/mockData";

interface SavedState {
  savedBooks: Book[];
  isSaved: (id: string) => boolean;
  save: (book: Book) => void;
  remove: (id: string) => void;
  toggle: (book: Book) => void;
}

export const useSavedStore = create<SavedState>((set, get) => ({
  savedBooks: [],

  isSaved: (id) => get().savedBooks.some((b) => b.id === id),

  save: (book) => {
    if (!get().isSaved(book.id)) {
      set((s) => ({ savedBooks: [...s.savedBooks, book] }));
    }
  },

  remove: (id) =>
    set((s) => ({ savedBooks: s.savedBooks.filter((b) => b.id !== id) })),

  toggle: (book) => {
    if (get().isSaved(book.id)) {
      get().remove(book.id);
    } else {
      get().save(book);
    }
  },
}));
