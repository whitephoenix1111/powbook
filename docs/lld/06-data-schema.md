# LLD 06 — Data Schema

---

## TypeScript Types (`lib/mockData.ts`)

```typescript
type Genre = 'history' | 'fiction' | 'science-technology' | 'dark-thriller'

interface Book {
  id:          string       // "1" → "10"
  title:       string
  author:      string
  narrator?:   string       // chỉ audiobook
  cover:       string       // OpenLibrary CDN URL — dùng cho card nhỏ
  coverHQ?:    string       // Google Books fife=w800 — hero card + side panel
  rating:      number       // base rating (float, VD: 4.5)
  ratingCount: string       // display string ("1.2k", "843")
  genres:      Genre[]      // multi-value — filter dùng .includes()

  // Content type detection
  pages?:      BookPage[]   // có → là ebook → hiện nút [Read]
  audioUrl?:   string       // có → là audiobook → hiện nút [Play]
                            // có cả 2 → E-Book + Audiobook

  // Pricing
  isFree?:     boolean      // true → badge "FREE", nút "Get Free"
  price?:      number       // undefined nếu isFree. VD: 9.99

  // Metadata (hiển thị trong BookSidePanel)
  length?:     string       // "8h 30m" hoặc "320 pages"
  format?:     string       // "Audiobook" | "E-Book"
  publisher?:  string
  released?:   string       // năm: "2023"
  description?: string
}

interface BookPage {
  pageNumber: number
  chapter?:   string   // tên chapter/phần (hiển thị đầu trang trái)
  content:    string   // body text
}
```

**Content type matrix:**

| `pages` | `audioUrl` | Type | Reader | Player |
|---|---|---|---|---|
| ✓ | ✗ | E-Book | `/book/[id]` | — |
| ✗ | ✓ | Audiobook | — | AudioPlayer |
| ✓ | ✓ | E-Book + Audio | `/book/[id]` | AudioPlayer |

---

## `data/books.json`

Array of Book objects. 10 cuốn, id string "1" → "10". Source of truth cho catalog.

```json
[
  {
    "id": "1",
    "title": "Example Title",
    "author": "Author Name",
    "cover": "https://covers.openlibrary.org/b/id/XXXXXXX-L.jpg",
    "coverHQ": "https://books.google.com/books/content?id=XXXXX&printsec=frontcover&img=1&zoom=1&edge=curl&source=gbs_api&fife=w800",
    "rating": 4.5,
    "ratingCount": "1.2k",
    "genres": ["fiction"],
    "pages": [
      { "pageNumber": 1, "chapter": "Chapter I", "content": "..." },
      { "pageNumber": 2, "content": "..." }
    ],
    "isFree": true,
    "length": "320 pages",
    "format": "E-Book",
    "publisher": "Publisher Name",
    "released": "2023",
    "description": "..."
  }
]
```

**Note:** Book id="10" được dùng làm hero card cứng trong dashboard (`page.tsx`).

---

## `data/users.json`

```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@example.com",
    "passwordHash": "a3f8b2c1d4e5f6a7:8b9c0d1e2f3a4b5c...",
    "createdAt": 1700000000000
  }
]
```

- `id`: UUID v4 (random, `crypto.randomUUID()`)
- `passwordHash`: `"salt_hex:scrypt_hash_hex"` (scrypt 64 bytes, salt 16 bytes)
- `createdAt`: Unix timestamp milliseconds

---

## `data/library.json`

```json
[
  {
    "userId": "550e8400-e29b-41d4-a716-446655440000",
    "ownedBookIds": ["1", "3"],
    "wishlistIds": ["5", "7"],
    "lists": [
      {
        "id": "list_1700000000000",
        "name": "Favorites",
        "bookIds": ["1"],
        "createdAt": 1700000000000
      }
    ]
  }
]
```

- Một record per user (upsert pattern)
- Lưu IDs, không lưu Book objects → join với `books.json` khi GET
- `lists[].id`: `"list_${Date.now()}"` — generated client-side trong `libraryStore.createList()`

**Resolve flow (server-side GET):**
```
readLibraryDB() → find record by userId
readBooksDB()   → full catalog
resolveBooks(ids, catalog) → filter + map ids → Book[]
→ { ownedBooks: Book[], wishlist: Book[], lists: [{...books: Book[]}] }
```

---

## `data/ratings.json`

```json
{
  "1": {
    "baseRating": 4.5,
    "baseCount": 1200,
    "votes": {
      "alice@example.com": 5,
      "bob@example.com": 4
    }
  },
  "2": {
    "baseRating": 4.2,
    "baseCount": 843,
    "votes": {}
  }
}
```

- Key: bookId string
- `baseRating` + `baseCount`: seed data (mock initial ratings)
- `votes`: user votes, key = email, value = 1–5. Upsert — user có thể vote lại.
- Effective rating: weighted average của base + votes

**Effective rating formula:**
```typescript
function computeEffective(entry: RatingEntry) {
  const allVotes   = Object.values(entry.votes);
  const extraSum   = allVotes.reduce((a, b) => a + b, 0);
  const totalCount = entry.baseCount + allVotes.length;
  const totalSum   = entry.baseRating * entry.baseCount + extraSum;
  return {
    rating: totalCount > 0
      ? Math.round((totalSum / totalCount) * 10) / 10
      : entry.baseRating,
    count: totalCount,
  };
}
```

**Count display format:**
```typescript
function formatCount(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
}
```

---

## Image URLs

| Field | Source | Dùng ở |
|---|---|---|
| `cover` | `https://covers.openlibrary.org/b/id/{id}-L.jpg` | Tất cả cards nhỏ |
| `coverHQ` | `https://books.google.com/books/content?...&fife=w800` | HeroBentoCard, BookSidePanel |
| Avatar | `https://api.dicebear.com/7.x/adventurer/svg?seed={email}` | Navbar user dropdown |

`next.config.ts` whitelist: `covers.openlibrary.org`, `books.google.com`, `api.dicebear.com`, `i.pravatar.cc`

---

*← [05 - API Contract](./05-api-contract.md) | Tiếp theo: [07 - Design Patterns](./07-design-patterns.md)*
