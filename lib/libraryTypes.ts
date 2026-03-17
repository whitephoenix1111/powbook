import type { Book } from "@/lib/mockData";

export interface ResolvedLibrary {
  ownedBooks: Book[];
  wishlist:   Book[];
  lists: {
    id:        string;
    name:      string;
    books:     Book[];
    createdAt: number;
  }[];
}
