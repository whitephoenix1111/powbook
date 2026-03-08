# LLD 04 — State Management

---

## Stores Map

| Store | File | Quản lý | Persist |
|---|---|---|---|
| `audioStore` | `lib/store/audioStore.ts` | Playback state + DOM ref | ✗ |
| `bookPanelStore` | `lib/store/bookPanelStore.ts` | selectedBook (panel toggle) | ✗ |
| `authStore` | `lib/store/authStore.ts` | currentUser + auth actions | ✗ |
| `libraryStore` | `lib/store/libraryStore.ts` | ownedBooks, wishlist, lists | ✗ |
| `toastStore` | `lib/store/toastStore.ts` | Toast notification queue | ✗ |

**Tại sao không persist?** Session giữ bởi httpOnly cookie; state là in-memory cache. Persist vào localStorage tạo risk stale data sau khi logout hoặc đổi user.

---

## audioStore

```typescript
interface AudioState {
  currentBook:  Book | null
  audioUrl:     string | null
  isPlaying:    boolean
  currentTime:  number          // seconds, sync từ DOM onTimeUpdate
  duration:     number          // seconds, từ onLoadedMetadata
  playbackRate: number          // 1 | 1.25 | 1.5 | 2

  // DOM element ref — lưu trong store để action từ bất kỳ đâu có thể gọi
  audioRef:     HTMLAudioElement | null

  setBook(book, audioUrl)      // load mới: reset time=0, isPlaying=true
  dismiss()                    // pause + clear tất cả
  play() / pause() / togglePlay()
  seek(time)                   // audioRef.currentTime = time
  skipForward(sec=10)          // clamp về [0, duration]
  skipBackward(sec=10)         // clamp về [0, duration]
  setPlaybackRate(rate)        // set cả store lẫn element
  setAudioRef(el)              // gọi bởi callback ref trong AudioPlayer
  setCurrentTime(t)            // gọi bởi onTimeUpdate
  setDuration(d)               // gọi bởi onLoadedMetadata
}
```

### DOM Ref Pattern — Tại sao lưu `audioRef` trong store?

Nhiều nơi trong app có thể trigger audio:
- `BookSidePanel.handlePlay()` → `setBook()`
- `book/[id]/page.tsx` → `setBook()` (auto-play khi mở reader)
- `AudioPlayer` controls → `seek()`, `skip*()`

Nếu `audioRef` chỉ là `useRef` trong `AudioPlayer`, các nơi khác không truy cập được. Lưu vào store làm bridge.

### Callback Ref — Tại sao không dùng `useRef`?

```typescript
// ✅ ĐÚNG — callback ref được gọi ngay khi DOM mount
const audioCallbackRef = useCallback((el: HTMLAudioElement | null) => {
  setAudioRef(el);
}, [setAudioRef]);
<audio ref={audioCallbackRef} />

// ❌ SAI — useRef + useEffect có timing window
const ref = useRef<HTMLAudioElement>(null);
useEffect(() => { store.setAudioRef(ref.current); }, []);
// → có thể miss nếu useEffect chạy sau khi action đầu tiên cần ref
```

### `playPromiseRef` — Tránh AbortError

Web Audio API không cho phép `pause()` trước khi `play()` resolve:

```typescript
const playPromiseRef = useRef<Promise<void> | null>(null);

// Khi play:
playPromiseRef.current = el.play().catch(() => pause());

// Khi pause:
if (playPromiseRef.current) {
  playPromiseRef.current.then(() => el.pause()).catch(() => {});
} else {
  el.pause();
}
```

---

## bookPanelStore

```typescript
interface BookPanelState {
  selectedBook: Book | null
  setBook(book)          // set trực tiếp (không toggle)
  toggle(book)           // mở nếu khác, đóng nếu cùng id
  close()
}
```

Toggle logic:
```typescript
toggle: (book) => {
  if (get().selectedBook?.id === book.id) set({ selectedBook: null });
  else set({ selectedBook: book });
}
```

Ai gọi:
- Tất cả BentoCard `onClick` → `toggle(book)`
- MiniBookCard trong scroll row → `toggle(book)`
- BookCard trong CategoryContent → `toggle(book)`
- `BookSidePanel` [X] button → `close()`
- Auth guard actions → `close()` trước khi redirect

---

## authStore

```typescript
interface AuthState {
  currentUser: { id: string; email: string } | null
  register(email, password) → Promise<{ ok, error? }>
  login(email, password)    → Promise<{ ok, error? }>
  logout()                  → Promise<void>
  hydrate()                 → Promise<void>   // gọi khi app mount
  isLoggedIn()              → boolean         // getter
}
```

### Dependency với libraryStore

```
authStore.login/register success
  → set currentUser
  → libraryStore.setUser(userId)    ← fetch + populate library

authStore.logout
  → set currentUser = null
  → libraryStore.clearUser()        ← reset state

authStore.hydrate (layout mount)
  → GET /api/auth/me
  → nếu user: set currentUser + libraryStore.setUser(userId)
```

**Hydrate được gọi trong `useEffect` của `(main)/layout.tsx`** — chạy một lần khi shell mount. Các pages không cần gọi lại.

---

## libraryStore

```typescript
interface LibraryState {
  currentEmail: string | null    // track để biết đang load cho user nào
  ownedBooks:   Book[]
  wishlist:     Book[]
  lists:        BookList[]       // { id, name, books: Book[], createdAt }

  setUser(userId)    → fetch GET /api/library → populate state
  clearUser()        → reset all to []

  isOwned(id)        → boolean
  isWishlisted(id)   → boolean
  isInList(listId, bookId) → boolean
  getListsForBook(bookId)  → BookList[]

  // Tất cả mutations: optimistic update + rollback khi API fail
  acquire(book)
  toggleWishlist(book)
  removeWishlist(id)
  createList(name)           → Promise<string>  // trả về listId
  renameList(id, newName)
  deleteList(id)
  addToList(listId, book)
  removeFromList(listId, bookId)
}
```

### Optimistic Update Pattern

Mọi mutations đều theo cùng structure:

```typescript
mutate: async (args) => {
  const prev = get().relevantState;       // snapshot
  set(/* apply change optimistically */); // 1. UI update ngay
  try {
    await apiPost(action, payload);        // 2. API call
  } catch {
    set({ relevantState: prev });          // 3. Rollback nếu fail
  }
},
```

### API Helper

```typescript
async function apiPost(action: string, payload: Record<string, unknown>) {
  const res = await fetch("/api/library", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action, payload }),
  });
  if (!res.ok) throw new Error(`Library API error: ${action}`);
  return res.json();
}
```

---

## toastStore

```typescript
interface ToastState {
  toasts: Toast[]   // { id, message, type: "success"|"error"|"info" }
  show(message, type?)    // add + auto-dismiss sau 3s
  dismiss(id)
}

// Shorthand helpers — gọi từ bất kỳ đâu không cần hook
export const toast = {
  success: (msg) => useToastStore.getState().show(msg, "success"),
  error:   (msg) => useToastStore.getState().show(msg, "error"),
  info:    (msg) => useToastStore.getState().show(msg, "info"),
};
```

`Toaster` component subscribe store, render `ToastItem[]` với mount animation (requestAnimationFrame delay để trigger CSS transition).

---

## Store Subscriptions Map

Bảng tóm tắt ai subscribe store nào:

| Component | audioStore | bookPanelStore | authStore | libraryStore | toastStore |
|---|---|---|---|---|---|
| `(main)/layout.tsx` | — | `selectedBook` | `hydrate` | — | — |
| `AudioPlayer` | full | — | — | — | — |
| `BookSidePanel` | `setBook` | `close` | `currentUser` | `isOwned`, `acquire`… | — |
| `Navbar` | — | — | `currentUser`, `logout` | — | — |
| `Sidebar` | — | — | `logout` | — | — |
| `BentoCard.*` | — | — | — | `isOwned` | — |
| `CategoryContent` | — | `toggle`, `selectedBook` | `currentUser` | `isOwned`, `acquire`… | — |
| `SavedPage` | — | `toggle`, `selectedBook` | `currentUser` | full | — |
| `AddToListModal` | — | — | — | `lists`, `addToList`… | `toast` helper |
| `book/[id]/page` | `setBook` | — | — | — | — |

---

*← [03 - Component Hierarchy](./03-component-hierarchy.md) | Tiếp theo: [05 - API Contract](./05-api-contract.md)*
