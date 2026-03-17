import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { ratings, userVotes } from "@/lib/schema";
import { eq } from "drizzle-orm";

/* ── computeEffective (giữ nguyên logic) ── */
function computeEffective(
  baseRating: number,
  baseCount: number,
  votes: { stars: number }[]
): { rating: number; count: number } {
  const extraSum   = votes.reduce((a, v) => a + v.stars, 0);
  const totalCount = baseCount + votes.length;
  const totalSum   = baseRating * baseCount + extraSum;
  return {
    rating: totalCount > 0 ? Math.round((totalSum / totalCount) * 10) / 10 : baseRating,
    count:  totalCount,
  };
}

function formatCount(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
}

/* ── GET /api/ratings ───────────────────────────────────────
   Response: { [bookId]: { rating, countStr, votes: Record<email,stars> } }
── */
export async function GET() {
  try {
    const allRatings = await db.select().from(ratings);
    const allVotes   = await db.select().from(userVotes);

    // Group votes by bookId
    const votesByBook: Record<string, { email: string; stars: number }[]> = {};
    for (const v of allVotes) {
      if (!votesByBook[v.bookId]) votesByBook[v.bookId] = [];
      votesByBook[v.bookId].push({ email: v.email, stars: v.stars });
    }

    const result: Record<string, { rating: number; countStr: string; votes: Record<string, number> }> = {};

    for (const r of allRatings) {
      const bookVotes = votesByBook[r.bookId] ?? [];
      const { rating, count } = computeEffective(
        Number(r.baseRating),
        r.baseCount ?? 0,
        bookVotes,
      );
      // Reconstruct votes map (email → stars) — giữ shape như cũ
      const votesMap: Record<string, number> = {};
      for (const v of bookVotes) votesMap[v.email] = v.stars;

      result[r.bookId] = { rating, countStr: formatCount(count), votes: votesMap };
    }

    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: "Failed to read ratings" }, { status: 500 });
  }
}

/* ── POST /api/ratings ──────────────────────────────────────
   Body: { bookId, email, stars }
   Response: { rating, countStr, userVote }
── */
export async function POST(req: NextRequest) {
  try {
    const { bookId, email, stars } = await req.json();

    if (!bookId || !email || typeof stars !== "number" || stars < 1 || stars > 5) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    // Check book exists in ratings
    const existing = await db.select().from(ratings).where(eq(ratings.bookId, bookId));
    if (!existing.length) {
      return NextResponse.json({ error: "Book not found" }, { status: 404 });
    }

    // Upsert vote
    await db
      .insert(userVotes)
      .values({ bookId, email, stars })
      .onConflictDoUpdate({
        target: [userVotes.bookId, userVotes.email],
        set: { stars },
      });

    // Recompute effective rating
    const r = existing[0];
    const votes = await db.select().from(userVotes).where(eq(userVotes.bookId, bookId));
    const { rating, count } = computeEffective(Number(r.baseRating), r.baseCount ?? 0, votes);

    return NextResponse.json({ rating, countStr: formatCount(count), userVote: stars });
  } catch {
    return NextResponse.json({ error: "Failed to write rating" }, { status: 500 });
  }
}
