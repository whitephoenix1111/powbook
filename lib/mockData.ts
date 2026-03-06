// Mock data types & data for development

export type Genre = 'history' | 'fiction' | 'science-technology' | 'dark-thriller'

export interface Book {
  id: string
  title: string
  author: string
  narrator?: string
  cover: string
  rating: number
  ratingCount: string
  genres: Genre[]         // multi-value, filter bằng .includes()

  // Optional fields — dùng để detect content type
  pages?: BookPage[]      // có → là ebook, hiện nút "Read"
  audioUrl?: string       // có → là audiobook, hiện nút "Play"
                          // có cả 2 → xuất hiện ở cả 2 tab, hiện cả 2 nút

  // Metadata phụ
  length?: string
  format?: string
  publisher?: string
  released?: string
  description?: string
}

export interface BookPage {
  pageNumber: number
  chapter?: string
  content: string
}

export const POPULAR_BOOKS: Book[] = [
  {
    id: "1",
    title: "The Great Gatsby",
    author: "F. Scott Fitzgerald",
    cover: "https://covers.openlibrary.org/b/id/8432463-L.jpg",
    rating: 5,
    ratingCount: "2.1K",
    genres: ["fiction"],
    pages: [
      {
        pageNumber: 1,
        chapter: "Chapter 1",
        content:
          "In my younger and more vulnerable years my father gave me some advice that I've been turning over in my mind ever since. Whenever you feel like criticizing anyone, he told me, just remember that all the people in this world haven't had the advantages that you've had.",
      },
      {
        pageNumber: 2,
        content:
          "He didn't say any more, but we've always been unusually communicative in a reserved way, and I understood that he meant a great deal more than that.",
      },
    ],
  },
  {
    id: "2",
    title: "One Hundred Years of Solitude",
    author: "Gabriel G. Márquez",
    cover: "https://covers.openlibrary.org/b/id/10519563-L.jpg",
    rating: 4,
    ratingCount: "3.4K",
    genres: ["fiction", "history"],
    pages: [
      {
        pageNumber: 1,
        chapter: "Chapter 1",
        content:
          "Many years later, as he faced the firing squad, Colonel Aureliano Buendía was to remember that distant afternoon when his father took him to discover ice.",
      },
    ],
  },
  {
    id: "3",
    title: "To Kill a Mockingbird",
    author: "Harper Lee",
    cover: "https://covers.openlibrary.org/b/id/8739161-L.jpg",
    rating: 5,
    ratingCount: "4.2K",
    genres: ["fiction", "dark-thriller"],
    pages: [
      {
        pageNumber: 1,
        chapter: "Part One",
        content:
          "When he was nearly thirteen, my brother Jem got his arm badly broken at the elbow. When it healed, and Jem's fears of never being able to play football were assuaged, he was seldom self-conscious about his injury.",
      },
    ],
  },
  {
    id: "4",
    title: "Of Human Bondage",
    author: "William Somerset Maugham",
    cover: "https://covers.openlibrary.org/b/id/12818862-L.jpg",
    rating: 4,
    ratingCount: "1.8K",
    genres: ["fiction"],
    pages: [
      {
        pageNumber: 1,
        chapter: "Chapter 1",
        content:
          "The day broke grey and dull. The clouds hung heavily, and there was a rawness in the air that suggested snow.",
      },
    ],
  },
  {
    id: "5",
    title: "Breaking Dawn (The Twilight Saga #4)",
    author: "Stephenie Meyer",
    cover: "https://covers.openlibrary.org/b/id/8267032-L.jpg",
    rating: 4,
    ratingCount: "5.6K",
    genres: ["fiction", "dark-thriller"],
    pages: [
      {
        pageNumber: 1,
        chapter: "Preface",
        content:
          "I'd had more than my fair share of near-death experiences; it wasn't something you ever really got used to.",
      },
    ],
  },
]

export const RECOMMENDED_AUDIOBOOKS: Book[] = [
  {
    id: "6",
    title: "My Year Abroad",
    author: "Chang-rae Lee",
    cover: "https://covers.openlibrary.org/b/id/12818856-L.jpg",
    rating: 4,
    ratingCount: "980",
    genres: ["fiction"],
    length: "18 hr 24 min",
    description: "A wildly original novel about food, adventure, and the unexpected power of human connection across cultural boundaries.",
    audioUrl: "https://archive.org/download/alice_wonderland_librivox/awic_01_carroll_64kb.mp3",
  },
  {
    id: "7",
    title: "Quidditch Through the Ages",
    author: "J.K. Rowling",
    cover: "https://covers.openlibrary.org/b/id/8385449-L.jpg",
    rating: 5,
    ratingCount: "7.3K",
    genres: ["fiction", "history"],
    length: "2 hr 10 min",
    description: "A spellbinding and humorous portrait of the fictional sport of Quidditch — the complete history of the game, for Potterheads everywhere.",
    audioUrl: "https://archive.org/download/alice_wonderland_librivox/awic_01_carroll_64kb.mp3",
  },
  {
    id: "8",
    title: "The Great Gatsby",
    author: "F. Scott Fitzgerald",
    cover: "https://covers.openlibrary.org/b/id/8432463-L.jpg",
    rating: 5,
    ratingCount: "2.1K",
    genres: ["fiction"],
    length: "4 hr 38 min",
    description: "A portrait of the Jazz Age in all of its decadence — Jay Gatsby's obsessive pursuit of the past and the elusive green light across the water.",
    audioUrl: "https://archive.org/download/alice_wonderland_librivox/awic_02_carroll_64kb.mp3",
  },
  {
    id: "9",
    title: "Harry Potter and the Sorcerer's Stone",
    author: "J.K. Rowling",
    narrator: "Jim Dale",
    cover: "https://covers.openlibrary.org/b/id/10110415-L.jpg",
    rating: 5,
    ratingCount: "12K",
    genres: ["fiction"],
    length: "8 hr 18 min",
    description: "The boy who lived. Jim Dale's iconic narration brings Hogwarts to life in this unforgettable U.S. edition of the beloved series.",
    audioUrl: "https://archive.org/download/alice_wonderland_librivox/awic_01_carroll_64kb.mp3",
  },
]

// ACTIVE_BOOK — có cả pages lẫn audioUrl → hiện cả 2 nút Read & Play
export const ACTIVE_BOOK: Book = {
  id: "10",
  title: "Harry Potter and the Sorcerer's Stone",
  author: "J.K. Rowling",
  narrator: "Jim Dale",
  cover: "https://covers.openlibrary.org/b/id/10110415-L.jpg",
  rating: 5,
  ratingCount: "1.5K",
  genres: ["fiction"],
  length: "22 hr 56 min",
  format: "E-Book + Audiobook",
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
}

// Lookup map: id → Book (gộp tất cả sách, dedup by id)
export const ALL_BOOKS: Book[] = [...POPULAR_BOOKS, ...RECOMMENDED_AUDIOBOOKS]

export function getBookById(id: string): Book | undefined {
  if (ACTIVE_BOOK.id === id) return ACTIVE_BOOK
  return ALL_BOOKS.find((b) => b.id === id)
}
