import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { books, ownedBooks, wishlist, lists, listBooks } from "@/lib/schema";
import { eq, and, inArray } from "drizzle-orm";
import { verifyJWT, COOKIE_NAME } from "@/lib/auth";
import type { Book } from "@/lib/mockData";
import type { ResolvedLibrary } from "@/lib/libraryTypes";

// ── Auth guard ────────────────────────────────────────────────
function getUserId(req: NextRequest): string | null {
  const token = req.cookies.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyJWT(token)?.userId ?? null;
}

// ── Map DB row → Book ─────────────────────────────────────────
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

// ── Fetch full resolved library cho 1 user ────────────────────
async function getResolvedLibrary(userId: string): Promise<ResolvedLibrary> {
  // 1. owned books
  const ownedRows = await db
    .select({ book: books })
    .from(ownedBooks)
    .innerJoin(books, eq(books.id, ownedBooks.bookId))
    .where(eq(ownedBooks.userId, userId));

  // 2. wishlist
  const wishlistRows = await db
    .select({ book: books })
    .from(wishlist)
    .innerJoin(books, eq(books.id, wishlist.bookId))
    .where(eq(wishlist.userId, userId));

  // 3. lists
  const userLists = await db.select().from(lists).where(eq(lists.userId, userId));

  const resolvedLists = await Promise.all(
    userLists.map(async (l) => {
      const bookRows = await db
        .select({ book: books })
        .from(listBooks)
        .innerJoin(books, eq(books.id, listBooks.bookId))
        .where(eq(listBooks.listId, l.id));
      return {
        id:        l.id,
        name:      l.name,
        createdAt: l.createdAt ? new Date(l.createdAt).getTime() : Date.now(),
        books:     bookRows.map((r) => toBook(r.book)),
      };
    })
  );

  return {
    ownedBooks: ownedRows.map((r) => toBook(r.book)),
    wishlist:   wishlistRows.map((r) => toBook(r.book)),
    lists:      resolvedLists,
  };
}

// ── GET /api/library ──────────────────────────────────────────
export async function GET(req: NextRequest) {
  const userId = getUserId(req);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  return NextResponse.json(await getResolvedLibrary(userId));
}

// ── POST /api/library ─────────────────────────────────────────
export async function POST(req: NextRequest) {
  const userId = getUserId(req);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const { action, payload } = body as { action: string; payload: Record<string, unknown> };

  switch (action) {

    case "acquire": {
      const { bookId } = payload as { bookId: string };
      await db.insert(ownedBooks).values({ userId, bookId }).onConflictDoNothing();
      await db.delete(wishlist).where(and(eq(wishlist.userId, userId), eq(wishlist.bookId, bookId)));
      break;
    }

    case "toggleWishlist": {
      const { bookId } = payload as { bookId: string };
      // Đã owned → bỏ qua
      const owned = await db.select().from(ownedBooks)
        .where(and(eq(ownedBooks.userId, userId), eq(ownedBooks.bookId, bookId)));
      if (owned.length) break;

      const inWishlist = await db.select().from(wishlist)
        .where(and(eq(wishlist.userId, userId), eq(wishlist.bookId, bookId)));
      if (inWishlist.length) {
        await db.delete(wishlist).where(and(eq(wishlist.userId, userId), eq(wishlist.bookId, bookId)));
      } else {
        await db.insert(wishlist).values({ userId, bookId }).onConflictDoNothing();
      }
      break;
    }

    case "removeWishlist": {
      const { bookId } = payload as { bookId: string };
      await db.delete(wishlist).where(and(eq(wishlist.userId, userId), eq(wishlist.bookId, bookId)));
      break;
    }

    case "createList": {
      const { listId, name } = payload as { listId: string; name: string };
      const trimmed = name.trim();
      if (trimmed) {
        await db.insert(lists).values({ id: listId, userId, name: trimmed }).onConflictDoNothing();
      }
      break;
    }

    case "renameList": {
      const { listId, newName } = payload as { listId: string; newName: string };
      const trimmed = newName.trim();
      if (trimmed) {
        await db.update(lists).set({ name: trimmed })
          .where(and(eq(lists.id, listId), eq(lists.userId, userId)));
      }
      break;
    }

    case "deleteList": {
      const { listId } = payload as { listId: string };
      // listBooks cascade delete tự động vì FK onDelete: cascade
      await db.delete(lists).where(and(eq(lists.id, listId), eq(lists.userId, userId)));
      break;
    }

    case "addToList": {
      const { listId, bookId } = payload as { listId: string; bookId: string };
      await db.insert(listBooks).values({ listId, bookId }).onConflictDoNothing();
      break;
    }

    case "removeFromList": {
      const { listId, bookId } = payload as { listId: string; bookId: string };
      await db.delete(listBooks).where(and(eq(listBooks.listId, listId), eq(listBooks.bookId, bookId)));
      break;
    }

    default:
      return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 });
  }

  return NextResponse.json(await getResolvedLibrary(userId));
}
