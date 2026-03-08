# HLD — High-Level Design
## Powbook · Digital Library Hub (E-book & Audiobook)

> **Dự án:** Fresher Portfolio Project — Nền tảng quản lý nội dung số với giao diện Bento Grid phong cách Retro Editorial.  
> **Business model:** Freemium — Free / Paid / Owned.

---

## 1. System Overview

Powbook là một Single-Page Web Application xây dựng trên **Next.js 15 (App Router)**, cho phép người dùng duyệt, mua, lưu và đọc/nghe E-book & Audiobook.

```
┌─────────────────────────────────────────────────────────────────┐
│                         BROWSER (Client)                        │
│                                                                 │
│  ┌──────────┐  ┌─────────────────────────────────────────────┐  │
│  │ Sidebar  │  │               Main Content Area             │  │
│  │ (72px)   │  │  ┌──────────────────────────────────────┐   │  │
│  │          │  │  │           Navbar (64px)              │   │  │
│  │ Home     │  │  └──────────────────────────────────────┘   │  │
│  │ Category │  │  ┌──────────────────────────────────────┐   │  │
│  │ Saved    │  │  │  Page Content (overflow-y-auto)      │   │  │
│  │          │  │  │  (Dashboard / Category / Saved /     │   │  │
│  │ Settings │  │  │   Book Reader)                       │   │  │
│  │ Support  │  │  └──────────────────────────────────────┘   │  │
│  │ Logout   │  │  ┌──────────────────────────────────────┐   │  │
│  └──────────┘  │  │       AudioPlayer (fixed bottom)     │   │  │
│                │  └──────────────────────────────────────┘   │  │
│                └─────────────────────────────────────────────┘  │
│                                                                 │
│  ┌────────────────────────┐   ┌──────────────────────────────┐  │
│  │  BookSidePanel (280px) │   │  Toaster (fixed overlay)     │  │
│  │  (slide in/out)        │   └──────────────────────────────┘  │
│  └────────────────────────┘                                     │
└─────────────────────────────────────────────────────────────────┘
                         │  HTTP (fetch)
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Next.js API Routes (Server)                  │
│                                                                 │
│   /api/auth/register   /api/auth/login                          │
│   /api/auth/logout     /api/auth/me                             │
│   /api/books           /api/library                             │
│   /api/ratings                                                  │
└─────────────────────────────────────────────────────────────────┘
                         │  fs (Node.js)
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                       Data Layer (JSON files)                   │
│                                                                 │
│   data/books.json      data/users.json                          │
│   data/library.json    data/ratings.json                        │
└─────────────────────────────────────────────────────────────────┘
```

---

## 2. Tech Stack

| Layer | Công nghệ | Ghi chú |
|---|---|---|
| Framework | Next.js 15 (App Router) | |
| Language | TypeScript | strict mode |
| Styling | Tailwind CSS + CSS variables | Design token qua `--color-*` |
| UI Components | Shadcn/ui | Button, Sheet, Scroll Area… |
| Client State | Zustand (5 stores) | Không persist, không dùng localStorage |
| Auth token | JWT — httpOnly cookie | `lv_session`, 7 ngày, scrypt hash |
| Data storage | JSON files (Node fs) | books / users / library / ratings |
| Audio | HTML `<audio>` element | MP3 từ LibriVox / archive.org |
| Fonts | Fraunces (display) + Plus Jakarta Sans (body) | via `next/font/google` |
| Icons | Lucide React | |
| Avatars | DiceBear API (`adventurer` style) | seed = user email |
| Ảnh bìa | OpenLibrary CDN + Google Books (`fife=w800`) | |

---

## 3. Rendering Strategy

| Route | Strategy | Lý do |
|---|---|---|
| `app/layout.tsx` | **Server Component** | Chỉ load fonts + metadata |
| `app/(main)/layout.tsx` | **Client Component** (`"use client"`) | Cần `useEffect` để `hydrate()` auth từ cookie; render Shell (Sidebar, Navbar, AudioPlayer, BookSidePanel, Toaster) |
| `app/(main)/page.tsx` | **Client Component** | Fetch `/api/books`, quản lý filter state |
| `app/(main)/category/page.tsx` | **Server Component** | Chỉ là Suspense wrapper |
| `app/(main)/category/CategoryContent.tsx` | **Client Component** | Đọc `useSearchParams()` |
| `app/(main)/saved/page.tsx` | **Client Component** | Truy cập Zustand stores |
| `app/(main)/book/[id]/page.tsx` | **Client Component** | Fetch book theo `useParams()` |
| `app/(auth)/login/page.tsx` | **Client Component** | Form state, gọi `authStore.register()` |
| `app/(auth)/signin/page.tsx` | **Client Component** | Form state, gọi `authStore.login()` |

**Kết luận:** Toàn bộ pages chính là **CSR (Client-Side Rendering)** — dữ liệu được fetch bằng `fetch()` từ browser sau khi hydrate. Không dùng SSR data fetching (`async` Server Components có data fetch). Static pages: không có.

---

## 4. Architecture Diagram — Layout Shell

```
app/layout.tsx  (Server)
└── <html> + fonts + globals.css
    ├── app/(auth)/login/page.tsx     ← NO shell
    ├── app/(auth)/signin/page.tsx    ← NO shell
    └── app/(main)/layout.tsx  (Client — "use client")
        │  useEffect → authStore.hydrate() → GET /api/auth/me
        │
        ├── <Sidebar />              — fixed left, 72px
        ├── <Navbar />               — top bar, 64px
        ├── {children}               — page content (overflow-y-auto)
        ├── <Footer />               — dưới content
        ├── <BookSidePanel />        — slide right (0 → 280px) qua CSS transition
        ├── <AudioPlayer />          — fixed bottom strip (hiện khi có currentBook)
        └── <Toaster />              — fixed overlay, auto-dismiss 3s
```

**Đặc điểm quan trọng:**
- Shell render **1 lần duy nhất**, AudioPlayer và BookSidePanel không bị re-mount khi navigate giữa các pages.
- `BookSidePanel` ẩn/hiện bằng CSS `width: 0 / 280px` + `transition` — không unmount component.
- Auth route group `(auth)` **không có shell** — layout riêng biệt, không có Sidebar/Navbar.

---

## 5. Data Flow

### 5.1 Catalog Flow
```
Page mount
  → fetch("/api/books")
  → API: readBooks() từ data/books.json
  → trả về Book[]
  → Client lọc:
      ebooks     = books.filter(b => b.pages && !b.audioUrl)
      audiobooks = books.filter(b => b.audioUrl)
      activeBook = books.find(b => b.id === "10")   ← hero card
  → Render BentoGrid / scroll row / filter list
```

### 5.2 Library Flow (Client Cache + Optimistic Update)
```
Auth hydrate
  → authStore.hydrate() → GET /api/auth/me → set currentUser
  → libraryStore.setUser(userId) → GET /api/library
      → API: verifyJWT(cookie) → readLibraryDB() → resolveBooks(ids → Book[])
      → trả về { ownedBooks, wishlist, lists }
      → set libraryStore state

User action (ví dụ: acquire)
  → libraryStore.acquire(book)
  → Optimistic: set ownedBooks = [..., book]
  → POST /api/library { action: "acquire", payload: { bookId } }
      → API: verifyJWT → upsert library.json
      → trả về resolved library
  → Nếu lỗi: rollback state về trước
```

### 5.3 Rating Flow
```
BookSidePanel mount
  → fetch("/api/ratings") → { [bookId]: { rating, countStr, votes } }
  → hiển thị StarDisplay với effective rating
  → nếu owned + logged in: hiển thị StarInput (interactive)

User vote (chỉ khi isOwned)
  → POST /api/ratings { bookId, email, stars }
  → API: upsert votes[email] = stars trong ratings.json
  → computeEffective() → trả về { rating, countStr, userVote }
  → cập nhật ratingData state trong panel
```

---

## 6. Auth Flow

```
                    ┌──────────────┐
                    │  App mount   │
                    └──────┬───────┘
                           │
                    hydrate() → GET /api/auth/me
                           │
              ┌────────────┴────────────┐
              │ cookie valid            │ no cookie / invalid
              ▼                         ▼
    set currentUser               currentUser = null
    libraryStore.setUser()        (không redirect tự động)
              │
              ▼
    Mọi action cần auth (Buy / Wishlist / AddToList)
              │
    !currentUser → close panel → router.push("/signin")

──────────────────────────────────────────────
POST /api/auth/register
  body: { email, password }
  → scrypt hash → ghi users.json (UUID id)
  → set cookie lv_session (JWT, httpOnly, 7d)
  → trả về { id, email }

POST /api/auth/login
  body: { email, password }
  → verifyPassword (scrypt) → so sánh hash
  → set cookie lv_session
  → trả về { ok, id, email }

POST /api/auth/logout
  → clear cookie lv_session
  → client: clearUser() + redirect /signin

GET /api/auth/me
  → verifyJWT(cookie) → trả về { user: { id, email } }
  → nếu không hợp lệ → { user: null }
```

**JWT payload:** `{ userId, email, iat, exp }` — expire 7 ngày.  
**Client không bao giờ đọc JWT trực tiếp** — chỉ server verify qua httpOnly cookie.

---

## 7. Business Logic Overview

### Freemium Model
```
Book.isFree = true   → "Get Free"  button → acquire() → ownedBooks
Book.isFree = false  → "Buy · $X"  button → acquire() → ownedBooks (mock payment)
Book.isOwned = true  → "✓ In Library" + [Read] (ebook) / [Play] (audio) unlocked
```

### Content Type Matrix
| `pages` | `audioUrl` | Type | Actions khi Owned |
|---|---|---|---|
| ✓ | ✗ | E-Book only | Read → `/book/[id]` |
| ✗ | ✓ | Audiobook only | Play → AudioPlayer |
| ✓ | ✓ | E-Book + Audiobook | Read + Play Audiobook (cả hai) |

### Auth Guard Pattern
Tất cả actions cần auth đều theo pattern nhất quán:
```typescript
if (!currentUser) {
  close();           // đóng BookSidePanel
  router.push("/signin");
  return;
}
// ... thực hiện action
```

---

## 8. Key Design Decisions

| Quyết định | Lý do |
|---|---|
| JSON files thay vì database | Portfolio project — không cần infra, đơn giản hóa setup |
| Zustand không persist | State là cache của server data; httpOnly cookie giữ session — tránh stale state |
| AudioPlayer render 1 lần trong layout | Tránh audio bị dừng/re-mount khi navigate giữa pages |
| BookSidePanel ẩn bằng CSS width transition | Tránh unmount + remount — giữ scroll position, smooth UX |
| Optimistic update + rollback | UX nhanh hơn; rollback khi API fail bảo đảm consistency |
| `coverHQ` riêng cho hero cards | Google Books `fife=w800` chất lượng cao hơn OpenLibrary CDN |
| `next/font/google` self-hosted | Tránh external font request, tăng performance + privacy |
| DiceBear avatar từ email | Không cần user upload ảnh — auto-generate duy nhất theo email seed |
| Callback ref cho `<audio>` element | Đảm bảo `audioRef` được set trước khi bất kỳ `useEffect` nào chạy |
| `playPromiseRef` để tránh AbortError | Web Audio API yêu cầu đợi `play()` resolve trước khi gọi `pause()` |

---

## 9. External Dependencies & Image Domains

Whitelist trong `next.config.ts`:
- `covers.openlibrary.org` — book cover thumbnails (dùng cho card nhỏ)
- `books.google.com` — high-quality covers (`coverHQ`, hero card + side panel)
- `api.dicebear.com` — user avatars (svg, seed từ email)

Audio sources:
- LibriVox — public domain audiobooks
- `archive.org` — audio file hosting

---

*Xem [LLD.md](./LLD.md) để biết chi tiết folder structure, component hierarchy và API contract.*  
*Xem [docs/features/](./features/) để biết thiết kế từng feature.*
