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
  rating:      number       // effective rating (float, VD: 4.5)
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
  released?:   string
  description?: string
}

interface BookPage {
  pageNumber: number
  chapter?:   string
  content:    string
}
```

**Content type matrix:**

| `pages` | `audioUrl` | Type | Reader | Player |
|---|---|---|---|---|
| ✓ | ✗ | E-Book | `/book/[id]` | — |
| ✗ | ✓ | Audiobook | — | AudioPlayer |
| ✓ | ✓ | E-Book + Audio | `/book/[id]` | AudioPlayer |

---

## Database — Neon PostgreSQL + Drizzle ORM

Schema defined in `lib/schema.ts`. Migrate/push với `drizzle-kit`.

### `users`
```sql
id            uuid        PRIMARY KEY DEFAULT gen_random_uuid()
email         text        UNIQUE NOT NULL
password_hash text        NOT NULL
created_at    timestamp   DEFAULT now()
```

### `books`
```sql
id            text        PRIMARY KEY   -- "1"–"10"
title         text        NOT NULL
author        text        NOT NULL
narrator      text
cover         text
cover_hq      text
rating        numeric(3,1)
rating_count  text
genres        text[]
audio_url     text
is_free       boolean     DEFAULT false
price         numeric(10,2)
length        text
format        text
publisher     text
released      text
description   text
pages         jsonb       -- BookPage[]
```

### `owned_books`
```sql
user_id   uuid   FK → users.id   ON DELETE CASCADE
book_id   text   FK → books.id   ON DELETE CASCADE
PRIMARY KEY (user_id, book_id)
```

### `wishlist`
```sql
user_id   uuid   FK → users.id   ON DELETE CASCADE
book_id   text   FK → books.id   ON DELETE CASCADE
PRIMARY KEY (user_id, book_id)
```

### `lists`
```sql
id          text        PRIMARY KEY   -- "list_${timestamp}"
user_id     uuid        FK → users.id   ON DELETE CASCADE
name        text        NOT NULL
created_at  timestamp   DEFAULT now()
```

### `list_books`
```sql
list_id   text   FK → lists.id   ON DELETE CASCADE
book_id   text   FK → books.id   ON DELETE CASCADE
PRIMARY KEY (list_id, book_id)
```

### `ratings`
```sql
book_id      text          PRIMARY KEY   FK → books.id   ON DELETE CASCADE
base_rating  numeric(3,1)
base_count   integer
```

### `user_votes`
```sql
book_id   text      FK → ratings.book_id   ON DELETE CASCADE
email     text      NOT NULL
stars     smallint  CHECK (stars BETWEEN 1 AND 5)
PRIMARY KEY (book_id, email)
```

---

## Resolved Library Response Shape

`GET /api/library` trả về (shape giữ nguyên so với trước):

```typescript
// lib/libraryTypes.ts
interface ResolvedLibrary {
  ownedBooks: Book[]
  wishlist:   Book[]
  lists: {
    id:        string
    name:      string
    books:     Book[]
    createdAt: number
  }[]
}
```

---

## Effective Rating Formula

```typescript
function computeEffective(baseRating, baseCount, votes) {
  const extraSum   = votes.reduce((a, v) => a + v.stars, 0);
  const totalCount = baseCount + votes.length;
  const totalSum   = baseRating * baseCount + extraSum;
  return {
    rating: totalCount > 0
      ? Math.round((totalSum / totalCount) * 10) / 10
      : baseRating,
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

`next.config.ts` whitelist: `covers.openlibrary.org`, `books.google.com`, `api.dicebear.com`

---

*← [05 - API Contract](./05-api-contract.md) | Tiếp theo: [07 - Design Patterns](./07-design-patterns.md)*
