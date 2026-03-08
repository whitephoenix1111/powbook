# Digital Library Hub - Bento UI (E-book & Audiobook)

## 1. Tổng quan dự án

Nền tảng quản lý nội dung số (E-book và Audiobook) với giao diện Bento Grid phong cách Retro Editorial. Fresher Portfolio Project. **Business model: Freemium** — Free / Paid / Owned.

---

## 2. Tech Stack

| Layer | Công nghệ |
|---|---|
| Frontend | Next.js 15 (App Router), TypeScript, Tailwind CSS, Shadcn/ui |
| State (client) | Zustand — Audio Player + Book Panel + Auth + Library (UI cache, không persist) |
| Data layer | JSON files + Next.js API Routes (App Router) |
| Auth token | JWT lưu httpOnly cookie — không dùng localStorage |
| Audio | MP3 từ LibriVox / archive.org |
| Ảnh bìa | OpenLibrary CDN (`cover`) + Google Books `fife=w800` (`coverHQ`) |
| Icons | Lucide React |
| Fonts | Fraunces (display/serif) + Plus Jakarta Sans (body) — via next/font/google |

---

## 3. Kiến trúc Layout

```
app/(main)/layout.tsx  → Shell: Sidebar + Navbar + AudioPlayer (render 1 lần)
app/(auth)/            → KHÔNG có shell (login/signin)
AudioPlayer            → fixed bottom, Zustand audioStore
```

---

## 4. Cấu trúc thư mục

```
app/
├── (auth)/login/page.tsx
├── (auth)/signin/page.tsx
├── (main)/layout.tsx
├── (main)/page.tsx
├── (main)/category/page.tsx         → Suspense wrapper
├── (main)/category/CategoryContent.tsx  → logic thực sự
├── (main)/saved/page.tsx
├── (main)/book/[id]/page.tsx
└── api/
    ├── auth/register/route.ts
    ├── auth/login/route.ts
    ├── auth/logout/route.ts
    ├── auth/me/route.ts
    ├── books/route.ts             # GET ?id= | ?ids= | (all)
    ├── library/route.ts           # GET + POST owned/wishlist/lists
    └── ratings/route.ts           # GET + POST ✓ done

data/
├── books.json                     # Book catalog — source of truth
├── users.json                     # [{ id(UUID), email, passwordHash, createdAt }]
├── library.json                   # [{ userId(FK→users.id), ownedBookIds[], wishlistIds[], lists[] }]
└── ratings.json                   # { [bookId]: { baseRating, baseCount, votes } }

lib/
├── auth.ts                        # Server-only: hashPassword, verifyPassword, signJWT, verifyJWT
├── mockData.ts                    # TYPE EXPORTS ONLY — Book, BookPage, Genre (data đã xóa)
└── store/
    ├── audioStore.ts
    ├── bookPanelStore.ts
    ├── authStore.ts
    ├── libraryStore.ts
    └── toastStore.ts
```

---

## 5. Book Type & Genre

```ts
type Genre = 'history' | 'fiction' | 'science-technology' | 'dark-thriller'
type Book = {
  id: string; title: string; author: string; cover: string
  coverHQ?: string     // Google Books fife=w800 — dùng cho hero card + side panel
  rating: number; ratingCount: string; genres: Genre[]
  pages?: BookPage[]   // có → ebook
  audioUrl?: string    // có → audiobook
  isFree?: boolean; price?: number
  length?: string; narrator?: string; format?: string
  publisher?: string; released?: string; description?: string
}
```

`lib/mockData.ts` chỉ còn type exports — **KHÔNG có data constants**. Mọi data fetch từ `/api/books`.

---

## 6. Data Schema

### `data/users.json`
```json
[{ "id": "uuid-v4", "email": "user@example.com", "passwordHash": "salt:hash", "createdAt": 1234567890 }]
```

### `data/library.json`
```json
[{ "userId": "uuid-v4", "ownedBookIds": ["1"], "wishlistIds": ["2"], "lists": [{ "id": "list_123", "name": "Favorites", "bookIds": ["1"], "createdAt": 0 }] }]
```

### `data/books.json`
Array of Book objects — 10 cuốn, id 1–10. `coverHQ` dùng Google Books `fife=w800`.

---

## 7. Auth & Session ✓ Done

```
POST /api/auth/register → hash (scrypt) → ghi users.json → set cookie
POST /api/auth/login    → verify → set cookie: lv_session (JWT, httpOnly, 7d)
POST /api/auth/logout   → clear cookie
GET  /api/auth/me       → verify → { user: { id, email } } | { user: null }
```

JWT payload: `{ userId, email, iat, exp }`.
Client: `authStore` hydrate từ `/api/auth/me` khi layout mount.

---

## 8. Library ✓ Done

```
GET  /api/library  → verify cookie → resolve IDs → Book[]
POST /api/library  → { action, payload }
```

Actions: `acquire` | `toggleWishlist` | `removeWishlist` | `createList` | `renameList` | `deleteList` | `addToList` | `removeFromList`

`libraryStore` = client cache, optimistic update + rollback nếu lỗi.

---

## 9. Books API ✓ Done

```
GET /api/books           → toàn bộ catalog
GET /api/books?id=1      → 1 book
GET /api/books?ids=1,2,3 → nhiều books
```

**Tất cả pages** đều fetch `/api/books` — không còn import data từ `mockData.ts`.

---

## 10. Ratings ✓ Done

`data/ratings.json` + `app/api/ratings/route.ts`
- GET: effective rating (weighted average)
- POST `{ bookId, email, stars }`: upsert vote
- Chỉ user đã owned mới rate được

---

## 11. Business Model — Freemium Flow

```
isFree = true  → [Get Free]    → acquire() → ownedBooks
isFree = false → [Buy · $X.XX] → acquire() → ownedBooks (mock)
isOwned = true → [✓ In Library] → [Read] / [Play] unlock
```

**Auth guard trên tất cả actions:** Buy, Wishlist, Add to List — nếu chưa login → close panel + redirect `/signin`.

---

## 12. Routes & Filter Logic

| Route | Tính năng |
|---|---|
| `/` | Bento Grid, fetch `/api/books`, split ebooks/audiobooks/activeBook |
| `/category` | Filter type (E-Books/Audiobooks/All) + genre + search (`?q=&type=`) |
| `/saved` | Tabs: Titles + Wishlist + Lists — **tất cả require login**, AuthGate per tab |
| `/book/[id]` | Reader 2 cột, fetch `/api/books?id=` |

### Search flow
Navbar search (Enter) → `/category?q=...&type=All` → CategoryContent đọc `?q=` param, filter trên toàn catalog.

---

## 13. AuthGate Pattern

Dùng ở `/saved` cho **Titles, Wishlist, Lists** — mỗi tab có copy riêng:
- Titles → "Sign in to see your library"
- Wishlist → "Sign in to use Wishlist"  
- Lists → "Sign in to use Lists"

Tương tự trong `BookSidePanel`: Buy / Wishlist / AddToList đều guard `!currentUser → redirect /signin`.

---

## 14. Cover Images

- `cover`: OpenLibrary CDN — dùng cho card nhỏ (grid, scroll row)
- `coverHQ`: Google Books `fife=w800` — dùng cho `HeroBentoCard` (priority + quality=90) và `BookSidePanel`
- `next.config.ts` whitelist: `covers.openlibrary.org`, `books.google.com`, `api.dicebear.com`

---