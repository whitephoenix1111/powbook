# Feature Design: Library

## Purpose & Scope

Library feature quản lý toàn bộ quan hệ giữa user và sách: sách đã mua/lấy (owned), sách muốn đọc (wishlist), và danh sách tùy chỉnh (lists). Dữ liệu được sync với server (`data/library.json`) và cache tại client (`libraryStore`) với **optimistic update + rollback**.

**Scope:**
- Owned: acquire (free/mua), hiển thị badge "✓ Owned"
- Wishlist: toggle thêm/xóa, không được add sách đã owned
- Lists: CRUD (create, rename, delete), add/remove book vào list
- `/saved` page: xem Titles, Wishlist, Lists với search/filter
- Ratings: rate sách (chỉ khi owned), weighted average

**Ngoài scope:** payment processing thực sự, sync đa thiết bị, sharing lists

---

## State Architecture

**Store:** `lib/store/libraryStore.ts` (Zustand, không persist)

```typescript
interface LibraryState {
  currentEmail: string | null    // dùng để track user hiện tại
  ownedBooks:   Book[]
  wishlist:     Book[]
  lists:        BookList[]       // { id, name, books: Book[], createdAt }

  // Auth integration
  setUser(email)    → fetch GET /api/library → populate state
  clearUser()       → reset tất cả về []

  // Owned
  isOwned(id)       → boolean
  acquire(book)     → optimistic + POST /api/library {action:"acquire"}

  // Wishlist
  isWishlisted(id)  → boolean
  toggleWishlist(book)  → optimistic + POST
  removeWishlist(id)    → optimistic + POST

  // Lists
  createList(name)          → optimistic + POST → return listId
  renameList(id, newName)   → optimistic + POST
  deleteList(id)            → optimistic + POST
  addToList(listId, book)   → optimistic + POST
  removeFromList(listId, bookId) → optimistic + POST
  isInList(listId, bookId)  → boolean
  getListsForBook(bookId)   → BookList[]
}
```

**Optimistic update pattern (mọi mutations đều theo cùng pattern):**
```typescript
mutate: async (args) => {
  const prev = get().relevantState;
  set(/* apply change */);          // 1. Optimistic
  try {
    await apiPost(action, payload); // 2. API
  } catch {
    set({ relevantState: prev });   // 3. Rollback
  }
},
```

**Server schema (library.json):**
```json
{ "userId", "ownedBookIds": [], "wishlistIds": [], "lists": [{ "id", "name", "bookIds": [], "createdAt" }] }
```
Server lưu IDs, khi GET sẽ resolve thành Book objects đầy đủ.

---

## Component Breakdown

### `/saved` Page — `app/(main)/saved/page.tsx`

```
SavedPage
├── Tab bar [Titles | Wishlist | Following | Lists | Notebook | History]
│
├── "Titles" tab
│   ├── AuthGate (nếu !isLoggedIn)
│   └── Search input + grid OwnedBookCard[]
│       └── OwnedBookCard
│           ├── Cover (72×96)
│           ├── Type badge (E-Book / Audiobook / E-Book + Audio)
│           ├── Title, Author, Description (line-clamp-2)
│           └── [View Details] [✓ Owned] [Download icon]
│
├── "Wishlist" tab
│   ├── AuthGate (nếu !isLoggedIn)
│   └── Search input + grid WishlistBookCard[]
│       └── WishlistBookCard
│           ├── Cover + price badge
│           ├── Title, Author, Description
│           └── [Get Free / Buy · $X] [♥ remove] 
│
└── "Lists" tab
    ├── AuthGate (nếu !isLoggedIn)
    ├── Lists overview: ListRow[]
    │   └── ListRow
    │       ├── Stacked cover thumbnails (max 3)
    │       ├── List name (click → open list) + [✏ rename] (hover)
    │       ├── Book count
    │       └── [→ chevron]
    └── List detail (openList != null)
        ├── [← Back] button
        ├── InlineRename input + book count + [Delete list]
        └── grid ListBookCard[]
            └── ListBookCard
                ├── Cover, Title, Author, Description
                └── [View Details] [🗑 Remove from list]
```

### `BookSidePanel` — Library Integration

```
BookSidePanel
├── CTA section
│   ├── [Get Free / Buy · $X]     → handleAcquire() → auth guard → acquire()
│   ├── [Read] (owned + ebook)    → /book/[id]
│   ├── [Play Audiobook] (owned + audio) → audioStore.setBook()
│   └── Action row
│       ├── [♥ Wishlist]          → handleWishlist() → auth guard → toggleWishlist()
│       ├── [↓ Download]          → (chưa implement)
│       └── [+ Add to List]       → handleAddToList() → auth guard → setShowListModal(true)
│
└── <AddToListModal />             (khi showListModal = true)
    ├── List checkbox items        → toggle addToList / removeFromList + toast
    └── [+ Create new list]        → inline input → createList() + addToList()
```

### `AddToListModal` — `components/book/AddToListModal.tsx`

```
AddToListModal (fixed overlay, click-outside để đóng)
├── Header: "Add to List" + book title + [X]
├── List items (max-h-64, overflow-y-auto)
│   └── CheckboxRow[] per list
│       ├── Checkbox (brand nếu inList)
│       ├── List name + book count
│       └── onClick: toggle addToList / removeFromList + toast.success/info
└── Footer
    ├── [+ Create new list] button
    └── (nếu showInput)
        ├── Text input (maxLength=40, Enter=create, Escape=cancel)
        └── [Create] [X] buttons
```

### BentoCard Library Integration

Tất cả BentoCard variants đều subscribe `useLibraryStore()` để hiển thị owned status:
```typescript
const { isOwned } = useLibraryStore();
const owned = isOwned(book.id);
// → hiển thị badge "✓ Owned" vs "FREE" vs "$X.XX"
```

---

## Interaction Workflow

### Acquire (Free hoặc Buy)
```
User click [Get Free / Buy · $X] (trong BookSidePanel hoặc CategoryPage)
  → auth guard: !currentUser → redirect /signin
  → acquire(book)
     → isOwned? → return (no-op)
     → Optimistic: ownedBooks = [..., book]; wishlist remove book
     → POST /api/library { action: "acquire", payload: { bookId } }
         → server: verify cookie → add to ownedBookIds, remove from wishlistIds
         → response: resolved library
     → nếu fail: rollback ownedBooks
  → BookSidePanel: CTA đổi sang "✓ In Library" + hiện [Read] / [Play]
  → BentoCards: badge đổi sang "✓ Owned"
```

### Wishlist Toggle
```
User click [♥ Wishlist]
  → auth guard
  → !isOwned check (đã owned thì return)
  → wasIn = isWishlisted(book.id)
  → Optimistic: toggle wishlist
  → POST /api/library { action: "toggleWishlist" }
  → rollback nếu fail
```

### Create List + Add Book
```
User click [+ Add to List] trong BookSidePanel
  → auth guard → setShowListModal(true)
  → AddToListModal render

User click [+ Create new list]
  → showInput = true
  → User nhập tên → Enter hoặc [Create]
  → createList(name):
       listId = "list_${Date.now()}"
       Optimistic: lists = [..., { id: listId, name, books: [], createdAt }]
       POST { action: "createList", payload: { listId, name } }
  → addToList(listId, book):
       Optimistic: tìm list, thêm book vào books[]
       POST { action: "addToList", payload: { listId, bookId } }
  → toast.success(`Added to "${name}"`)
```

### Rename List (InlineRename)
```
User hover ListRow → icon ✏ hiện → click
  → renaming = true → <InlineRename> input xuất hiện
  → User edit + Enter / blur
     → nếu value thay đổi: renameList(listId, newName)
     → nếu không đổi: cancel
  → POST { action: "renameList", payload: { listId, newName } }
```

### Rating
```
User mở BookSidePanel (owned + logged in)
  → BookSidePanel fetch GET /api/ratings → lấy entry của book
  → hiện StarInput (interactive)

User click sao N
  → handleVote(N)
  → ratingSubmitting = true
  → POST /api/ratings { bookId, email, stars: N }
      → server: upsert votes[email] = N
      → computeEffective() → { rating, countStr, userVote }
  → cập nhật ratingData
  → "✓ Your rating saved" message
```

---

## Edge Cases

| Tình huống | Xử lý |
|---|---|
| Acquire sách đã owned | `isOwned()` check → return sớm, không gọi API |
| Wishlist sách đã owned | `isOwned()` check trong `toggleWishlist` → return (wishlist button disabled UI) |
| Acquire → auto remove wishlist | Optimistic: `wishlist.filter(b => b.id !== bookId)` + server cũng xóa |
| API fail khi acquire | Rollback: `ownedBooks.filter(b => b.id !== book.id)` |
| List ID conflict (tạo 2 list cùng lúc) | `list_${Date.now()}` — unlikely race condition, acceptable for portfolio |
| Xóa list đang xem (openList) | `deleteList(openList.id)` + `setOpenList(null)` → back về danh sách |
| openList không sync với store | `useEffect([lists])`: tìm updated list → setOpenList(updated) |
| Rate book khi không owned | StarInput chỉ hiện khi `owned && currentUser` — guard ở UI |
| Submit vote nhiều lần | API upsert → votes[email] ghi đè, không tạo duplicate |
| Network lỗi trong `setUser` | try/catch → state empty, user thấy thư viện trống (retry khi reload) |

---

## Key Implementation Notes

**1. Server lưu IDs, client nhận Books:**
```
library.json:  { ownedBookIds: ["1", "3"] }  ← chỉ IDs
GET response:  { ownedBooks: [Book, Book] }   ← resolved objects
```
Giải quyết bằng `resolveBooks(ids, catalog)` trên server — client không bao giờ phải join.

**2. libraryStore nhận `userId` (không phải email):**
Trong code thực tế, `setUser(email: string)` — tên param là `email` nhưng thực ra API sẽ lấy userId từ cookie. Hàm này chỉ trigger fetch, không truyền userId lên API.

**3. Stacked cover thumbnails trong ListRow:**
```typescript
list.books.slice(0, 3).map((b, i) => (
  <div style={{ left: i * 8, top: i * -4 + 8, zIndex: i }}>
    <Image src={b.cover} ... />
  </div>
))
```
Fan-out effect bằng absolute positioning với offset tăng dần.

**4. Toast integration:**
`AddToListModal` import trực tiếp `toast` helper từ `toastStore`:
```typescript
import { toast } from "@/lib/store/toastStore";
toast.success(`Added to "${list.name}"`);
toast.info(`Removed from "${list.name}"`);
```
