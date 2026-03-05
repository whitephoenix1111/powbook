// Mock data types & data for development
export interface Book {
  id: string;
  title: string;
  author: string;
  narrator?: string;
  cover: string;
  rating: number;
  ratingCount: string;
  type: "ebook" | "audiobook" | "podcast" | "comic";
  length?: string;
  format?: string;
  publisher?: string;
  released?: string;
  description?: string;
  audioUrl?: string;
  pages?: BookPage[];
}

export interface BookPage {
  pageNumber: number;
  chapter?: string;
  content: string;
}

export const POPULAR_BOOKS: Book[] = [
  {
    id: "1",
    title: "The Great Gatsby",
    author: "F. Scott Fitzgerald",
    cover: "https://covers.openlibrary.org/b/id/8432463-L.jpg",
    rating: 5,
    ratingCount: "2.1K",
    type: "ebook",
  },
  {
    id: "2",
    title: "One Hundred Years of Solitude",
    author: "Gabriel G. Márquez",
    cover: "https://covers.openlibrary.org/b/id/10519563-L.jpg",
    rating: 4,
    ratingCount: "3.4K",
    type: "ebook",
  },
  {
    id: "3",
    title: "To Kill a Mockingbird",
    author: "Harper Lee",
    cover: "https://covers.openlibrary.org/b/id/8739161-L.jpg",
    rating: 5,
    ratingCount: "4.2K",
    type: "ebook",
  },
  {
    id: "4",
    title: "Of Human Bondage",
    author: "William Somerset Maugham",
    cover: "https://covers.openlibrary.org/b/id/12818862-L.jpg",
    rating: 4,
    ratingCount: "1.8K",
    type: "ebook",
  },
  {
    id: "5",
    title: "Breaking Dawn (The Twilight Saga #4)",
    author: "Stephenie Meyer",
    cover: "https://covers.openlibrary.org/b/id/8267032-L.jpg",
    rating: 4,
    ratingCount: "5.6K",
    type: "ebook",
  },
];

export const RECOMMENDED_AUDIOBOOKS: Book[] = [
  {
    id: "6",
    title: "My Year Abroad",
    author: "Chang-rae Lee",
    cover: "https://covers.openlibrary.org/b/id/12818856-L.jpg",
    rating: 4,
    ratingCount: "980",
    type: "audiobook",
    length: "18 hr 24 min",
  },
  {
    id: "7",
    title: "Quidditch Through the Ages",
    author: "J.K. Rowling",
    cover: "https://covers.openlibrary.org/b/id/8385449-L.jpg",
    rating: 5,
    ratingCount: "7.3K",
    type: "audiobook",
    length: "2 hr 10 min",
  },
  {
    id: "8",
    title: "The Great Gatsby",
    author: "F. Scott Fitzgerald",
    cover: "https://covers.openlibrary.org/b/id/8432463-L.jpg",
    rating: 5,
    ratingCount: "2.1K",
    type: "audiobook",
    length: "4 hr 38 min",
  },
  {
    id: "9",
    title: "Harry Potter and the Sorcerer's Stone",
    author: "J.K. Rowling",
    cover: "https://covers.openlibrary.org/b/id/10110415-L.jpg",
    rating: 5,
    ratingCount: "12K",
    type: "audiobook",
    length: "8 hr 18 min",
  },
];

export const ACTIVE_BOOK: Book = {
  id: "9",
  title: "Harry Potter and the Sorcerer's Stone",
  author: "J.K. Rowling",
  narrator: "Jim Dale",
  cover: "https://covers.openlibrary.org/b/id/10110415-L.jpg",
  rating: 5,
  ratingCount: "1.5K",
  type: "audiobook",
  length: "22 hr 56 min",
  format: "Audiobook",
  publisher: "Audible Verse, Inc.",
  released: "Apr 24, 2022",
  audioUrl: "https://archive.org/download/alice_wonderland_librivox/awic_01_carroll_64kb.mp3",
  description:
    "Die-hard Harry Potter audiobook fans will list the ways in which Dale differs from Fry. We love both of their performances, but some fans are firmly Team Dale or Team Fry. There's so much to love about Dale's interpretation in the U.S. edition of the audiobooks.",
  pages: [
    {
      pageNumber: 5,
      chapter: "Chapter 01:\nThe Ordinary World of the Dursleys",
      content:
        "The Dursleys are a well-to-do, status-conscious family living in Surrey, England. Mr. Dursley notices strange things on his way to work — people in cloaks, owls flying in daylight, whispers about someone called You-Know-Who. He dismisses it all and says nothing to his wife. That night, Albus Dumbledore appears on their street.",
    },
    {
      pageNumber: 6,
      content:
        "Dumbledore meets Professor McGonagall, who has been watching the Dursley house all day in the form of a cat. They discuss the fall of Voldemort and the fate of the infant Harry Potter. A giant named Hagrid arrives on a flying motorcycle carrying the baby. Dumbledore places Harry on the Dursleys' doorstep with an explanatory letter, and the three part ways.",
    },
  ],
};

// Lookup map: id → Book (gộp tất cả sách)
export const ALL_BOOKS: Book[] = [...POPULAR_BOOKS, ...RECOMMENDED_AUDIOBOOKS];

export function getBookById(id: string): Book | undefined {
  if (ACTIVE_BOOK.id === id) return ACTIVE_BOOK;
  return ALL_BOOKS.find((b) => b.id === id);
}
