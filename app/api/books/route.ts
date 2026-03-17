import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { books } from "@/lib/schema";
import { eq, inArray } from "drizzle-orm";
import type { Book } from "@/lib/mockData";

// ── Map DB row → Book type (giữ shape như cũ cho client) ─────
function toBook(row: typeof books.$inferSelect): Book {
  return {
    id:          row.id,
    title:       row.title,
    author:      row.author,
    narrator:    row.narrator ?? undefined,
    cover:       row.cover ?? "",
    coverHQ:     row.coverHQ ?? undefined,
    rating:      row.rating ? Number(row.rating) : 0,
    ratingCount: row.ratingCount ?? "0",
    genres:      (row.genres ?? []) as Book["genres"],
    audioUrl:    row.audioUrl ?? undefined,
    isFree:      row.isFree ?? false,
    price:       row.price ? Number(row.price) : undefined,
    length:      row.length ?? undefined,
    format:      row.format ?? undefined,
    publisher:   row.publisher ?? undefined,
    released:    row.released ?? undefined,
    description: row.description ?? undefined,
    pages:       row.pages ?? undefined,
  };
}

// ── GET /api/books ────────────────────────────────────────────
// ?id=1        → trả về 1 book
// ?ids=1,2,3   → trả về nhiều books
// (không có)   → trả về toàn bộ catalog
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  const id = searchParams.get("id");
  if (id) {
    const rows = await db.select().from(books).where(eq(books.id, id));
    if (!rows.length) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(toBook(rows[0]));
  }

  const ids = searchParams.get("ids");
  if (ids) {
    const idList = ids.split(",").map((s) => s.trim());
    const rows = await db.select().from(books).where(inArray(books.id, idList));
    return NextResponse.json(rows.map(toBook));
  }

  const rows = await db.select().from(books);
  return NextResponse.json(rows.map(toBook));
}
