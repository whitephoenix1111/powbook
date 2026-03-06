# Digital Library Hub - Bento UI (E-book & Audiobook)

## 1. Tổng quan dự án

Nền tảng quản lý nội dung số (E-book và Audiobook) với giao diện Bento Grid phong cách Retro Editorial. Fresher Portfolio Project.

**Business model: Freemium**
- Sách Free (public domain / LibriVox) → nút "Get Free"
- Sách Paid → nút "Buy · $X.XX"
- Đã owned → nút "Read" / "Play" mới unlock
- Wishlist → lưu sách chưa mua để xem sau

---

## 2. Tech Stack

| Layer | Công nghệ |
|---|---|
| Frontend | Next.js 15 (App Router), TypeScript, Tailwind CSS, Shadcn/ui |
| State Management | Zustand — Audio Player + Library + Book Panel |
| Audio | MP3 free từ LibriVox / archive.org |
| Ảnh bìa | OpenLibrary CDN (free, không cần upload) |
| Icons | Lucide React |

---

## 3. Kiến trúc Layout

```
┌─────────────────────────────────────────────────┐
│  app/(main)/layout.tsx  (render 1 lần duy nhất) │
│                                                 │
│  ┌──────────┐  ┌──────────────────────────────┐ │
│  │ Sidebar  │  │ Navbar (top bar)              │ │
│  │  72px    │  ├──────────────────────────────┤ │
│  │  fixed   │  │ {children} — page content    │ │
│  │          │  │  scroll độc lập              │ │
│  └──────────┘  └──────────────────────────────┘ │
│  AudioPlayer (fixed bottom, toàn app)            │
└─────────────────────────────────────────────────┘

app/(auth)/ — KHÔNG có layout → login/signin ẩn hoàn toàn shell
```

**Nguyên tắc:** Mỗi page trong `(main)` chỉ trả về phần content bên trong slot `children`. Sidebar và Navbar không bị re-mount khi navigate.

---

## 4. Cấu trúc thư mục

```
app/
├── (auth)/
│   ├── login/page.tsx
│   └── signin/page.tsx
├── (main)/
│   ├── layout.tsx             # Shell: Sidebar + Navbar + AudioPlayer
│   ├── page.tsx               # Dashboard
│   ├── category/page.tsx
│   ├── saved/page.tsx
│   └── book/[id]/page.tsx
├── globals.css
└── layout.tsx                 # Root layout: font, metadata

components/
├── ui/                        # Shadcn
├── layout/
│   ├── Sidebar.tsx
│   └── Navbar.tsx
├── bento/
│   ├── BentoGrid.tsx
│   └── BentoCard.tsx
├── book/
│   ├── BookCard.tsx
│   └── BookSidePanel.tsx
├── player/
│   └── AudioPlayer.tsx
└── viewer/
    └── BookTextViewer.tsx

lib/
├── mockData.ts
└── store/
    ├── audioStore.ts
    ├── bookPanelStore.ts
    └── libraryStore.ts        # ownedBooks + wishlist (thay savedStore cũ)
```

---

## 5. Kiến trúc Category & Book Type

### Content type — 2 loại duy nhất
- **E-Books** — detect qua `book.pages`
- **Audiobooks** — detect qua `book.audioUrl`

> Podcasts & Comics đã bỏ hoàn toàn.

### Sub-genre — 4 loại, multi-value
- `history` / `fiction` / `science-technology` / `dark-thriller`

### Book type chính thức
```ts
type Genre = 'history' | 'fiction' | 'science-technology' | 'dark-thriller'

type Book = {
  id: string
  title: string
  author: string
  cover: string
  rating: number
  ratingCount: string
  genres: Genre[]

  pages?: BookPage[]     // có → là ebook
  audioUrl?: string      // có → là audiobook

  // Pricing (Freemium)
  isFree?: boolean       // true → badge "Free", nút "Get Free"
  price?: number         // VD: 9.99 — undefined nếu isFree

  // Metadata phụ
  length?: string
  narrator?: string
  format?: string
  publisher?: string
  released?: string
  description?: string
}
```

---

## 6. Business Model — Freemium Flow

```
BOOK CARD / SIDE PANEL
├── isFree = true   →  [Get Free]       → acquire() → ownedBooks[]
├── isFree = false  →  [Buy · $X.XX]    → acquire() → ownedBooks[]  (mock, no payment)
└── isOwned = true  →  [✓ In Library]   → [Read] / [Play] unlock

WISHLIST (♡ icon)
├── Chưa owned → toggleWishlist() → wishlist[]
└── Đã owned   → disabled (không có nghĩa wishlist sách đã mua)

Khi Buy/Get từ Wishlist → sách tự động rời wishlist, vào ownedBooks
```

### Badge trên card

| Trạng thái | Badge |
|---|---|
| Free, chưa owned | `Free` — viền xanh emerald |
| Paid, chưa owned | `$X.XX` — viền warm-border |
| Đã owned | `✓ Owned` — nền emerald |

---

## 7. State Management

### `libraryStore` (Zustand)
```ts
ownedBooks: Book[]          // Đã Get Free / Buy → hiện ở Saved > Titles
wishlist:   Book[]          // Đã ♡ → hiện ở Saved > Wishlist

isOwned(id): boolean
isWishlisted(id): boolean
acquire(book): void         // Get Free hoặc Buy — mock success
toggleWishlist(book): void  // Guard: không cho wishlist nếu đã owned
removeWishlist(id): void
```

### `audioStore` (Zustand)
- Nguồn sự thật duy nhất cho trạng thái audio
- Persist xuyên navigate (render trong layout)

### `bookPanelStore` (Zustand)
- `selectedBook` — sách đang mở SidePanel
- `toggle(book)` — mở nếu khác, đóng nếu cùng

---

## 8. Routes & Tính năng

| Route | Trang | Tính năng chính |
|---|---|---|
| `/` | Dashboard | Bento Grid, filter tabs (All / E-Books / Audiobooks), BookSidePanel slide-in |
| `/category` | Browse by Category | Filter 2 chiều: content type + genre, badge giá, nút Get/Buy, Wishlist ♡ |
| `/saved` | My Library | Tab Titles (owned) + Tab Wishlist, search, Buy từ Wishlist |
| `/book/[id]` | Book Reader | BookTextViewer 2 cột, text size (CSS var), bookmark (localStorage) |
| `/login` | Create an account | — |
| `/signin` | Sign in | — |

**Sidebar navigation:** Home / Category / Saved / Settings / Support

---

## 9. Filter Logic

| Trang | Filter chiều 1 | Filter chiều 2 |
|---|---|---|
| Dashboard | Tabs: All / E-Books / Audiobooks | — |
| Category | Sidebar: E-Books / Audiobooks | Sidebar: All / History / Fiction / Sci & Tech / Dark & Thriller |
| Saved | Tabs: Titles / Wishlist / Following / Lists / Notebook / History | Search client-side |

```ts
// E-Books:    books.filter(b => b.pages)
// Audiobooks: books.filter(b => b.audioUrl)
// Genre:      books.filter(b => b.genres.includes(selectedGenre))
// Chain:      type filter trước, genre sau
```

---

## 10. Navigation Flow

- Dashboard → click sách → `BookSidePanel` slide-in (không navigate)
- BookSidePanel → `Buy / Get Free` → `acquire()` → nút đổi thành `Read / Play`
- BookSidePanel → `Read` (chỉ hiện sau owned) → navigate `/book/[id]`
- BookSidePanel → `Play` (chỉ hiện sau owned) → set Zustand audioStore
- Category → click card → `BookSidePanel` slide-in
- Saved > Wishlist → `Buy / Get Free` → chuyển sang Titles tab

---

## 11. Quyết định kỹ thuật

| Khâu | Quyết định | Ghi chú |
|---|---|---|
| Nội dung sách | Mock text — `BookPage[]` | — |
| Audio | Zustand + MP3 LibriVox | play/pause/seek/speed/skip ±15s |
| Ảnh bìa | OpenLibrary CDN | — |
| Bookmark | `localStorage` | key: `bookmark_${id}` |
| Text size | CSS variable thật | `--reader-font-size` |
| Payment | Mock — acquire() thành công ngay | Không cần backend |
| Library state | Zustand `libraryStore` | Không persist — reset khi reload |
| Read / Play | Chỉ unlock sau khi owned | UX e-commerce chuẩn |
| Tabs ở /saved | Titles + Wishlist active | Còn lại UI only |

---

## 12. Pricing Data (Mock)

| Sách | Giá |
|---|---|
| My Year Abroad | Free (LibriVox) |
| Quidditch Through the Ages | Free (LibriVox) |
| The Great Gatsby (ebook) | $9.99 |
| One Hundred Years of Solitude | $12.99 |
| To Kill a Mockingbird | $11.99 |
| Of Human Bondage | $8.99 |
| Breaking Dawn | $10.99 |
| The Great Gatsby (audiobook) | $14.99 |
| Harry Potter (audiobook id:9) | $19.99 |
| Harry Potter ACTIVE_BOOK | $24.99 |

---

## 13. Trạng thái & Việc cần làm tiếp

### Đã hoàn chỉnh
- Toàn bộ 6 routes, layout shell, AudioPlayer global
- BookTextViewer, Bookmark (localStorage)
- Freemium flow: Get Free / Buy / Wishlist / My Library
- libraryStore thay thế savedStore cũ

### Có thể làm tiếp
- Dashboard: thêm badge giá + nút Buy vào BentoCard
- Persist libraryStore với `zustand/middleware/persist` (localStorage)
- BookSidePanel: nút Read/Play hiện sample trước khi owned (UX khuyến khích mua)
- Saved > Titles: phân biệt ebook / audiobook bằng icon nhỏ
