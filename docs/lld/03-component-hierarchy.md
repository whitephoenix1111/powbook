# LLD 03 — Component Hierarchy

Mô tả component tree theo từng page. Chỉ bao gồm logic/structure — xem feature docs để biết chi tiết interaction.

---

## Dashboard (`/`) — `app/(main)/page.tsx`

```
DashboardPage
│  State: activeFilter, ebooks[], audiobooks[], activeBook
│  fetch("/api/books") on mount → split catalog
│
├── Page header
│   ├── Greeting + display name (từ email)
│   └── "5-day streak" badge
│
├── Filter tabs [All | E-Books | Audiobooks]
│   └── click "E-Books"/"Audiobooks" → router.push /category?type=...
│
├── BentoGrid #1 — "Featured + Stats"    (grid-cols-4, auto-rows-200px)
│   ├── HeroBentoCard          col-span-2 row-span-2   book id="10"
│   ├── StatCard (inline JSX)  1×1   "24 Books Read"   bg #E8580A
│   ├── StatCard (inline JSX)  1×1   "86h Listened"    bg surface-card
│   ├── BookBentoCard          1×1   ebooks[0]
│   └── BookBentoCard          1×1   ebooks[1]
│
├── Section "Popular This Week"
│   └── BentoGrid #2
│       ├── AudioBentoCard     col-span-2   audiobooks[0]
│       ├── BookBentoCard      1×1          ebooks[2]
│       ├── BookBentoCard      1×1          ebooks[3]
│       ├── QuoteBentoCard     col-span-2   George R.R. Martin
│       └── AudioBentoCard     col-span-2   audiobooks[1]
│
├── Section "Browse by Category"
│   ├── E-Books promo card     → /category   (dark bg #1A1410)
│   └── Audiobooks promo card  → /category   (yellow bg #F5C842)
│
└── Section "Recommended for You" — horizontal scroll (useRef scrollRef)
    ├── Promo card "12 saved books" w-[160px] → /saved
    └── [...ebooks, ...audiobooks].map
        └── MiniBookCard w-[140px] (inline JSX)
            ├── Cover (height 180px, Image fill)
            ├── Audio badge (nếu audioUrl)
            └── Title, Author, length
```

**BentoCard variants:**

| Component | Grid span | Cover | Info position |
|---|---|---|---|
| `HeroBentoCard` | 2×2 | fill, scale on hover | bottom overlay gradient |
| `BookBentoCard` | 1×1 | fill | bottom overlay gradient |
| `AudioBentoCard` | 2×1 | left 180px fixed | right side info panel |
| `QuoteBentoCard` | 2×1 | — | centered quote text |
| `StatBentoCard` | 1×1 | — | icon top, value bottom |

---

## Category (`/category`) — `app/(main)/category/`

```
CategoryPage  (Server — Suspense wrapper)
└── Suspense fallback: skeleton loader
    └── CategoryContent  (Client)
        │  State: contentTab, genreTab, query, allPool[]
        │  fetch("/api/books") on mount
        │  Sync từ URL params: type, q
        │
        ├── aside — Filter sidebar  w-[220px], self-stretch
        │   ├── "Format" section
        │   │   ├── [📖 E-Books]   button (active = brand bg)
        │   │   └── [🎧 Audiobooks] button
        │   ├── Divider
        │   ├── "Genre" section
        │   │   └── [All | History | Fiction | Sci&Tech | Dark&Thriller]
        │   └── Result count  (filtered.length)
        │
        └── main — Content area  flex-1
            ├── Header
            │   ├── Title: "{contentTab} · {genreTab}"
            │   └── Search input (inline, w-[240px], clear X button)
            │
            └── grid cols-2/3/4 (responsive)
                └── BookCard  (local component)
                    ├── Cover (aspect-[2/3], ring border)
                    │   ├── Audio badge (nếu audioUrl + tab != Audiobooks)
                    │   ├── Price/Owned badge (bottom-left)
                    │   └── ♥ Wishlist button (top-left, opacity-0 → group-hover)
                    ├── Title + Author
                    └── [Get Free | Buy · $X | ✓ In Library] CTA button
```

**Filter pipeline:**
```
allPool
  → byType   (E-Books: b.pages / Audiobooks: b.audioUrl / All: true)
  → byGenre  (b.genres.includes(genreTab))
  → filtered (title/author toLowerCase includes query)
```

---

## Saved (`/saved`) — `app/(main)/saved/page.tsx`

```
SavedPage
│  State: activeTab, query, openList
│  Reads: ownedBooks, wishlist, lists từ libraryStore
│
├── h1 "My Library"
├── Tab bar [Titles | Wishlist | Following | Lists | Notebook | History]
│   └── count badge cho Titles, Wishlist, Lists
│
├── Tab "Titles" / "Wishlist"
│   ├── <AuthGate tab="Titles/Wishlist" />    (nếu !isLoggedIn)
│   └── (logged in)
│       ├── Search input
│       ├── EmptyState                         (nếu filtered.length === 0)
│       └── grid cols-1/2/3
│           ├── OwnedBookCard   (Titles tab)
│           │   ├── Cover 72×96
│           │   ├── Type badge (E-Book / Audiobook / E-Book + Audio)
│           │   ├── Title, Author, Description
│           │   └── [View Details] [✓ Owned] [↓ Download]
│           └── WishlistBookCard (Wishlist tab)
│               ├── Cover + price badge
│               ├── Title, Author, Description
│               └── [Get Free / Buy · $X] [♥ remove]
│
├── Tab "Lists"
│   ├── <AuthGate tab="Lists" />               (nếu !isLoggedIn)
│   ├── Lists overview  (openList === null)
│   │   └── ListRow[]
│   │       ├── Stacked cover thumbnails (max 3, absolute positioned)
│   │       ├── List name + [✏ rename] icon (group-hover)
│   │       │   └── InlineRename (nếu renaming)
│   │       ├── Book count
│   │       └── [→] chevron → setOpenList(list)
│   └── List detail  (openList !== null)
│       ├── [← Back to Lists]
│       ├── InlineRename (editable title) + book count + [🗑 Delete list]
│       ├── EmptyState                         (nếu openList.books.length === 0)
│       └── grid cols-1/2/3
│           └── ListBookCard
│               ├── Cover, Title, Author, Description
│               └── [View Details] [🗑 Remove from list]
│
└── Tab Following / Notebook / History
    └── "Coming soon" placeholder  (BookOpen icon)
```

**Local components trong `saved/page.tsx`:**
- `OwnedBookCard` — owned book display
- `WishlistBookCard` — wishlist item với buy/remove actions
- `ListBookCard` — item trong list detail
- `ListRow` — row trong lists overview
- `InlineRename` — input edit in-place (blur/Enter để save, Escape để cancel)
- `AuthGate` — unauthenticated state per tab
- `EmptyState` — empty list/search state

---

## Book Reader (`/book/[id]`) — `app/(main)/book/[id]/page.tsx`

```
BookPage
│  fetch /api/books?id={id} on mount
│  useEffect: book.audioUrl → audioStore.setBook() (auto-start playback)
│
├── Title strip  (flex-shrink-0, border-b)
│   ├── [← Back] → /
│   ├── Divider
│   ├── book.title
│   ├── — book.author
│   └── · Narrator: book.narrator  (nếu có)
│
└── BookTextViewer  (flex-1, overflow-hidden)
    │  State: fontIndex (0/1/2), bookmarked, pageOffset
    │  CSS var: --reader-font-size (14/16/18px)
    │
    ├── Left page  (flex-1, border-r)
    │   ├── Chapter header  (nếu pages[offset*2].chapter)
    │   ├── Content text
    │   └── Page number (padStart 2)
    │
    ├── Right page  (flex-1)
    │   ├── Book title header (uppercase, tracking)
    │   ├── Content text  (hoặc description nếu không có right page)
    │   └── Page number
    │
    ├── Pagination  (nếu totalSpreads > 1)
    │   └── [← prev] {offset+1}/{totalSpreads} [next →]
    │
    └── Right rail actions  (flex-col, gap-2)
        ├── Bookmark button  (toggle, localStorage persist)
        ├── Translate button  (coming soon)
        └── Text size "T" button  (cycle 14→16→18→14px)
```

---

## BookSidePanel (Global Shell)

Xem chi tiết trong [features/BOOK_PANEL.md](../features/BOOK_PANEL.md).

```
BookSidePanel({ book })
├── Header: cover, title, author, narrator, [X]
├── CTA: [Get Free/Buy/✓Owned] + [Read] + [Play]
├── Action row: [♥ Wishlist] [↓ Download] [+ List]
├── Preview: Audio Sample (30s) + Text preview
├── Metadata table: rating, StarInput, length, format…
├── Description
└── <AddToListModal /> (khi showListModal)
```

---

*← [02 - Layout Architecture](./02-layout-architecture.md) | Tiếp theo: [04 - State Management](./04-state-management.md)*
