# Feature Design: Book Panel

## Purpose & Scope

BookSidePanel là sidebar 280px slide in từ phải, hiển thị chi tiết một cuốn sách khi user click vào bất kỳ book card nào trong app. Nó hoạt động như "quick detail view" — không cần navigate sang trang mới để xem metadata, CTA, preview và rating.

**Scope:**
- Hiển thị metadata đầy đủ: cover, title, author, narrator, rating, length, format, publisher, released, description
- CTA: Get Free / Buy / Read / Play Audiobook
- Wishlist + Add to List actions
- Audio sample player (30s, độc lập với main AudioPlayer)
- Text preview (E-book, trang đầu tiên)
- Interactive star rating (chỉ khi owned + logged in)
- Toggle: click cùng book → đóng; click book khác → đổi

**Ngoài scope:** full-screen detail page (đó là `/book/[id]`), sharing, comments

---

## State Architecture

**Store:** `lib/store/bookPanelStore.ts` (Zustand, không persist)

```typescript
interface BookPanelState {
  selectedBook: Book | null

  setBook(book)          // set trực tiếp
  toggle(book)           // mở nếu khác book, đóng nếu cùng book
  close()                // set null
}
```

**Local state trong `BookSidePanel` component:**
```typescript
const [showListModal, setShowListModal] = useState(false)    // modal state
const [ratingData, setRatingData] = useState<{
  rating: number;
  countStr: string;
  userVote: number | null;
}>()                                                         // rating từ API
const [ratingSubmitting, setRatingSubmitting] = useState(false)

// Audio sample (local, không dùng audioStore)
const audioRef = useRef<HTMLAudioElement | null>(null)
const [samplePlaying, setSamplePlaying] = useState(false)
const [sampleProgress, setSampleProgress] = useState(0)      // 0-1
const [sampleEnded, setSampleEnded] = useState(false)
```

**CSS-based show/hide (trong `app/(main)/layout.tsx`):**
```tsx
<div className={`transition-all duration-300 ease-in-out overflow-hidden
  border-l border-warm-border bg-surface-raised
  ${selectedBook ? "w-[280px]" : "w-0 border-l-0"}`}
>
  {selectedBook && <BookSidePanel book={selectedBook} />}
</div>
```
> Container luôn tồn tại (không unmount) — chỉ width thay đổi → transition mượt. Nhưng `BookSidePanel` bên trong vẫn mount/unmount theo `selectedBook`.

---

## Component Breakdown

```
BookSidePanel({ book })
│
├── ── Book Header ─────────────────────────────────
│   ├── Cover thumbnail (68×88)
│   │   └── Badge: "✓ Owned" (emerald) | "FREE" (emerald) | "$X.XX" (dark)
│   ├── Title (font-display, 14px bold)
│   ├── "By: author" (underline, brand color)
│   ├── "Narrator: name" (nếu có)
│   └── [X] close button → bookPanelStore.close()
│
├── ── CTA Section ──────────────────────────────────
│   ├── Primary button (full width)
│   │   ├── [✓ In Library]  (nếu owned — disabled, emerald)
│   │   ├── [📖 Get Free]   (nếu isFree — brand)
│   │   └── [🛒 Buy · $X.XX] (nếu paid — dark)
│   │
│   ├── [📖 Read] → /book/[id]        (nếu owned + isEbook)
│   ├── [▶ Play Audiobook]             (nếu owned + isAudiobook)
│   │     → pause sample + audioStore.setBook()
│   │
│   └── Action row (3 buttons)
│       ├── [♥ Wishlist]
│       │   ├── disabled nếu owned
│       │   ├── red fill nếu wishlisted
│       │   └── auth guard → /signin
│       ├── [↓ Download] (chưa implement)
│       └── [+ Add to List]
│           └── auth guard → setShowListModal(true)
│
├── ── Preview Section (nếu !owned) ─────────────────
│   ├── Audio Sample (nếu isAudiobook)
│   │   ├── Play/Pause button (brand, 32px circle)
│   │   ├── Progress bar (sampleProgress × 30s)
│   │   ├── Status: "Xs sample" | "Playing…" | "Sample ended"
│   │   └── Time counter "Xs / 30s"
│   │
│   └── Text Preview (nếu isEbook + pages[0])
│       ├── Chapter header (nếu có)
│       ├── Content (line-clamp-4 + gradient fade)
│       └── Footer: "Get free to read full text" | "Buy to unlock full text"
│
├── ── Metadata Table ───────────────────────────────
│   ├── Rating row → StarDisplay (partial fill SVG)
│   ├── Your Rating row (nếu owned + currentUser)
│   │   └── StarInput (hover highlight + click)
│   │       ├── 5 star buttons với hover label (Poor/Fair/Good/Great/Excellent)
│   │       ├── "Saving…" submitting state
│   │       └── "✓ Your rating saved" confirmation
│   ├── Length, Format, Publisher, Released rows
│   └── "Sign in to rate" / "Own this book to rate" hint
│
├── ── Description ──────────────────────────────────
│   └── book.description (font-sans, 12px)
│
└── <AddToListModal /> (portal khi showListModal = true)
```

### Sub-components trong `BookSidePanel.tsx`:

**`StarDisplay`** — Display-only, partial fill bằng SVG clipPath:
```typescript
// Mỗi ngôi sao có 2 layer: nền (warm-border) + fill (brand) với clipPath
// clipPath width = fill × 11px → hỗ trợ partial fill (4.3 stars)
const fill = Math.min(1, Math.max(0, rating - i)); // 0-1 fraction
```

**`StarInput`** — Interactive hover + click:
```typescript
const [hovered, setHovered] = useState(0);
const active = hovered || userVote || 0;
// Hover → preview rating label
// Click → handleVote(stars) → POST /api/ratings
```

---

## Interaction Workflow

### Mở / Đóng Panel
```
User click BentoCard / scroll row card / category card
  → bookPanelStore.toggle(book)
     → nếu selectedBook?.id === book.id → set null (đóng)
     → nếu khác → set book (mở / đổi book)
  → Layout: container width 0 → 280px (CSS transition 300ms)
  → BookSidePanel mount với book mới
  → useEffect [book.id, currentUser]: fetch /api/ratings
```

### Audio Sample
```
User click [▶] trong Audio Sample section
  → toggleSample()
  → nếu !audioRef.current:
       const audio = new Audio(book.audioUrl)  ← tạo mới
       audio.addEventListener("timeupdate", ...)
       audio.addEventListener("ended", ...)
  → nếu sampleEnded:
       audioRef.current.currentTime = 0
       reset sampleEnded=false, sampleProgress=0
       audio.play(); setSamplePlaying(true)
  → nếu samplePlaying:
       audio.pause(); setSamplePlaying(false)
  → else:
       audio.play(); setSamplePlaying(true)

timeupdate listener:
  → t = audio.currentTime
  → nếu t >= 30: pause + sampleEnded=true + sampleProgress=1
  → else: sampleProgress = t / 30
```

### Chuyển sang Full Playback
```
User click [▶ Play / Play Audiobook]
  → handlePlay()
  → audioRef.current?.pause()      ← dừng sample nếu đang chạy
  → setSamplePlaying(false)
  → audioStore.setBook(book, book.audioUrl) ← chuyển sang main player
  → AudioPlayer hiện ở bottom với sách này
```

### Acquire với Auth Guard
```
User click [Get Free / Buy]
  → handleAcquire()
  → !currentUser? → close() + router.push("/signin") → return
  → !owned? → libraryStore.acquire(book)
  → Panel re-render: CTA đổi sang "✓ In Library" + hiện Read/Play buttons
```

### Vote Rating
```
BookSidePanel mount
  → fetch /api/ratings → all ratings
  → entry = all[book.id]
  → userVote = entry.votes[currentUser.email] ?? null
  → setRatingData({ rating, countStr, userVote })

User click sao (nếu owned + logged in)
  → handleVote(stars)
  → ratingSubmitting = true
  → POST /api/ratings { bookId, email, stars }
  → ratingData.userVote = stars (update UI)
  → ratingSubmitting = false
  → "✓ Your rating saved" hiện
```

---

## Edge Cases

| Tình huống | Xử lý |
|---|---|
| Click cùng book 2 lần | `toggle()` → selectedBook = null → panel đóng |
| Đổi book khi sample đang phát | `useEffect` cleanup: `audioRef.current?.pause()` khi `book.id` thay đổi |
| `book.pages` undefined | `previewText = book.pages?.[0]?.content ?? ""` → preview section không render |
| `book.audioUrl` undefined | Audio sample section không render |
| Rating fetch fail | catch → `ratingData` giữ nguyên `book.rating` + `book.ratingCount` (fallback) |
| Submit rating khi đang submit | `ratingSubmitting` check → return early |
| Panel mở trên màn hình hẹp | Width 280px fixed — không responsive (portfolio tradeoff) |
| User logout khi panel đang mở | `currentUser = null` → StarInput ẩn, auth guard trên actions |

---

## Key Implementation Notes

**1. Sample player là `new Audio()` thuần — không phải `<audio>` element:**
```typescript
// Không có JSX cho sample audio, tạo dynamic trong JS
const audio = new Audio(book.audioUrl);
audioRef.current = audio;
// Cleanup khi unmount / book thay đổi:
useEffect(() => {
  return () => { audioRef.current?.pause(); };
}, [book.id]);
```

**2. StarDisplay dùng SVG clipPath cho partial fill:**
```typescript
// clipId phải unique per star per rating value
const clipId = `clip-${rating}-${i}`.replace(".", "_");
// replace "." vì CSS ID không cho phép dấu chấm
```

**3. `StarInput` labels:**
```typescript
const labels = ["", "Poor", "Fair", "Good", "Great", "Excellent"];
// Index 0 = "", index 1 = "Poor" → labels[1 star]
```

**4. `SAMPLE_LIMIT = 30` — const trong file:**
Sample dừng cứng sau 30 giây — không phụ thuộc vào book length. Khi `t >= SAMPLE_LIMIT`, audio bị pause thủ công (không dùng `audio.duration`).

**5. Cover image variants:**
- `book.cover` (OpenLibrary) → thumbnail trong header
- `book.coverHQ` (Google Books) → KHÔNG dùng trong panel (chỉ dùng ở HeroBentoCard)
- Panel dùng `cover` vì kích thước nhỏ (68px) — không cần HQ
