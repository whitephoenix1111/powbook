# LLD 07 — Design Patterns & Conventions

---

## Pattern 1: Optimistic Update + Rollback

Dùng trong tất cả `libraryStore` mutations.

```typescript
acquire: async (book) => {
  if (get().isOwned(book.id)) return;           // guard

  // 1. Snapshot state hiện tại để rollback
  // (với acquire, không cần snapshot vì chỉ add)

  // 2. Optimistic update — UI phản hồi ngay
  set((s) => ({
    ownedBooks: [...s.ownedBooks, book],
    wishlist:   s.wishlist.filter((b) => b.id !== book.id),
  }));

  try {
    // 3. API call
    await apiPost("acquire", { bookId: book.id });
  } catch {
    // 4. Rollback nếu fail
    set((s) => ({
      ownedBooks: s.ownedBooks.filter((b) => b.id !== book.id),
    }));
  }
},
```

---

## Pattern 2: Auth Guard

Dùng trước mọi action cần đăng nhập. Nhất quán trong toàn app:

```typescript
// Trong BookSidePanel
function handleAcquire() {
  if (!currentUser) { close(); router.push("/signin"); return; }
  acquire(book);
}

// Trong CategoryContent BookCard
onAcquire={(e) => {
  e.stopPropagation();
  if (!currentUser) { router.push("/signin"); return; }
  acquire(book);
}}
```

---

## Pattern 3: AuthGate Component

Dùng trong `/saved` để block từng tab theo context-specific message:

```typescript
const AUTH_GATE_COPY = {
  Titles:   { title: "Sign in to see your library",  icon: <BookOpen />,  desc: "..." },
  Wishlist: { title: "Sign in to use Wishlist",       icon: <Heart />,     desc: "..." },
  Lists:    { title: "Sign in to use Lists",          icon: <LogIn />,     desc: "..." },
};

function AuthGate({ tab }) {
  const copy = AUTH_GATE_COPY[tab];
  return (
    <div className="flex flex-col items-center py-24 gap-4">
      <div className="w-14 h-14 rounded-2xl bg-brand/10">
        {copy.icon}
      </div>
      <p>{copy.title}</p>
      <p>{copy.desc}</p>
      <Link href="/signin">Sign In</Link>
      <Link href="/login">Create Account</Link>
    </div>
  );
}
```

---

## Pattern 4: BentoGrid Layout

```
BentoGrid: grid grid-cols-4 gap-3 auto-rows-[200px]

Card span rules:
  col-span-2 row-span-2 → HeroBentoCard  (400px tall)
  col-span-2            → AudioBentoCard, QuoteBentoCard
  (default 1×1)         → BookBentoCard, StatCard
```

Grid fill example (BentoGrid #1):
```
┌──────────────┬──────┬──────┐
│              │ Stat │ Stat │  row 1
│  HeroCard    ├──────┼──────┤
│  (2×2)       │ Book │ Book │  row 2
└──────────────┴──────┴──────┘
```

---

## Pattern 5: BookSidePanel CSS Toggle

Container không bị unmount — chỉ width thay đổi:

```tsx
// app/(main)/layout.tsx
<div className={`
  flex-shrink-0 transition-all duration-300 ease-in-out overflow-hidden
  border-l border-warm-border bg-surface-raised
  ${selectedBook ? "w-[280px]" : "w-0 border-l-0"}
`}>
  {selectedBook && <BookSidePanel book={selectedBook} />}
</div>
```

`overflow-hidden` trên container + `w-0` → nội dung bị clip hoàn toàn. Transition `300ms ease-in-out` tạo hiệu ứng slide. `BookSidePanel` vẫn mount/unmount theo `selectedBook`.

---

## Pattern 6: InlineRename

Dùng trong `saved/page.tsx` cho list name. Edit tại chỗ, không cần modal:

```typescript
function InlineRename({ name, onSave, onCancel, autoFocus }) {
  const [value, setValue] = useState(name);

  function commit() {
    const trimmed = value.trim();
    if (trimmed && trimmed !== name) onSave(trimmed);
    else onCancel?.();
  }

  return (
    <input
      value={value}
      onChange={(e) => setValue(e.target.value)}
      onBlur={commit}
      onKeyDown={(e) => {
        if (e.key === "Enter") { e.preventDefault(); commit(); }
        if (e.key === "Escape") { e.preventDefault(); onCancel?.(); }
      }}
      onClick={(e) => e.stopPropagation()} // prevent parent onClick
      className="bg-transparent border-b-2 border-brand outline-none"
    />
  );
}
```

---

## Design Token System

CSS variables định nghĩa trong `globals.css`, dùng qua Tailwind classes:

| CSS Variable | Tailwind Class | Màu / Dùng cho |
|---|---|---|
| `--color-brand` | `text-brand`, `bg-brand`, `border-brand` | `#E8580A` — CTA buttons, active states |
| `--color-brand-hover` | `bg-brand-hover` | Hover của brand |
| `--color-brand-muted` | `bg-brand-muted` | Light brand background (10% opacity) |
| `--color-ink` | `text-ink` | Primary text |
| `--color-ink-secondary` | `text-ink-secondary` | Muted/secondary text |
| `--color-surface` | `bg-surface` | App background |
| `--color-surface-card` | `bg-surface-card` | Card background |
| `--color-surface-raised` | `bg-surface-raised` | Sidebar, panel |
| `--color-surface-sunken` | `bg-surface-sunken` | Input, inset |
| `--color-warm-border` | `border-warm-border` | Default border |

**Typography tokens:**

| Class | Font | Dùng cho |
|---|---|---|
| `font-display` | Fraunces (serif) | Tiêu đề, card titles, số liệu lớn |
| `font-sans` | Plus Jakarta Sans | Body text, labels, metadata |
| `font-mono` | System monospace | Thời gian trong AudioPlayer |

**Khai báo trong `app/layout.tsx`:**
```typescript
// CSS variables được inject qua className trên <body>
<body className={`${fraunces.variable} ${jakarta.variable} antialiased`}>
// → --font-fraunces và --font-jakarta available trên toàn cây DOM
```

---

## Convention: Feedback với Toast

Dùng `toast` helper từ `toastStore` — không cần hook, gọi được từ bất kỳ đâu:

```typescript
import { toast } from "@/lib/store/toastStore";

toast.success("Added to Favorites");
toast.error("Failed to create list");
toast.info(`Removed from "${list.name}"`);
```

Auto-dismiss sau 3 giây. Manual dismiss bằng [×] button trên toast.

---

## Convention: Scroll Row

Horizontal scroll row trong Dashboard (không dùng BentoGrid):

```tsx
<div className="overflow-hidden">
  <div
    ref={scrollRef}
    className="flex gap-3 overflow-x-scroll pb-1"
    style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
  >
    {items.map(...)}
  </div>
</div>

// Scroll buttons
scroll = (dir) =>
  scrollRef.current?.scrollBy({ left: dir === "right" ? 480 : -480, behavior: "smooth" });
```

`scrollbarWidth: none` ẩn scrollbar trên Firefox; `msOverflowStyle: none` cho IE/Edge cũ.

---

*← [06 - Data Schema](./06-data-schema.md) | ← [LLD Index](../LLD.md)*
