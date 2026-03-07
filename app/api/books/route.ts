import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import type { Book } from "@/lib/mockData";

const BOOKS_FILE = path.join(process.cwd(), "data", "books.json");

function readBooks(): Book[] {
  return JSON.parse(fs.readFileSync(BOOKS_FILE, "utf8")) as Book[];
}

// ── GET /api/books ────────────────────────────────────────────
// ?id=1        → trả về 1 book
// ?ids=1,2,3   → trả về nhiều books
// (không có)   → trả về toàn bộ catalog
export async function GET(req: NextRequest) {
  const books = readBooks();
  const { searchParams } = new URL(req.url);

  const id = searchParams.get("id");
  if (id) {
    const book = books.find((b) => b.id === id);
    if (!book) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(book);
  }

  const ids = searchParams.get("ids");
  if (ids) {
    const idSet = new Set(ids.split(",").map((s) => s.trim()));
    return NextResponse.json(books.filter((b) => idSet.has(b.id)));
  }

  return NextResponse.json(books);
}
