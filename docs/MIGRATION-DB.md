# MIGRATION — JSON Files → Neon PostgreSQL
## Powbook · Database Migration Plan

> **Lý do:** Vercel không hỗ trợ ghi file JSON trên filesystem (read-only). Cần chuyển sang DB thật.  
> **Stack mới:** Neon (PostgreSQL serverless) + Drizzle ORM  
> **Ngày lập:** 2025-03  
> **Status:** 🔴 Chưa bắt đầu

---

## Tại sao Neon + Drizzle?

| Tiêu chí | Lý do chọn |
|---|---|
| **Neon** | PostgreSQL serverless, free tier, Vercel integration 1-click, connection pooling sẵn |
| **Drizzle** | Schema viết TypeScript thuần → type-safe 100%, không cần `prisma generate`, bundle nhỏ, query gần SQL |

---

## Files thay đổi — tổng kết

| File | Trạng thái |
|---|---|
| `lib/db.ts` | 🆕 Tạo mới — Neon + Drizzle client |
| `lib/schema.ts` | 🆕 Tạo mới — tất cả table definitions |
| `drizzle.config.ts` | 🆕 Tạo mới — config cho drizzle-kit |
| `scripts/seed.ts` | 🆕 Tạo mới — seed từ JSON sang DB |
| `app/api/books/route.ts` | ✏️ Refactor |
| `app/api/auth/register/route.ts` | ✏️ Refactor |
| `app/api/auth/login/route.ts` | ✏️ Refactor |
| `app/api/ratings/route.ts` | ✏️ Refactor |
| `app/api/library/route.ts` | ✏️ Refactor (phức tạp nhất) |
| `lib/auth.ts` | ✅ Không đổi — JWT/cookie giữ nguyên |
| `lib/mockData.ts` | ✅ Không đổi — chỉ export types |
| Toàn bộ components & stores | ✅ Không đổi |

---

## Phase 1 — Setup hạ tầng
**Status: 🔴 Chưa làm**

```bash
npm install drizzle-orm @neondatabase/serverless drizzle-kit
```

Việc cần làm:
1. Tạo project trên [neon.tech](https://neon.tech) → copy `DATABASE_URL`
2. Thêm vào `.env.local`: `DATABASE_URL=postgresql://...`
3. Tạo `lib/db.ts` — khởi tạo Neon client + Drizzle instance
4. Tạo `drizzle.config.ts`

### `lib/db.ts` (template)
```typescript
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';

const sql = neon(process.env.DATABASE_URL!);
export const db = drizzle(sql, { schema });
```

### `drizzle.config.ts` (template)
```typescript
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './lib/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
```

---

## Phase 2 — Schema Design
**Status: 🔴 Chưa làm**

Tạo `lib/schema.ts` với các tables sau:

### Mapping JSON → Tables

| JSON file | Tables mới |
|---|---|
| `data/users.json` | `users` |
| `data/books.json` | `books` |
| `data/library.json` | `owned_books` + `wishlist` + `lists` + `list_books` |
| `data/ratings.json` | `ratings` + `user_votes` |

### Schema SQL (tham khảo)

```sql
-- users (thay users.json)
users {
  id            uuid        PK default gen_random_uuid()
  email         text        UNIQUE NOT NULL
  password_hash text        NOT NULL
  created_at    timestamp   default now()
}

-- books (thay books.json)
books {
  id          text        PK  -- giữ nguyên "1"–"10"
  title       text        NOT NULL
  author      text        NOT NULL
  narrator    text
  cover       text
  cover_hq    text
  rating      numeric(3,1)
  rating_count text
  genres      text[]      -- PostgreSQL array
  audio_url   text
  is_free     boolean     default false
  price       numeric(10,2)
  length      text
  format      text
  publisher   text
  released    text
  description text
  pages       jsonb       -- BookPage[] giữ nguyên dạng JSON
}

-- library — tách thành 4 tables
owned_books {
  user_id  uuid  FK→users.id
  book_id  text  FK→books.id
  PRIMARY KEY (user_id, book_id)
}

wishlist {
  user_id  uuid  FK→users.id
  book_id  text  FK→books.id
  PRIMARY KEY (user_id, book_id)
}

lists {
  id         text  PK  -- giữ pattern "list_${timestamp}"
  user_id    uuid  FK→users.id
  name       text  NOT NULL
  created_at timestamp default now()
}

list_books {
  list_id  text  FK→lists.id
  book_id  text  FK→books.id
  PRIMARY KEY (list_id, book_id)
}

-- ratings — tách thành 2 tables
ratings {
  book_id     text        PK  FK→books.id
  base_rating numeric(3,1)
  base_count  integer
}

user_votes {
  book_id  text      FK→ratings.book_id
  email    text
  stars    smallint  CHECK (stars BETWEEN 1 AND 5)
  PRIMARY KEY (book_id, email)
}
```

Sau khi tạo schema:
```bash
npx drizzle-kit push   # push schema lên Neon (dev)
# hoặc
npx drizzle-kit generate  # tạo migration files
npx drizzle-kit migrate   # chạy migration
```

---

## Phase 3 — Refactor API Routes
**Status: 🔴 Chưa làm**

Thứ tự thực hiện (ít dependency → nhiều):

### 3.1 `app/api/books/route.ts`
```
Cũ: readFile('data/books.json') → JSON.parse → filter
Mới: db.select().from(books)
     db.select().from(books).where(eq(books.id, id))
```

### 3.2 `app/api/auth/register/route.ts`
```
Cũ: readUsers() → check duplicate → push → writeUsers()
Mới: db.insert(users).values({...}).onConflictDoNothing()
```

### 3.3 `app/api/auth/login/route.ts`
```
Cũ: readUsers() → find by email → verifyPassword()
Mới: db.select().from(users).where(eq(users.email, email)) → verifyPassword()
```

### 3.4 `app/api/auth/me/route.ts`
```
Không đổi gì — chỉ verify JWT, không đụng data layer
```

### 3.5 `app/api/ratings/route.ts`
```
GET cũ: readRatings() → computeEffective() cho từng entry
GET mới: JOIN ratings + user_votes → computeEffective()

POST cũ: readRatings() → upsert votes[email] = stars → writeRatings()
POST mới: db.insert(userVotes).values({...}).onConflictDoUpdate(...)
```

### 3.6 `app/api/library/route.ts` ⚠️ Phức tạp nhất
```
GET cũ: find library record by userId → resolveBooks(ids, catalog)
GET mới: 
  - JOIN owned_books → books
  - JOIN wishlist → books  
  - JOIN lists → list_books → books
  → assemble { ownedBooks, wishlist, lists } shape như cũ

POST cũ: switch(action) → mutate library.json
POST mới: switch(action) → db.insert/delete trên đúng table
  acquire        → INSERT owned_books + DELETE wishlist
  toggleWishlist → INSERT/DELETE wishlist (check owned_books trước)
  removeWishlist → DELETE wishlist
  createList     → INSERT lists
  renameList     → UPDATE lists SET name=...
  deleteList     → DELETE lists (cascade xóa list_books)
  addToList      → INSERT list_books
  removeFromList → DELETE list_books
```

> **Lưu ý quan trọng:** Response shape của tất cả routes phải giữ nguyên 100% — client/stores không thay đổi gì.

---

## Phase 4 — Seed Data
**Status: 🔴 Chưa làm**

Tạo `scripts/seed.ts`:
- Đọc `data/books.json` → INSERT vào `books` table
- Đọc `data/ratings.json` → INSERT vào `ratings` + `user_votes` tables
- `users.json` và `library.json` không seed (dữ liệu test, không cần migrate)

```bash
npx tsx scripts/seed.ts
```

---

## Phase 5 — Cleanup & Docs
**Status: 🔴 Chưa làm**

- [ ] Xoá `data/users.json`, `data/library.json`, `data/ratings.json`
- [ ] Giữ `data/books.json` làm backup reference
- [ ] Xoá tất cả `import fs from 'fs'` trong API routes
- [ ] Cập nhật `HLD.md` — Data Layer section: JSON files → Neon PostgreSQL
- [ ] Cập nhật `LLD 05` — API Contract: ghi chú không còn fs
- [ ] Cập nhật `LLD 06` — Data Schema: thay JSON schema bằng SQL schema

---

## Ngữ cảnh project (tóm tắt cho new chat)

- **Dự án:** Powbook — Digital Library Hub (E-book & Audiobook), Fresher Portfolio Project
- **Framework:** Next.js 15 App Router + TypeScript + Tailwind + Zustand
- **Auth:** JWT trong httpOnly cookie (`lv_session`), scrypt hash, `lib/auth.ts` server-only
- **Data cũ:** 4 JSON files trong `data/` — đọc/ghi qua Node.js `fs` trong API routes
- **Data mới:** Neon PostgreSQL + Drizzle ORM
- **Client/stores:** Không thay đổi gì — toàn bộ thay đổi nằm ở `app/api/` và `lib/`
- **Docs đầy đủ:** `docs/HLD.md`, `docs/LLD.md`, `docs/lld/01–07`

---

## Checklist tổng

- [ ] Phase 1 — Setup Neon + Drizzle
- [ ] Phase 2 — Tạo schema + migrate
- [ ] Phase 3.1 — Refactor `/api/books`
- [ ] Phase 3.2 — Refactor `/api/auth/register`
- [ ] Phase 3.3 — Refactor `/api/auth/login`
- [ ] Phase 3.5 — Refactor `/api/ratings`
- [ ] Phase 3.6 — Refactor `/api/library`
- [ ] Phase 4 — Seed data
- [ ] Phase 5 — Cleanup + cập nhật docs
