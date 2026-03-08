# Powbook — Digital Library Hub

Nền tảng quản lý nội dung số (E-book & Audiobook) với giao diện Bento Grid phong cách Retro Editorial. Fresher Portfolio Project.

**Business model:** Freemium — Free / Paid / Owned  
**Stack:** Next.js 15 · TypeScript · Tailwind CSS · Shadcn/ui · Zustand

---

## Yêu cầu

- Node.js 18+
- npm

---

## Cài đặt & Chạy local

```bash
# 1. Clone repo
git clone <repo-url>
cd powbook

# 2. Cài dependencies
npm install

# 3. Tạo file .env.local (xem phần Environment bên dưới)

# 4. Chạy dev server
npm run dev
```

Mở [http://localhost:3000](http://localhost:3000) trên trình duyệt.

---

## Environment Variables

Tạo file `.env.local` ở root:

```env
JWT_SECRET=your-secret-key-change-in-production
```

> Nếu không có `JWT_SECRET`, app vẫn chạy được với fallback secret mặc định — **chỉ dùng cho development**.

---

## Tài khoản thử nghiệm

Đăng ký tài khoản mới tại `/login`, hoặc dùng tài khoản có sẵn trong `data/users.json` (nếu đã seed).

Sau khi đăng nhập có thể:
- **Get Free** — nhận sách miễn phí vào library
- **Buy** — mua sách (mock, không tích hợp payment thật)
- **Wishlist** — lưu sách muốn đọc
- **Add to List** — tạo và quản lý reading lists
- **Rate** — đánh giá sách đã sở hữu (1–5 sao)
- **Read** — đọc e-book dạng 2 trang
- **Play** — nghe audiobook với player cố định phía dưới

---

## Cấu trúc chính

```
app/
├── (auth)/login        → Đăng ký tài khoản
├── (auth)/signin       → Đăng nhập
├── (main)/             → Home — Bento Grid
├── (main)/category     → Duyệt & tìm kiếm sách
├── (main)/saved        → Library cá nhân (Titles / Wishlist / Lists)
├── (main)/book/[id]    → Reader 2 trang
└── api/                → Auth, Books, Library, Ratings

data/
├── books.json          → Catalog 10 cuốn (source of truth)
├── users.json          → Tài khoản đã đăng ký
├── library.json        → Owned / wishlist / lists theo userId
└── ratings.json        → Điểm đánh giá theo bookId
```

---

## Auth

- JWT HS256 tự implement bằng Node.js `crypto` (không dùng thư viện ngoài)
- Session lưu trong **httpOnly cookie** `lv_session`, thời hạn 7 ngày
- Password hash bằng **scrypt**
- Không dùng localStorage cho auth

---

## Scripts

```bash
npm run dev      # Dev server (http://localhost:3000)
npm run build    # Production build
npm run start    # Chạy production build
npm run lint     # ESLint
```

---

## Lưu ý

- Data được lưu trong file JSON (`data/`) — phù hợp cho demo, không dùng cho production thực tế
- Audiobook stream trực tiếp từ LibriVox / archive.org
- Ảnh bìa từ OpenLibrary CDN và Google Books
