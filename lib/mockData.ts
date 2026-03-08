// Type exports only — data đã chuyển sang data/books.json + /api/books

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

  coverHQ?: string        // High-res cover — dùng cho hero card, book reader

  // Optional fields — dùng để detect content type
  pages?: BookPage[]      // có → là ebook, hiện nút "Read"
  audioUrl?: string       // có → là audiobook, hiện nút "Play"
                          // có cả 2 → xuất hiện ở cả 2 tab, hiện cả 2 nút

  // Pricing
  isFree?: boolean      // true → badge "Free", nút "Get Free"
  price?: number        // undefined nếu isFree. VD: 9.99

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
