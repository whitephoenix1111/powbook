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
| Ảnh bìa | OpenLibrary CDN |
| Icons | Lucide React |

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
├── (main)/category/page.tsx
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
├── books.json                     # Book catalog — source of truth cho product data
├── users.json                     # [{ id(UUID), email, passwordHash, createdAt }]
├── library.json                   # [{ userId(FK→users.id), ownedBookIds[], wishlistIds[], lists[{id,name,bookIds[]}] }]
└── ratings.json                   # { [bookId]: { baseRating, baseCount, votes } }

lib/
├── auth.ts                        # Server-only: hashPassword, verifyPassword, signJWT, verifyJWT
├── mockData.ts                    # Book catalog — DEPRECATED, giữ lại cho type exports
└── store/
    ├── audioStore.ts              # Zustand — player state
    ├── bookPanelStore.ts          # Zustand — selected book
    ├── authStore.ts               # Zustand — currentUser { id, email } (client cache)
    ├── libraryStore.ts            # Zustand — owned/wishlist/lists (client cache, sync từ API)
    └── toastStore.ts
```

---

## 5. Book Type & Genre

```ts
type Genre = 'history' | 'fiction' | 'science-technology' | 'dark-thriller'
type Book = {
  id: string; title: string; author: string; cover: string
  rating: number; ratingCount: string; genres: Genre[]
  pages?: BookPage[]   // có → ebook
  audioUrl?: string    // có → audiobook
  isFree?: boolean; price?: number
  length?: string; narrator?: string; format?: string
  publisher?: string; released?: string; description?: string
}
```

Book type vẫn import từ `lib/mockData.ts` (chỉ dùng type, không dùng data).
Catalog data thực tế nằm ở `data/books.json`.

---

## 6. Data Schema

### `data/users.json`
```json
[
  {
    "id": "uuid-v4",
    "email": "user@example.com",
    "passwordHash": "salt:hash (scrypt)",
    "createdAt": 1234567890
  }
]
```

### `data/library.json`
```json
[
  {
    "userId": "uuid-v4",
    "ownedBookIds": ["1", "3"],
    "wishlistIds": ["2"],
    "lists": [
      { "id": "list_123", "name": "Favorites", "bookIds": ["1"], "createdAt": 1234567890 }
    ]
  }
]
```
> `userId` là FK trỏ vào `users[].id` — KHÔNG lưu email hay full Book object.

### `data/books.json`
Array of Book objects — source of truth. `library.json` chỉ lưu IDs, khi GET `/api/library` sẽ resolve IDs → Books từ file này.

---

## 7. Auth & Session ✓ Done

```
POST /api/auth/register → hash password (scrypt) → ghi users.json (với UUID) → set cookie
POST /api/auth/login    → verify → set cookie: lv_session (JWT, httpOnly, 7d)
POST /api/auth/logout   → clear cookie (maxAge=0)
GET  /api/auth/me       → verify cookie → { user: { id, email } } | { user: null }
```

JWT payload: `{ userId, email, iat, exp }` — không lưu password.
Client: `authStore` giữ `currentUser: { id, email }`, hydrate từ `/api/auth/me` khi layout mount.
`localStorage["lv_auth"]` đã bị xoá (cleanup trong layout.tsx useEffect).

---

## 8. Library ✓ Done

```
GET  /api/library        → verify cookie → lấy userId → find record trong library.json → resolve IDs → trả Book[]
POST /api/library        → { action, payload: { bookId?, listId?, name? } }
```

Actions: `acquire` | `toggleWishlist` | `removeWishlist` | `createList` | `renameList` | `deleteList` | `addToList` | `removeFromList`

`libraryStore` là **client cache** — optimistic update trước, gọi API sau, rollback nếu lỗi.
`localStorage["lv_library"]` đã bị xoá.

---

## 9. Books API ✓ Done

```
GET /api/books           → toàn bộ catalog
GET /api/books?id=1      → 1 book
GET /api/books?ids=1,2,3 → nhiều books
```

---

## 10. Ratings ✓ Done

`data/ratings.json` + `app/api/ratings/route.ts`
- GET: trả về effective rating (weighted average base + user votes)
- POST `{ bookId, email, stars }`: upsert vote, tính lại ngay
- Chỉ user đã owned mới rate được (guard ở client)
- `StarDisplay` (partial fill SVG) + `StarInput` (interactive, hover label)

---

## 11. Business Model — Freemium Flow

```
isFree = true  → [Get Free]    → acquire() → ownedBooks
isFree = false → [Buy · $X.XX] → acquire() → ownedBooks  (mock, no payment)
isOwned = true → [✓ In Library] → [Read] / [Play] unlock
Wishlist: chỉ khi chưa owned. Owned → tự rời wishlist.
```

Badge: Free=emerald | $X.XX=warm-border | Owned=emerald nền.

---

## 12. Routes & Filter Logic

| Route | Tính năng |
|---|---|
| `/` | Bento Grid, tabs All/E-Books/Audiobooks, SidePanel |
| `/category` | Filter type + genre, badge giá |
| `/saved` | Tabs: Titles + Wishlist + Lists (active); Following/Notebook/History UI-only |
| `/book/[id]` | Reader 2 cột, text size CSS var, bookmark localStorage |

Filter: E-Books=`b.pages` / Audiobooks=`b.audioUrl` / Genre=`b.genres.includes()` — chain type trước genre sau.

---

## 13. Quyết định kỹ thuật

| Khâu | Quyết định |
|---|---|
| Book catalog | `data/books.json` — source of truth |
| `mockData.ts` | Giữ lại CHỈ để export `Book`, `BookPage`, `Genre` types |
| Auth | scrypt (Node built-in crypto) + JWT httpOnly cookie |
| Library storage | `userId` FK, chỉ lưu IDs — resolve sang Book khi GET |
| Ratings | JSON file + API ✓ done |
| Audio player | Zustand `audioStore` — persist xuyên navigate |
| Bookmark | `localStorage` key: `bookmark_${id}` |
| Payment | Mock — `acquire()` thành công ngay |
| Greeting home | Theo giờ thực + tên từ email nếu đã login |

---

## 14. Pricing Data

Free: My Year Abroad (id:6), Quidditch Through the Ages (id:7)
Paid: Gatsby ebook $9.99 (id:1) | 100 Years $12.99 (id:2) | Mockingbird $11.99 (id:3) | Of Human Bondage $8.99 (id:4) | Breaking Dawn $10.99 (id:5) | Gatsby audio $14.99 (id:8) | HP audio $19.99 (id:9) | HP E+Audio $24.99 (id:10)

---

## 15. TODO — Còn lại

- [ ] `mockData.ts` — xoá data constants (POPULAR_BOOKS, RECOMMENDED_AUDIOBOOKS, ACTIVE_BOOK, ALL_BOOKS, getBookById), chỉ giữ type exports. Các component đang dùng data này cần chuyển sang fetch `/api/books`
- [ ] Route guard — middleware hoặc `useEffect` redirect `/signin` nếu `!currentUser` trên các trang protected
