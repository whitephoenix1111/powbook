# LLD 05 — API Contract

Tất cả routes nằm trong `app/api/`. Data layer dùng **Neon PostgreSQL + Drizzle ORM** (không còn `fs` / JSON files).

---

## Auth

### `POST /api/auth/register`
```
Body:    { email: string, password: string }

200 OK:  { id: string, email: string }
400:     { error: "Email and password are required." }
409:     { error: "An account with this email already exists." }

Side effects:
  - scrypt hash password → INSERT users (UUID id auto-gen)
  - set cookie: lv_session = JWT(userId, email), httpOnly, sameSite=lax, 7d
```

### `POST /api/auth/login`
```
Body:    { email: string, password: string }

200 OK:  { ok: true, id: string, email: string }
400:     { error: "Email and password are required." }
401:     { error: "Incorrect email or password." }

Side effects:
  - set cookie lv_session
```

### `POST /api/auth/logout`
```
Body:    (none)
200 OK:  { ok: true }

Side effects:
  - clear cookie lv_session
```

### `GET /api/auth/me`
```
200 OK:  { user: { id: string, email: string } }   ← cookie valid
200 OK:  { user: null }                             ← no cookie / expired / invalid
```
> Không trả 401 — luôn trả 200. Client tự xử lý `user: null`.

---

## Books

### `GET /api/books`
```
Query params:
  ?id=1        → Book | 404 { error: "Not found" }
  ?ids=1,2,3   → Book[]  (filter từ catalog, bỏ qua id không tồn tại)
  (none)        → Book[]  (toàn bộ catalog)

200 OK:  Book | Book[]
404:     { error: "Not found" }   (chỉ khi ?id= không tìm thấy)
```

---

## Library

### `GET /api/library`
```
Auth: cookie lv_session required

200 OK: {
  ownedBooks: Book[],
  wishlist:   Book[],
  lists: [{ id, name, books: Book[], createdAt: number }]
}
401: { error: "Unauthorized" }
```

### `POST /api/library`
```
Auth: cookie lv_session required
Body: { action: string, payload: Record<string, unknown> }

200 OK:  ResolvedLibrary  (same shape as GET response)
400:     { error: "Unknown action: <action>" }
401:     { error: "Unauthorized" }
```

**Actions:**

| action | payload | Hành vi |
|---|---|---|
| `acquire` | `{ bookId }` | INSERT owned_books; DELETE wishlist |
| `toggleWishlist` | `{ bookId }` | INSERT/DELETE wishlist; no-op nếu đã owned |
| `removeWishlist` | `{ bookId }` | DELETE wishlist |
| `createList` | `{ listId, name }` | INSERT lists (listId do client tạo) |
| `renameList` | `{ listId, newName }` | UPDATE lists SET name; no-op nếu trim empty |
| `deleteList` | `{ listId }` | DELETE lists (cascade → list_books) |
| `addToList` | `{ listId, bookId }` | INSERT list_books; skip nếu đã có |
| `removeFromList` | `{ listId, bookId }` | DELETE list_books |

---

## Ratings

### `GET /api/ratings`
```
200 OK: {
  [bookId: string]: {
    rating:   number,   // effective weighted average, rounded 1 decimal
    countStr: string,   // "1.2k" format
    votes:    Record<email, 1|2|3|4|5>
  }
}
```

### `POST /api/ratings`
```
Body: { bookId: string, email: string, stars: 1|2|3|4|5 }

200 OK: { rating: number, countStr: string, userVote: number }
400:    { error: "Invalid payload" }
404:    { error: "Book not found" }
500:    { error: "Failed to write rating" }
```

**Effective rating formula:**
```
totalSum   = baseRating × baseCount + Σ(all votes)
totalCount = baseCount  + votes.length
effective  = round(totalSum / totalCount, 1 decimal)
```

> Note: API không enforce "phải owned mới được rate" — chỉ enforce ở client (StarInput chỉ hiện khi `owned && currentUser`).

---

## Auth Guard Implementation (Server-Side)

Dùng trong `library/route.ts`:

```typescript
function getUserId(req: NextRequest): string | null {
  const token = req.cookies.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyJWT(token)?.userId ?? null;
}

// Trong handler:
const userId = getUserId(req);
if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
```

`verifyJWT` kiểm tra:
1. Đúng 3 phần (header.payload.sig)
2. HMAC-SHA256 signature hợp lệ (timing-safe compare)
3. `exp > now`

---

*← [04 - State Management](./04-state-management.md) | Tiếp theo: [06 - Data Schema](./06-data-schema.md)*
