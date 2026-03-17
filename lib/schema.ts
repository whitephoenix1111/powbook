import {
  pgTable,
  text,
  uuid,
  timestamp,
  boolean,
  numeric,
  integer,
  smallint,
  jsonb,
  primaryKey,
} from 'drizzle-orm/pg-core';

// ─── BookPage type (dùng trong jsonb) ─────────────────────────────────────────
export type BookPage = {
  pageNumber: number;
  chapter?: string;
  content: string;
};

// ─── users ────────────────────────────────────────────────────────────────────
export const users = pgTable('users', {
  id:           uuid('id').primaryKey().defaultRandom(),
  email:        text('email').unique().notNull(),
  passwordHash: text('password_hash').notNull(),
  createdAt:    timestamp('created_at').defaultNow(),
});

// ─── books ────────────────────────────────────────────────────────────────────
export const books = pgTable('books', {
  id:          text('id').primaryKey(),   // giữ nguyên "1"–"10"
  title:       text('title').notNull(),
  author:      text('author').notNull(),
  narrator:    text('narrator'),
  cover:       text('cover'),
  coverHQ:     text('cover_hq'),
  rating:      numeric('rating', { precision: 3, scale: 1 }),
  ratingCount: text('rating_count'),
  genres:      text('genres').array(),   // text[]
  audioUrl:    text('audio_url'),
  isFree:      boolean('is_free').default(false),
  price:       numeric('price', { precision: 10, scale: 2 }),
  length:      text('length'),
  format:      text('format'),
  publisher:   text('publisher'),
  released:    text('released'),
  description: text('description'),
  pages:       jsonb('pages').$type<BookPage[]>(),
});

// ─── owned_books ──────────────────────────────────────────────────────────────
export const ownedBooks = pgTable(
  'owned_books',
  {
    userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    bookId: text('book_id').notNull().references(() => books.id, { onDelete: 'cascade' }),
  },
  (t) => [primaryKey({ columns: [t.userId, t.bookId] })],
);

// ─── wishlist ─────────────────────────────────────────────────────────────────
export const wishlist = pgTable(
  'wishlist',
  {
    userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    bookId: text('book_id').notNull().references(() => books.id, { onDelete: 'cascade' }),
  },
  (t) => [primaryKey({ columns: [t.userId, t.bookId] })],
);

// ─── lists ────────────────────────────────────────────────────────────────────
export const lists = pgTable('lists', {
  id:        text('id').primaryKey(),   // pattern "list_${timestamp}"
  userId:    uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  name:      text('name').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

// ─── list_books ───────────────────────────────────────────────────────────────
export const listBooks = pgTable(
  'list_books',
  {
    listId: text('list_id').notNull().references(() => lists.id, { onDelete: 'cascade' }),
    bookId: text('book_id').notNull().references(() => books.id, { onDelete: 'cascade' }),
  },
  (t) => [primaryKey({ columns: [t.listId, t.bookId] })],
);

// ─── ratings ──────────────────────────────────────────────────────────────────
export const ratings = pgTable('ratings', {
  bookId:     text('book_id').primaryKey().references(() => books.id, { onDelete: 'cascade' }),
  baseRating: numeric('base_rating', { precision: 3, scale: 1 }),
  baseCount:  integer('base_count'),
});

// ─── user_votes ───────────────────────────────────────────────────────────────
export const userVotes = pgTable(
  'user_votes',
  {
    bookId: text('book_id').notNull().references(() => ratings.bookId, { onDelete: 'cascade' }),
    email:  text('email').notNull(),
    stars:  smallint('stars').notNull(),
  },
  (t) => [primaryKey({ columns: [t.bookId, t.email] })],
);
