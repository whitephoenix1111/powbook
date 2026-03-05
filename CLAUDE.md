
# Digital Library Hub - Bento UI (E-book & Audiobook)

## 1. Tổng quan dự án (Overview)

Dự án xây dựng một nền tảng quản lý nội dung số (E-book và Audiobook) với giao diện hiện đại theo phong cách Bento Grid. Tập trung vào trải nghiệm người dùng (UI/UX) liền mạch, cho phép khám phá, đọc trực tuyến và nghe thử sách nói.

* **Mục tiêu:** Fresher Portfolio Project.
* **Phong cách:** Retro Editorial & Bento Grid.

---

## 2. Tech Stack (Công nghệ sử dụng)

* **Frontend:** Next.js 15 (App Router), TypeScript, Tailwind CSS, Shadcn/ui.
* **Backend & Auth:** Firebase (Firestore, Firebase Auth).
* **Media Storage:** Cloudinary (Lưu trữ ảnh bìa, file PDF, file MP3 sample).
* **State Management:** Zustand (Quản lý trạng thái Global Audio Player).
* **Icons:** Lucide React.

---

## 3. Danh sách Chức năng (Functional Requirements)

### 3.1. Discovery & Dashboard

* **Bento Grid Layout:** Hiển thị sách theo các khối kích thước khác nhau (Popular, Recommended).
* **Category Filtering:** Lọc nhanh nội dung theo E-books, Audiobooks, Podcast, Comics.
* **Global Search:** Tìm kiếm theo tiêu đề, tác giả hoặc chủ đề.

### 3.2. Nội dung đa phương tiện (Hybrid Content)

* **E-book Viewer:** Trình đọc file PDF trực tiếp trên trình duyệt.
* **Audiobook Player:** Bộ điều khiển phát nhạc (Play/Pause/Seek) cho các đoạn nghe thử (Samples).
* **Contextual Side Panel:** Hiển thị thông tin chi tiết (Metadata) bên phải màn hình khi chọn sách mà không điều hướng trang.

### 3.3. Quản lý người dùng (Personalization)

* **Authentication:** Đăng nhập/Đăng ký qua Firebase Auth (Google/Email).
* **Library Management (CRUD):** * Lưu sách vào mục "Saved".
* Nút "Borrow/Access" để mở khóa nội dung (giả lập thanh toán).

* **Progress Tracking:** Lưu lại tiến độ đang đọc (trang số) hoặc đang nghe (giây số) vào Firestore.

---

## 4. Workflow & Data Flow (Sơ đồ luồng)

```text
[ USER INTERFACE ]
       |
       |-- (1) Tìm kiếm/Lọc ----> [ FIRESTORE QUERY ]
       |-- (2) Chọn một mục  ----> [ STATE: Set Active Book ] ----> [ SIDE PANEL DISPLAY ]
       |
       |-- (3) Hành động:
       |       |
       |       |---> [ READ ] ----> [ GET PDF URL (Cloudinary) ] ----> [ PDF RENDERER ]
       |       |---> [ PLAY ] ----> [ GET MP3 URL (Cloudinary) ] ----> [ ZUSTAND AUDIO PLAYER ]
       |
       |-- (4) Lưu/Mượn     ----> [ FIREBASE AUTH CHECK ] ----> [ UPDATE FIRESTORE ]
                                          |
                                          |---> [ SYNC UI STATE ]

```

---

## 5. Chiến lược triển khai (Implementation Strategy)

1. **Giai đoạn 1:** Dựng Layout tĩnh với Tailwind & Shadcn (Bento Grid + Sidebar).
2. **Giai đoạn 2:** Cấu hình Firebase & Cloudinary. Upload dữ liệu mẫu.
3. **Giai đoạn 3:** Xử lý logic Click hiển thị Side Panel và Fetch dữ liệu từ Firestore.
4. **Giai đoạn 4:** Xây dựng trình đọc PDF và Custom Audio Player bằng Zustand.
5. **Giai đoạn 5:** Tối ưu Responsive và Performance (Image Optimization).

---

## 6. Trạng thái hiện tại (Current Status)

### ✅ Hoàn thành
- Dự án khởi tạo tại `D:\powbook` — Next.js 15 (App Router) + TypeScript + Tailwind CSS
- Shadcn/ui đã init + các components: button, badge, card, input, sheet, scroll-area, separator, avatar, dropdown-menu
- Đã cài: firebase, zustand, lucide-react, next-cloudinary, react-pdf, @react-pdf-viewer/core
- `app/layout.tsx` — fonts Playfair Display + DM Sans, metadata
- `lib/mockData.ts` — types `Book`, mock data: `POPULAR_BOOKS`, `RECOMMENDED_AUDIOBOOKS`, `ACTIVE_BOOK`
- `components/layout/Sidebar.tsx` — icon nav với active state, top/bottom items, logo
- `components/book/BookCard.tsx` — cover image, title, author, star rating, bookmark icon, `onSelect` callback
- `components/book/BookSidePanel.tsx` — header (cover + meta), action buttons (Read/Play Sample/Download/Save/Add), metadata table, description
- `app/(auth)/login/page.tsx` — trang **Create an account**: carousel 4 slides + dot nav, social buttons (Google/Facebook/Apple), email/password form, toggle hiện mật khẩu, link → `/signin`
- `app/(auth)/signin/page.tsx` — trang **Sign in**: cùng layout với login, form đăng nhập, link → `/login`

- `lib/store/audioStore.ts` — Zustand store: play/pause/seek/speed/skipForward/skipBackward, formatTime helper
- `lib/mockData.ts` — thêm `BookPage` interface, `audioUrl`, helper `getBookById()`
- `components/player/AudioPlayer.tsx` — orange bar sát đáy, phát MP3 thật (LibriVox), speed toggle, rewind/forward 15s, progress bar click-to-seek
- `components/viewer/PdfViewer.tsx` — 2 cột hình chữ nhật dựng đứng, border khung sách, số trang luôn ở đáy (`mt-auto`), 3 nút float ngoài khung (Bookmark/Translate/TextSize)
- `app/(main)/reader/[id]/page.tsx` — route `/reader/9`, kết nối Sidebar + PdfViewer + AudioPlayer

### 🚧 Skeleton (tạo file rồi nhưng chưa implement)
- `components/bento/BentoGrid.tsx` — chỉ là `<div className="grid">`
- `components/bento/BentoCard.tsx` — chỉ là placeholder div
- `components/layout/Navbar.tsx` — chỉ là `<nav>Navbar</nav>`
- `app/(main)/page.tsx` — chỉ có `<h1>Dashboard</h1>`

### ❌ Chưa làm
- `lib/firebase.ts` — chưa cấu hình
- `lib/cloudinary.ts` — chưa cấu hình
- `.env.local` — chưa tạo

---

**Bước tiếp theo: Implement `BentoGrid`, `BentoCard`, `Navbar` + wire vào `app/(main)/page.tsx`**

---

## 7. Cấu trúc thư mục đề xuất

```
app/
├── (auth)/
│   └── login/page.tsx
├── (main)/
│   └── page.tsx          # Dashboard chính
├── globals.css
└── layout.tsx

components/
├── ui/                   # Shadcn components (đã có)
├── layout/
│   ├── Sidebar.tsx
│   └── Navbar.tsx
├── bento/
│   ├── BentoGrid.tsx
│   └── BentoCard.tsx
├── book/
│   ├── BookSidePanel.tsx
│   └── BookCard.tsx
├── player/
│   └── AudioPlayer.tsx
└── viewer/
    └── PdfViewer.tsx

lib/
├── firebase.ts
├── cloudinary.ts
└── store/
    └── audioStore.ts     # Zustand
```

---