# Feature Design: Authentication

## Purpose & Scope

Auth feature cung cấp cơ chế đăng ký, đăng nhập, đăng xuất và session restore cho toàn bộ app. Dùng **JWT trong httpOnly cookie** — client không bao giờ đọc token trực tiếp.

**Scope:**
- Register (email + password) → tạo account mới
- Login → xác thực + set session cookie
- Logout → clear cookie + reset client state
- Hydrate → restore session từ cookie khi app mount
- Auth guard cho mọi action cần đăng nhập

**Ngoài scope:** OAuth, email verification, password reset, 2FA, rate limiting

---

## State Architecture

**Store:** `lib/store/authStore.ts` (Zustand, không persist)

```typescript
interface AuthState {
  currentUser: { id: string; email: string } | null

  register(email, password)  → Promise<{ ok, error? }>
  login(email, password)     → Promise<{ ok, error? }>
  logout()                   → Promise<void>
  hydrate()                  → Promise<void>
  isLoggedIn()               → boolean   // getter từ currentUser
}
```

**Tại sao không persist store?**
Session được giữ bởi httpOnly cookie phía server (7 ngày). `currentUser` chỉ là in-memory cache — `hydrate()` restore nó mỗi lần app load từ `/api/auth/me`. Không cần localStorage, tránh stale state.

**Dependency với libraryStore:**
```typescript
// authStore gọi libraryStore khi auth state thay đổi
login/register → libraryStore.setUser(userId)   // fetch library data
logout         → libraryStore.clearUser()        // reset library state
hydrate        → libraryStore.setUser(userId)    // restore library cùng lúc
```

---

## Component Breakdown

### `app/(auth)/signin/page.tsx` — Sign In
```
SignInPage
├── Logo + "Welcome back" heading
├── Email input
├── Password input
├── Error message (nếu có)
├── [Sign In] button → authStore.login()
└── "Don't have an account? Create one" → /login
```

### `app/(auth)/login/page.tsx` — Create Account
```
LoginPage (Register)
├── Logo + "Create your account" heading
├── Email input
├── Password input
├── Confirm password input
├── Error message (nếu có)
├── [Create Account] button → authStore.register()
└── "Already have an account? Sign in" → /signin
```

### `components/layout/Navbar.tsx` — User dropdown
```
Navbar
├── (nếu !isLoggedIn)
│   ├── [Sign In] → /signin
│   └── [Create Account] → /login
└── (nếu isLoggedIn)
    └── UserDropdown (click để toggle)
        ├── DiceBear avatar (seed = email)
        ├── Display name (email.split("@")[0])
        ├── "Story Seeker" subtitle
        ├── Dropdown panel
        │   ├── User info (name + email)
        │   ├── [Profile] (chưa implement)
        │   ├── [Settings] (chưa implement)
        │   └── [Sign out] → logout() + redirect /signin
        └── Close on outside click (useEffect mousedown)
```

### `components/layout/Sidebar.tsx` — Logout button
```
Sidebar
└── Bottom nav
    └── [Logout] button → logout() + redirect /signin
```

### AuthGate Pattern (trong SavedPage)
```
AuthGate({ tab: "Titles" | "Wishlist" | "Lists" })
├── Icon
├── Title: "Sign in to see your library" / ...
├── Description
└── [Sign In] → /signin   [Create Account] → /login
```

---

## Interaction Workflow

### Register Flow
```
User điền email + password → click [Create Account]
  → authStore.register(email, password)
  → POST /api/auth/register { email, password }
      → server: scrypt hash(password) → ghi users.json (UUID id)
      → set cookie: lv_session = JWT(userId, email), httpOnly, 7d
      → response: { id, email }
  → set currentUser = { id, email }
  → libraryStore.setUser(id) → fetch GET /api/library
  → router.push("/")
```

### Login Flow
```
User điền email + password → click [Sign In]
  → authStore.login(email, password)
  → POST /api/auth/login { email, password }
      → server: verify scrypt hash → set cookie
      → response: { ok, id, email }
  → set currentUser = { id, email }
  → libraryStore.setUser(id)
  → router.push("/")
```

### Logout Flow
```
User click [Logout] / [Sign out]
  → authStore.logout()
  → POST /api/auth/logout
      → server: clear cookie lv_session
  → set currentUser = null
  → libraryStore.clearUser() (ownedBooks=[], wishlist=[], lists=[])
  → router.push("/signin")
```

### Hydrate Flow (App Mount)
```
app/(main)/layout.tsx mount
  → useEffect: authStore.hydrate()
  → GET /api/auth/me
      → server: verifyJWT(cookie) → { user: { id, email } } | { user: null }
  → nếu user: set currentUser + libraryStore.setUser(id)
  → nếu null: currentUser vẫn null (không redirect)
  
  // Đồng thời cleanup localStorage cũ
  localStorage.removeItem("lv_auth")
  localStorage.removeItem("lv_library")
```

### Auth Guard Flow (action cần auth)
```
User click [Buy] / [Wishlist] / [Add to List] trong BookSidePanel
  → kiểm tra !currentUser
  → close BookSidePanel + router.push("/signin")

User click [Acquire] / [Wishlist] trong CategoryPage BookCard
  → kiểm tra !currentUser
  → router.push("/signin")  (không close panel vì không có panel)
```

---

## Server-Side Auth Details

**File:** `lib/auth.ts` — server-only utilities

### Password Hashing (scrypt)
```typescript
// Hash: crypto.scryptSync(password, salt, 64)
// Stored format: "salt_hex:hash_hex"
hashPassword(password)           → "salt:hash"
verifyPassword(plain, stored)    → boolean (timing-safe compare)
```

### JWT Implementation (HS256, Node crypto only)
```typescript
// Payload: { userId, email, iat, exp }
// Secret: process.env.JWT_SECRET || "litverse-dev-secret-change-in-prod"
signJWT(userId, email, expiresInDays=7) → "header.payload.sig"
verifyJWT(token)                         → JWTPayload | null
```

**Cookie config:**
```typescript
res.cookies.set("lv_session", token, {
  httpOnly: true,      // không đọc được từ JS
  sameSite: "lax",     // CSRF protection cơ bản
  path: "/",
  maxAge: 60*60*24*7,  // 7 ngày
  secure: production,  // HTTPS only khi production
});
```

---

## Edge Cases

| Tình huống | Xử lý |
|---|---|
| Email đã tồn tại | `/api/auth/register` trả về 400 + error message, hiển thị trong form |
| Sai email/password | `/api/auth/login` trả về 401 "Incorrect email or password." |
| Cookie hết hạn khi đang dùng | `hydrate()` trả về `user: null`, currentUser = null. Không redirect tự động — chỉ guard khi thực hiện action |
| Network error trong `hydrate()` | try/catch → user ở trạng thái logged out (không throw) |
| User xóa cookie thủ công | Như trên — hydrate fail, user logged out |
| Truy cập `/saved` khi chưa login | Page render, nhưng từng tab có AuthGate riêng — không redirect ở route level |

---

## Key Implementation Notes

**1. Avatar từ DiceBear:**
```typescript
const avatarSrc = `https://api.dicebear.com/7.x/adventurer/svg?seed=${
  encodeURIComponent(email)
}&backgroundColor=b6e3f4`;
// Dùng unoptimized={true} vì là SVG từ external URL
```

**2. Display name từ email:**
```typescript
// "bruce.wayne@mail.com" → "Bruce"
const displayName = email.split("@")[0].split(/[._-]/)[0];
// capitalize first letter
```

**3. JWT không dùng library:**
`lib/auth.ts` implement HS256 thuần bằng Node.js `crypto` — không cần `jsonwebtoken` hay `jose`. Phù hợp với portfolio project muốn minimize dependencies.

**4. Không có route-level middleware:**
Hiện tại không có `middleware.ts` để redirect unauthenticated users. Auth protection được thực hiện tại component level (AuthGate) và action level (auth guard pattern). Đây là tradeoff phù hợp cho portfolio scope — production app nên thêm middleware.
