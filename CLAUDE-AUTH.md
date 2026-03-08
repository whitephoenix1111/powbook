# Auth System — Powbook

> File này tài liệu hoá toàn bộ hệ thống auth (register / login / logout / session).
> Xem `CLAUDE.md` cho tổng quan dự án.

---

## 1. Tổng quan

Auth dựa trên **JWT + httpOnly cookie** — không dùng localStorage cho session.

```
Client                        Server (API Routes)
  │                                  │
  ├─ POST /api/auth/register ────────► hash password (scrypt)
  │                                  │ ghi users.json
  │  ◄─── set-cookie: lv_session ───┤ JWT (7 ngày)
  │                                  │
  ├─ POST /api/auth/login ───────────► verify password
  │  ◄─── set-cookie: lv_session ───┤ JWT (7 ngày)
  │                                  │
  ├─ GET  /api/auth/me ──────────────► verifyJWT(cookie)
  │  ◄─── { user: {id, email} } ────┤
  │                                  │
  └─ POST /api/auth/logout ──────────► clear cookie
```

**Cookie:** `lv_session` — `httpOnly`, `sameSite: lax`, `maxAge: 7 ngày`, `secure` trên production.

---

## 2. lib/auth.ts — Server-only utilities

> Import file này **CHỈ** trong API routes. Dùng Node.js `crypto`, không có dependency ngoài.

| Hàm | Mô tả |
|---|---|
| `hashPassword(password)` | scrypt → trả về `"salt:hash"` lưu vào users.json |
| `verifyPassword(password, stored)` | so sánh timing-safe với stored `"salt:hash"` |
| `signJWT(userId, email)` | HS256 thủ công, payload `{ userId, email, iat, exp }`, mặc định 7 ngày |
| `verifyJWT(token)` | trả về payload hoặc `null` nếu invalid / hết hạn |
| `COOKIE_NAME` | `"lv_session"` |

---

## 3. API Routes

### `POST /api/auth/register`
```
Body: { email, password }
→ Kiểm tra trùng email (case-insensitive)
→ hashPassword() → ghi users.json (id: uuid-v4, createdAt: timestamp)
→ signJWT() → set cookie
← 200: { ok, id, email }
← 409: { error: "Email already registered." }
← 400: { error: "Email and password are required." }
```

### `POST /api/auth/login`
```
Body: { email, password }
→ Tìm user theo email (case-insensitive)
→ verifyPassword()
→ signJWT() → set cookie
← 200: { ok, id, email }
← 401: { error: "Incorrect email or password." }
```

### `POST /api/auth/logout`
```
→ Xoá cookie lv_session (set maxAge: 0)
← 200: { ok }
```

### `GET /api/auth/me`
```
→ Đọc cookie → verifyJWT()
← 200: { user: { id, email } }   // logged in
← 200: { user: null }            // không có cookie hoặc hết hạn
```

---

## 4. authStore (`lib/store/authStore.ts`)

Zustand store **không persist** — session được giữ bởi httpOnly cookie phía server.  
`currentUser` là client-side cache, được restore mỗi khi app mount qua `hydrate()`.

```ts
interface User {
  id:    string   // uuid-v4
  email: string
}

interface AuthState {
  currentUser: User | null

  register(email, password): Promise<{ ok: boolean; error?: string }>
  login(email, password):    Promise<{ ok: boolean; error?: string }>
  logout():                  Promise<void>
  hydrate():                 Promise<void>   // gọi GET /api/auth/me
  isLoggedIn():              boolean
}
```

### Side effects khi login / register thành công
```
set({ currentUser })
→ useLibraryStore.getState().setUser(userId)   // fetch library từ API
```

### Side effects khi logout
```
set({ currentUser: null })
→ useLibraryStore.getState().clearUser()       // xoá cache library
```

### hydrate() — gọi trong layout.tsx
```tsx
// app/(main)/layout.tsx
useEffect(() => {
  hydrate()
  // Dọn localStorage keys cũ từ version mock trước
  localStorage.removeItem("lv_auth")
  localStorage.removeItem("lv_library")
}, [])
```

---

## 5. Data file — `data/users.json`

```json
[
  {
    "id": "uuid-v4",
    "email": "user@example.com",
    "passwordHash": "salt:hash",   // scrypt, KHÔNG lưu plain-text
    "createdAt": 1234567890
  }
]
```

---

## 6. Auth Guard Pattern

### Trang protected (`/saved`)
Dùng `AuthGate` component per-tab — không redirect, hiển thị inline prompt:

```tsx
// Mỗi tab có copy riêng
{ Titles:   "Sign in to see your library" }
{ Wishlist: "Sign in to use Wishlist" }
{ Lists:    "Sign in to use Lists" }
```

### Actions (Buy / Wishlist / AddToList)
Guard ở handler level, **không phải** ở component:

```tsx
// CategoryContent.tsx
onAcquire={(e) => {
  e.stopPropagation()
  if (!currentUser) { router.push("/signin"); return }
  acquire(book)
}}

// BookSidePanel.tsx
function handleAcquire() {
  if (!currentUser) { close(); router.push("/signin"); return }
  acquire(book)
}
```

---

## 7. Trang Login (`/login`) — Register

**Route:** `app/(auth)/login/page.tsx` — group `(auth)`, không có Sidebar/Navbar.

### Form validation

| Field | Rules |
|---|---|
| Email | Required + regex format |
| Password | Required + min 8 chars + 1 uppercase + 1 number |

- Validate `onBlur`
- **Password Strength bar** — 4 segments: đỏ → vàng → xanh dương → xanh lá
- CTA xám + `cursor-not-allowed` khi form chưa valid
- Success: "Account created!" → auto-redirect về `/` sau 1800ms

---

## 8. Trang Signin (`/signin`) — Login

**Route:** `app/(auth)/signin/page.tsx` — cùng group `(auth)`.

| | Login (`/login`) | Signin (`/signin`) |
|---|---|---|
| Action | `register()` | `login()` |
| Password rules | strength rules | chỉ required |
| Strength bar | ✅ | ❌ |
| Success message | "Account created!" | "Welcome back!" |

---

## 9. Navbar — User Dropdown

- **displayName** = `email.split("@")[0]`, CSS `capitalize`
- **Avatar** = DiceBear adventurer, seed = email
- Click ngoài → tự đóng (mousedown listener)
- Sign out: `logout()` + `router.push("/signin")`

---

## 10. localStorage

Không còn dùng cho auth hay library. Chỉ còn 1 key:

| Key | Nơi dùng | Nội dung |
|---|---|---|
| `bookmark_${bookId}` | `BookTextViewer` | boolean — đánh dấu trang |

Keys cũ `lv_auth`, `lv_library` bị xoá chủ động trong `layout.tsx` khi app mount.
