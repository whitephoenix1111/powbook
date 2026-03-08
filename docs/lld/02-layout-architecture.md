# LLD 02 — Layout Architecture

---

## Route Groups

Next.js App Router dùng route groups (tên trong ngoặc) để tách layout mà không ảnh hưởng URL:

| Group | URL prefix | Layout | Mục đích |
|---|---|---|---|
| `(auth)` | `/login`, `/signin` | Chỉ root layout | Không có shell — trang đơn giản |
| `(main)` | `/`, `/category`, `/saved`, `/book/[id]` | Root + Main shell | Có Sidebar, Navbar, AudioPlayer |

---

## Shell Layout — `app/(main)/layout.tsx`

**Client Component** (`"use client"`) vì cần `useEffect` để hydrate auth.

### Render Tree

```
MainLayout
│
│  useEffect (once on mount):
│    authStore.hydrate()           → GET /api/auth/me → set currentUser + library
│    localStorage.removeItem(      → cleanup stale keys từ version cũ
│      "lv_auth", "lv_library")
│
└── <div className="flex h-screen overflow-hidden bg-surface">
    │
    ├── <Sidebar />                   w-[72px], flex-shrink-0
    │                                 border-r, min-h-screen
    │
    └── <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        │
        ├── <div className="flex flex-1 min-w-0 overflow-hidden">
        │   │
        │   ├── <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        │   │   │
        │   │   ├── <Navbar />         h-[64px], flex-shrink-0
        │   │   │
        │   │   └── <div className="flex-1 overflow-y-auto">   ← scrollable
        │   │       ├── <div className="flex-1">{children}</div>
        │   │       └── <Footer />
        │   │
        │   └── <div>                  ← BookSidePanel container
        │       className:
        │         "flex-shrink-0 transition-all duration-300 ease-in-out overflow-hidden
        │          border-l border-warm-border bg-surface-raised
        │          w-[280px]"  (nếu selectedBook)
        │          "w-0 border-l-0"   (nếu null)
        │       │
        │       {selectedBook && <BookSidePanel book={selectedBook} />}
        │
        └── <AudioPlayer />           flex-shrink-0, render null nếu !currentBook
                                      Nằm dưới cùng — không bị đẩy lên bởi content

└── <Toaster />                       fixed bottom center, z-[9999]
```

### Điểm quan trọng

**AudioPlayer không bị ngắt khi navigate:**
AudioPlayer nằm trong layout, không phải trong page. Zustand state (`currentBook`, `isPlaying`) không bị reset khi `{children}` re-render do route change.

**BookSidePanel: CSS toggle, không unmount container:**
```tsx
// Container luôn tồn tại, chỉ width thay đổi → transition mượt
<div className={selectedBook ? "w-[280px]" : "w-0 border-l-0"}>
  {selectedBook && <BookSidePanel book={selectedBook} />}
</div>
// BookSidePanel bên trong vẫn mount/unmount theo selectedBook
// nhưng transition width của container tạo hiệu ứng slide
```

**Overflow strategy:**
- `h-screen overflow-hidden` trên root → không có scroll ở body
- `overflow-y-auto` chỉ ở content area → scroll xảy ra bên trong
- AudioPlayer luôn visible ở bottom vì nằm ngoài scrollable area

---

## Root Layout — `app/layout.tsx`

**Server Component** — không có `"use client"`.

```typescript
// Font loading via next/font/google (self-hosted, không external request)
const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  weight: ["400","500","600","700","800"],
  style: ["normal","italic"],
});

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["300","400","500","600","700"],
});

// CSS variables được inject qua className trên <body>
// → dùng trong Tailwind: font-display (fraunces), font-sans (jakarta)
```

---

## Rendering Strategy Tổng Hợp

| Route | Type | Lý do |
|---|---|---|
| `app/layout.tsx` | Server Component | Chỉ font + metadata, không cần hooks |
| `app/(main)/layout.tsx` | **Client** | `useEffect` cho hydrate, đọc Zustand store |
| `app/(main)/page.tsx` | **Client** | `useState`, `useEffect` fetch, `useRef` scroll |
| `app/(main)/category/page.tsx` | Server | Chỉ là Suspense wrapper, không có logic |
| `app/(main)/category/CategoryContent.tsx` | **Client** | `useSearchParams()` chỉ dùng được ở client |
| `app/(main)/saved/page.tsx` | **Client** | Đọc nhiều Zustand stores |
| `app/(main)/book/[id]/page.tsx` | **Client** | `useParams()`, `useState` fetch |
| `app/(auth)/login/page.tsx` | **Client** | Form state, `authStore` |
| `app/(auth)/signin/page.tsx` | **Client** | Form state, `authStore` |

**Kết luận:** Toàn bộ là **CSR** — data fetch bằng `fetch()` từ browser. Không dùng `async` Server Components có data fetching, không dùng `generateStaticParams`.

---

*← [01 - Folder Structure](./01-folder-structure.md) | Tiếp theo: [03 - Component Hierarchy](./03-component-hierarchy.md)*
