/**
 * Seed script: đọc data/books.json + data/ratings.json → INSERT vào Neon DB
 * Chạy: npx dotenv -e .env.local -- tsx scripts/seed.ts
 */

import { resolve } from 'path';
import { readFileSync } from 'fs';
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { books, ratings } from '../lib/schema';

// ─── Types ────────────────────────────────────────────────────────────────────
interface RawBook {
  id: string;
  title: string;
  author: string;
  narrator?: string;
  cover?: string;
  coverHQ?: string;
  rating?: number;
  ratingCount?: string;
  genres?: string[];
  audioUrl?: string;
  isFree?: boolean;
  price?: number;
  length?: string;
  format?: string;
  publisher?: string;
  released?: string;
  description?: string;
  pages?: Array<{ pageNumber: number; chapter?: string; content: string }>;
}

interface RawRatings {
  [bookId: string]: {
    baseRating: number;
    baseCount: number;
    votes: Record<string, number>;
  };
}

// ─── Load JSON files ──────────────────────────────────────────────────────────
const rawBooks: RawBook[] = JSON.parse(
  readFileSync(resolve(process.cwd(), 'data/books.json'), 'utf-8'),
);

const rawRatings: RawRatings = JSON.parse(
  readFileSync(resolve(process.cwd(), 'data/ratings.json'), 'utf-8'),
);

// ─── Seed ─────────────────────────────────────────────────────────────────────
async function seed() {
  const sql = neon(process.env.DATABASE_URL!);
  const db = drizzle(sql);

  console.log('🌱 Starting seed...\n');

  // 1. Seed books
  console.log(`📚 Seeding ${rawBooks.length} books...`);
  await db
    .insert(books)
    .values(
      rawBooks.map((b) => ({
        id:          b.id,
        title:       b.title,
        author:      b.author,
        narrator:    b.narrator ?? null,
        cover:       b.cover ?? null,
        coverHQ:     b.coverHQ ?? null,
        rating:      b.rating?.toString() ?? null,
        ratingCount: b.ratingCount ?? null,
        genres:      b.genres ?? [],
        audioUrl:    b.audioUrl ?? null,
        isFree:      b.isFree ?? false,
        price:       b.price?.toString() ?? null,
        length:      b.length ?? null,
        format:      b.format ?? null,
        publisher:   b.publisher ?? null,
        released:    b.released ?? null,
        description: b.description ?? null,
        pages:       b.pages ?? null,
      })),
    )
    .onConflictDoNothing();
  console.log('  ✅ Books done\n');

  // 2. Seed ratings
  const ratingEntries = Object.entries(rawRatings);
  console.log(`⭐ Seeding ${ratingEntries.length} rating entries...`);
  await db
    .insert(ratings)
    .values(
      ratingEntries.map(([bookId, r]) => ({
        bookId:     bookId,
        baseRating: r.baseRating.toString(),
        baseCount:  r.baseCount,
      })),
    )
    .onConflictDoNothing();
  console.log('  ✅ Ratings done\n');

  console.log('🎉 Seed completed successfully!');
}

seed().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
