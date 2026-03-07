# Auth System — Litverse

> File này tài liệu hoá toàn bộ hệ thống auth (register / login / logout).  
> Xem `CLAUDE.md` cho tổng quan dự án.

---

## 1. authStore (`lib/store/authStore.ts`)

Zustand store với `persist` middleware → lưu vào `localStorage["lv_auth"]`.

```ts
interface User {
  email: string
  password: string  // plain-text mock — không có backend
  createdAt: number
}

interface AuthState {
  users: User[]             // danh sách tất cả tài khoản đã đăng ký
  currentUser: User | null  // session hiện tại (null = chưa login)

  register(email, password): { ok: boolean; error?: string }
  login(email, password):    { ok: boolean; error?: string }
  logout(): void
  isLoggedIn(): boolean
}
```

### Logic chi tiết

| Action | Behavior |
|---|---|
| `register` | Kiểm tra email trùng (case-insensitive) → thêm vào `users[]` + set `currentUser` |
| `login` | Tìm user khớp email + password → set `currentUser` |
| `logout` | Set `currentUser = null` |
| Persist | `users` + `currentUser` được lưu, restore khi reload |

### Error messages
- `"An account with this email already exists."` — register trùng email
- `"Incorrect email or password."` — login sai credentials

---

## 2. libraryStore — persist

`lib/store/libraryStore.ts` đã thêm `persist` middleware → `localStorage["lv_library"]`.

Các field được persist: `ownedBooks`, `wishlist`, `lists`.  
Các function (isOwned, acquire, ...) **không** persist — chỉ là derived state.

---

## 3. Trang Login (`app/(auth)/login/page.tsx`)

**Route:** `/login` — nằm trong `(auth)` group, **không có Sidebar/Navbar**.

### Layout
```
┌─────────────────────────────────────────┐
│  LEFT (hidden on mobile)  │  RIGHT form │
│  • Logo → href="/"        │             │
│  • Auto-advance carousel  │             │
│  • Decorative rings       │             │
│  • Slide dots (brand màu) │             │
└─────────────────────────────────────────┘
```

### Form fields & Validation

| Field | Rules |
|---|---|
| Email | Required + regex format |
| Password | Required + min 8 chars + 1 uppercase + 1 number |

- Validate `onBlur` (không spam lỗi khi đang gõ)
- Icon `CheckCircle2` xanh / `AlertCircle` đỏ trong input
- Error message nhỏ bên dưới field
- **Password Strength bar** — 4 segments, màu: đỏ → vàng → xanh dương → xanh lá

### Submit flow
```
handleSubmit()
  → setEmailTouched + setPasswordTouched (trigger validation UI)
  → if (!isFormValid) return
  → register(email, password)
    → ok: false → setServerError (banner đỏ phía trên button)
    → ok: true  → setSubmitted = true → success screen → setTimeout(router.push("/"), 1800)
```

### States
- **idle** — form bình thường
- **error** — field border đỏ + message + icon
- **ok** — field border xanh + checkmark
- **serverError** — banner đỏ (`bg-red-50 border-red-200`) phía trên CTA
- **submitted** — success screen với `CheckCircle2` + "Account created!" + auto-redirect

### UX notes
- CTA button xám + `cursor-not-allowed` khi form chưa valid
- Logo "Litverse" ở left panel là `<Link href="/">` → về home
- Mobile: left panel ẩn (`hidden md:flex`), thay bằng logo nhỏ trong form
- Carousel auto-advance 4s với fade transition (opacity 0→1, 300ms)
- Đã bỏ `<Sidebar />` — auth pages không có shell

---

## 4. Trang Signin (`app/(auth)/signin/page.tsx`)

**Route:** `/signin` — cùng group `(auth)`, không có shell.

### Khác biệt so với Login

| | Login | Signin |
|---|---|---|
| Heading | "Create an account" | "Sign in" |
| Action | `register()` | `login()` |
| Password validation | strength rules | chỉ required |
| Password strength bar | ✅ | ❌ |
| Success message | "Account created!" | "Welcome back!" |
| Carousel slides | feature highlights | "welcome back" themed |

### Submit flow
```
handleSubmit()
  → setEmailTouched + setPasswordTouched
  → if (!isFormValid) return
  → login(email, password)
    → ok: false → setServerError "Incorrect email or password."
    → ok: true  → setSuccess = true → setTimeout(router.push("/"), 1800)
```

- Gõ vào input → `setServerError("")` reset lỗi ngay lập tức
- CTA button active khi `email && password` có giá trị

---

## 5. Navbar — User Dropdown

`components/layout/Navbar.tsx`

```
[Avatar] [displayName]  ▼
         Story Seeker
```

Click → dropdown:
```
┌─────────────────────┐
│ displayName         │
│ user@email.com      │
├─────────────────────┤
│ 👤 Profile          │
│ ⚙️  Settings        │
├─────────────────────┤
│ 🔴 Sign out         │
└─────────────────────┘
```

- **displayName** = `email.split("@")[0]`, CSS `capitalize`
- **Avatar** = DiceBear adventurer, seed = email → unique per user
- Click ngoài dropdown → tự đóng (`mousedown` listener)
- `ChevronDown` xoay 180° khi mở
- **Sign out**: `logout()` + `router.push("/signin")`

---

## 6. Sidebar — Logout Button

`components/layout/Sidebar.tsx`

- `LogOut` icon tách khỏi `BOTTOM_ITEMS` array (dùng `<button>` thay `<Link>`)
- Style: `text-red-400 hover:bg-red-50 hover:text-red-500`
- onClick: `logout()` + `router.push("/signin")`
- Nhất quán với Sign out trong Navbar dropdown

---

## 7. localStorage Keys

| Key | Store | Nội dung |
|---|---|---|
| `lv_auth` | authStore | `{ users[], currentUser }` |
| `lv_library` | libraryStore | `{ ownedBooks[], wishlist[], lists[] }` |
| `bookmark_${id}` | BookTextViewer | page index bookmark |

---

## 8. Việc chưa làm (Auth)

- **Route guard** — middleware hoặc `useEffect` redirect `/signin` nếu `!currentUser` trên các trang protected
- **Profile page** — hiển thị thông tin user, đổi avatar seed
- **Đổi password** — form trong Settings
- **"Forgot password"** — hiện là button dummy, chưa có flow
