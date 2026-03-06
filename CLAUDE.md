# Digital Library Hub - Bento UI (E-book & Audiobook)

## 1. Tổng quan dự án

Nền tảng quản lý nội dung số (E-book và Audiobook) với giao diện Bento Grid phong cách Retro Editorial. Fresher Portfolio Project.

---

## 2. Tech Stack

| Layer | Công nghệ |
|---|---|
| Frontend | Next.js 15 (App Router), TypeScript, Tailwind CSS, Shadcn/ui |
| State Management | Zustand — Global Audio Player |
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
└── store/audioStore.ts
```

---

## 5. Kiến trúc Category & Book Type

### Content type — 2 loại duy nhất
- **E-Books** — detect qua `book.pages`
- **Audiobooks** — detect qua `book.audioUrl`

> Podcasts & Comics đã bỏ hoàn toàn — không có data, không xuất hiện ở bất kỳ đâu.

### Sub-genre — 4 loại, multi-value
- `history` / `fiction` / `science-technology` / `dark-thriller`
- Một quyển sách có thể thuộc nhiều genre cùng lúc

### Book type chính thức
```ts
type Genre = 'history' | 'fiction' | 'science-technology' | 'dark-thriller'

type Book = {
  id: string
  title: string
  author: string
  cover: string
  genres: Genre[]        // multi-value, filter bằng .includes()

  pages?: BookPage[]     // có → là ebook, hiện nút "Read"
  audioUrl?: string      // có → là audiobook, hiện nút "Play"
                         // có cả 2 → xuất hiện ở cả 2 tab, hiện cả 2 nút
}
```

> Không có field `type` cứng. Định dạng detect tự động qua optional fields. Không duplicate metadata.

### Filter logic theo trang

| Trang | Filter chiều 1 | Filter chiều 2 |
|---|---|---|
| Dashboard | Tabs: All / E-Books / Audiobooks | — |
| Category page | Tabs: E-Books / Audiobooks | Tabs: All / History / Fiction / Sci & Tech / Dark & Thriller |
| Saved | Tabs: Titles / Following / Lists / Notebook / History | — (chiều trạng thái lưu, khác hoàn toàn) |

---

## 6. Routes & Tính năng

| Route | Trang | Tính năng chính |
|---|---|---|
| `/` | Dashboard | Bento Grid, filter tabs (All / E-Books / Audiobooks), BookSidePanel slide-in |
| `/category` | Browse by Category | Filter 2 chiều: content type + genre |
| `/saved` | Saved Books | Grid 3 cột, tabs (Titles active), search client-side, Read Preview |
| `/book/[id]` | Book Reader | BookTextViewer 2 cột, text size (CSS var), bookmark (localStorage) |
| `/login` | Create an account | — |
| `/signin` | Sign in | — |

**Sidebar navigation:** Home / Category / Saved / Settings / Support

---

## 7. Quyết định kỹ thuật

| Khâu | Quyết định | Ghi chú |
|---|---|---|
| Nội dung sách | Mock text — `BookPage[]` | — |
| Audio | Zustand + MP3 LibriVox | play/pause/seek/speed/skip ±15s |
| Ảnh bìa | OpenLibrary CDN | — |
| Bookmark | `localStorage` | key: `bookmark_${id}` |
| Text size | CSS variable thật | `--reader-font-size` |
| Translate | UI only | — |
| Saved list | Mock cứng | Không sync với Dashboard bookmark |
| Tabs ở /saved | Chỉ "Titles" active | Còn lại UI only |

---

## 8. Data Flow

```
[ USER INTERFACE ]
       |
       |-- Lọc/Search -------> [ MOCK DATA — client-side ]
       |-- Chọn sách ---------> [ useState: selectedBook ] --> [ SIDE PANEL ]
       |-- READ --------------> [ BookPage[] mock text ] ----> [ BookTextViewer ]
       |-- PLAY --------------> [ MP3 URL (LibriVox) ] ------> [ Zustand AudioPlayer ]
       |-- Bookmark ----------> [ localStorage ]
```

---

## 9. Workflow & Logic quan trọng

### Audio Player
- Zustand store là nguồn sự thật duy nhất cho trạng thái audio
- AudioPlayer render trong `(main)/layout.tsx` → persist xuyên navigate, không bị unmount
- Khi user chọn sách mới → gọi `audioStore.setTrack()` → player tự cập nhật

### Navigation flow
- Dashboard → click sách → `BookSidePanel` slide-in (không navigate)
- BookSidePanel → click "Read" → navigate `/book/[id]`
- BookSidePanel → click "Play" → set Zustand store, AudioPlayer phản ứng
- Category page → click sách → navigate thẳng `/book/[id]` (không qua SidePanel)

### Bookmark
- Lưu `localStorage` với key `bookmark_${id}`, giá trị là page index
- Đọc lại khi mount `BookTextViewer`, scroll đến trang đã lưu
- Không có sync server — reset nếu clear storage

### Filter tabs
- State local tại từng page, không lên Zustand
- E-Books: `books.filter(b => b.pages)`
- Audiobooks: `books.filter(b => b.audioUrl)`
- Genre: `books.filter(b => b.genres.includes(selectedGenre))`
- Có thể chain 2 filter: type trước, genre sau

---

## 10. Trạng thái & Việc cần làm tiếp

### Đã hoàn chỉnh
- Toàn bộ 6 routes, layout shell, AudioPlayer global, BookTextViewer, Bookmark

### Cần refactor theo kiến trúc mới
- `lib/mockData.ts` — cập nhật Book type: thêm `genres[]`, đổi sang optional `pages?` / `audioUrl?`, bỏ field `type` cứng
- `app/(main)/page.tsx` — filter tabs bỏ Podcasts & Comics, chỉ giữ All / E-Books / Audiobooks
- `app/(main)/category/page.tsx` — refactor filter 2 chiều (content type + genre)
- `components/book/BookSidePanel.tsx` — detect "Read" / "Play" / cả 2 dựa vào optional fields
