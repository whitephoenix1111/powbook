import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { verifyJWT, COOKIE_NAME } from "@/lib/auth";
import type { Book } from "@/lib/mockData";

// ── Types ────────────────────────────────────────────────────

// Cấu trúc lưu trong library.json — array of records, mỗi record = 1 user
interface LibraryRecord {
  userId:       string;   // foreign key → users.json[].id
  ownedBookIds: string[];
  wishlistIds:  string[];
  lists: {
    id:        string;
    name:      string;
    bookIds:   string[];
    createdAt: number;
  }[];
}

// Cấu trúc trả về cho client — resolved thành Book objects
export interface ResolvedLibrary {
  ownedBooks: Book[];
  wishlist:   Book[];
  lists: {
    id:        string;
    name:      string;
    books:     Book[];
    createdAt: number;
  }[];
}

// ── File helpers ─────────────────────────────────────────────
const LIBRARY_FILE = path.join(process.cwd(), "data", "library.json");
const BOOKS_FILE   = path.join(process.cwd(), "data", "books.json");

function readLibraryDB(): LibraryRecord[] {
  try { return JSON.parse(fs.readFileSync(LIBRARY_FILE, "utf8")); } catch { return []; }
}
function writeLibraryDB(records: LibraryRecord[]): void {
  fs.writeFileSync(LIBRARY_FILE, JSON.stringify(records, null, 2));
}
function readBooksDB(): Book[] {
  try { return JSON.parse(fs.readFileSync(BOOKS_FILE, "utf8")); } catch { return []; }
}

const EMPTY_RECORD = (userId: string): LibraryRecord => ({
  userId,
  ownedBookIds: [],
  wishlistIds:  [],
  lists:        [],
});

// ── Resolve IDs → Books ───────────────────────────────────────
function resolveBooks(ids: string[], catalog: Book[]): Book[] {
  return ids.map((id) => catalog.find((b) => b.id === id)).filter(Boolean) as Book[];
}

function resolveLibrary(record: LibraryRecord, catalog: Book[]): ResolvedLibrary {
  return {
    ownedBooks: resolveBooks(record.ownedBookIds, catalog),
    wishlist:   resolveBooks(record.wishlistIds,  catalog),
    lists: record.lists.map((l) => ({
      id:        l.id,
      name:      l.name,
      createdAt: l.createdAt,
      books:     resolveBooks(l.bookIds, catalog),
    })),
  };
}

// ── Auth guard ────────────────────────────────────────────────
function getUserId(req: NextRequest): string | null {
  const token = req.cookies.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyJWT(token)?.userId ?? null;
}

// ── GET /api/library ──────────────────────────────────────────
export async function GET(req: NextRequest) {
  const userId = getUserId(req);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const records = readLibraryDB();
  const catalog = readBooksDB();
  const record  = records.find((r) => r.userId === userId) ?? EMPTY_RECORD(userId);

  return NextResponse.json(resolveLibrary(record, catalog));
}

// ── POST /api/library ─────────────────────────────────────────
// Body: { action: string, payload: { bookId?: string, ... } }
// Tất cả mutations nhận bookId (string) thay vì full Book object
export async function POST(req: NextRequest) {
  const userId = getUserId(req);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const { action, payload } = body as { action: string; payload: Record<string, unknown> };

  const records = readLibraryDB();
  const catalog = readBooksDB();
  const existingIndex = records.findIndex((r) => r.userId === userId);
  const record: LibraryRecord =
    existingIndex !== -1 ? records[existingIndex] : EMPTY_RECORD(userId);

  switch (action) {

    case "acquire": {
      const { bookId } = payload as { bookId: string };
      if (!record.ownedBookIds.includes(bookId)) {
        record.ownedBookIds = [...record.ownedBookIds, bookId];
        record.wishlistIds  = record.wishlistIds.filter((id) => id !== bookId);
      }
      break;
    }

    case "toggleWishlist": {
      const { bookId } = payload as { bookId: string };
      if (record.ownedBookIds.includes(bookId)) break; // đã owned → bỏ qua
      if (record.wishlistIds.includes(bookId)) {
        record.wishlistIds = record.wishlistIds.filter((id) => id !== bookId);
      } else {
        record.wishlistIds = [...record.wishlistIds, bookId];
      }
      break;
    }

    case "removeWishlist": {
      const { bookId } = payload as { bookId: string };
      record.wishlistIds = record.wishlistIds.filter((id) => id !== bookId);
      break;
    }

    case "createList": {
      const { listId, name } = payload as { listId: string; name: string };
      const trimmed = name.trim();
      if (trimmed) {
        record.lists = [...record.lists, { id: listId, name: trimmed, bookIds: [], createdAt: Date.now() }];
      }
      break;
    }

    case "renameList": {
      const { listId, newName } = payload as { listId: string; newName: string };
      const trimmed = newName.trim();
      if (trimmed) {
        record.lists = record.lists.map((l) => l.id === listId ? { ...l, name: trimmed } : l);
      }
      break;
    }

    case "deleteList": {
      const { listId } = payload as { listId: string };
      record.lists = record.lists.filter((l) => l.id !== listId);
      break;
    }

    case "addToList": {
      const { listId, bookId } = payload as { listId: string; bookId: string };
      record.lists = record.lists.map((l) =>
        l.id === listId && !l.bookIds.includes(bookId)
          ? { ...l, bookIds: [...l.bookIds, bookId] }
          : l
      );
      break;
    }

    case "removeFromList": {
      const { listId, bookId } = payload as { listId: string; bookId: string };
      record.lists = record.lists.map((l) =>
        l.id === listId ? { ...l, bookIds: l.bookIds.filter((id) => id !== bookId) } : l
      );
      break;
    }

    default:
      return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 });
  }

  // Upsert — cập nhật nếu đã có, thêm mới nếu chưa có
  if (existingIndex !== -1) {
    records[existingIndex] = record;
  } else {
    records.push(record);
  }
  writeLibraryDB(records);

  // Trả về resolved library (backward compat với libraryStore)
  return NextResponse.json(resolveLibrary(record, catalog));
}
