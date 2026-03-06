import { create } from "zustand";
import { Book } from "@/lib/mockData";

interface BookPanelState {
  selectedBook: Book | null;
  setBook: (book: Book) => void;
  toggle: (book: Book) => void; // mở nếu khác, đóng nếu cùng
  close: () => void;
}

export const useBookPanelStore = create<BookPanelState>((set, get) => ({
  selectedBook: null,

  setBook: (book) => set({ selectedBook: book }),

  toggle: (book) => {
    const { selectedBook } = get();
    if (selectedBook?.id === book.id) {
      set({ selectedBook: null });
    } else {
      set({ selectedBook: book });
    }
  },

  close: () => set({ selectedBook: null }),
}));
