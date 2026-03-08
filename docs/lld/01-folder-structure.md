# LLD 01 — Folder Structure & Trách Nhiệm

---

```
D:\powbook\
│
├── app/                          # Next.js App Router — routing & pages
│   ├── layout.tsx                # Root layout: khai báo font vars, <html>, import globals.css
│   ├── globals.css               # CSS variables (design tokens) + Tailwind base
│   ├── favicon.ico
│   │
│   ├── (auth)/                   # Route group — KHÔNG có (main) shell
│   │   ├── login/page.tsx        # Create Account form → POST /api/auth/register
│   │   └── signin/page.tsx       # Sign In form → POST /api/auth/login
│   │
│   ├── (main)/                   # Route group — có shell: Sidebar + Navbar + AudioPlayer
│   │   ├── layout.tsx            # Shell layout (Client Component, hydrate auth on mount)
│   │   ├── page.tsx              # Dashboard: BentoGrid, scroll row, filter tabs
│   │   ├── category/
│   │   │   ├── page.tsx          # Suspense wrapper (Server Component)
│   │   │   └── CategoryContent.tsx  # Filter UI + book grid (Client, cần useSearchParams)
│   │   ├── saved/page.tsx        # My Library: Titles / Wishlist / Lists tabs
│   │   ├── book/[id]/page.tsx    # Book reader: 2-column spread view
│   │   └── reader/               # Thư mục tồn tại, chưa có page
│   │
│   └── api/                      # Next.js API Routes — chạy trên Node.js server
│       ├── auth/
│       │   ├── register/route.ts # POST → hash password → ghi users.json → set cookie
│       │   ├── login/route.ts    # POST → verify password → set cookie
│       │   ├── logout/route.ts   # POST → clear cookie
│       │   └── me/route.ts       # GET → verify cookie → trả về { user }
│       ├── books/route.ts        # GET → ?id= | ?ids= | (all catalog)
│       ├── library/route.ts      # GET → lấy library; POST → mutations (8 actions)
│       └── ratings/route.ts      # GET → tất cả ratings; POST → upsert vote
│
├── components/                   # Reusable UI components
│   ├── bento/
│   │   ├── BentoGrid.tsx         # Container: grid 4 cột, auto-rows 200px
│   │   └── BentoCard.tsx         # 6 variants: Hero, Book, Audio, Stat, Quote, Category
│   ├── book/
│   │   ├── BookSidePanel.tsx     # Panel 280px: metadata, CTA, ratings, preview, sample
│   │   └── AddToListModal.tsx    # Modal overlay: chọn/tạo list để thêm sách
│   ├── layout/
│   │   ├── Sidebar.tsx           # Nav 72px: icon + label, active state, logout
│   │   ├── Navbar.tsx            # Top bar 64px: search, auth user dropdown, bell
│   │   └── Footer.tsx            # Brand, link columns (Explore/Account/Legal), socials
│   ├── player/
│   │   └── AudioPlayer.tsx       # Fixed bottom strip: cover, controls, progress bar
│   ├── viewer/
│   │   └── BookTextViewer.tsx    # 2-column book spread, spread pagination, bookmark
│   └── ui/                       # Shadcn/ui primitives + custom
│       ├── Toaster.tsx           # Fixed overlay toast — mount animation, auto-dismiss
│       ├── avatar.tsx, badge.tsx, button.tsx, card.tsx
│       ├── dropdown-menu.tsx, input.tsx, scroll-area.tsx
│       └── separator.tsx, sheet.tsx
│
├── lib/                          # Shared utilities & stores
│   ├── auth.ts                   # SERVER-ONLY: hashPassword, verifyPassword, signJWT, verifyJWT
│   ├── mockData.ts               # Type exports ONLY: Book, BookPage, Genre (không có data)
│   ├── utils.ts                  # cn() = clsx + tailwind-merge
│   └── store/                    # Zustand stores (5 stores, không persist)
│       ├── audioStore.ts         # Audio playback state + HTMLAudioElement ref
│       ├── bookPanelStore.ts     # selectedBook → điều khiển panel show/hide
│       ├── authStore.ts          # currentUser, login/logout/register/hydrate
│       ├── libraryStore.ts       # ownedBooks, wishlist, lists + tất cả API calls
│       └── toastStore.ts         # Toast queue, auto-dismiss 3s, shorthand helpers
│
├── data/                         # JSON files — data layer (chỉ đọc/ghi ở server)
│   ├── books.json                # Book catalog: 10 cuốn, id "1"–"10"
│   ├── users.json                # User accounts: [{ id(UUID), email, passwordHash, createdAt }]
│   ├── library.json              # User libraries: [{ userId, ownedBookIds[], wishlistIds[], lists[] }]
│   └── ratings.json              # { [bookId]: { baseRating, baseCount, votes: {email: stars} } }
│
├── public/                       # Static assets (images, icons)
├── next.config.ts                # Image domain whitelist (openlibrary, books.google, dicebear, pravatar)
├── tsconfig.json                 # Path alias: @/ → root
└── package.json
```

---

## Quy tắc import quan trọng

- `lib/auth.ts` — chỉ import trong `app/api/**` (server-side). Import ở client component sẽ expose crypto logic.
- `data/*.json` — chỉ đọc/ghi trong API routes qua `fs.readFileSync` / `fs.writeFileSync`. Client không truy cập trực tiếp.
- `lib/mockData.ts` — chỉ export types (`Book`, `BookPage`, `Genre`). **Không có data constants**. Mọi data fetch từ `/api/books`.
- `lib/store/*` — chỉ dùng trong Client Components (`"use client"`).

---

*← [LLD Index](../LLD.md) | Tiếp theo: [02 - Layout Architecture](./02-layout-architecture.md)*
