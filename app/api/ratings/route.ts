import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const DATA_PATH = path.join(process.cwd(), "data", "ratings.json");

/* ── Types ── */
export interface RatingEntry {
  baseRating: number;
  baseCount:  number;
  votes:      Record<string, number>; // email → 1..5
}

type RatingsFile = Record<string, RatingEntry>;

/* ── Helpers ── */
function readFile(): RatingsFile {
  const raw = fs.readFileSync(DATA_PATH, "utf-8");
  return JSON.parse(raw);
}

function writeFile(data: RatingsFile) {
  fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2), "utf-8");
}

export function computeEffective(entry: RatingEntry): { rating: number; count: number } {
  const allVotes   = Object.values(entry.votes);
  const extraSum   = allVotes.reduce((a, b) => a + b, 0);
  const totalCount = entry.baseCount + allVotes.length;
  const totalSum   = entry.baseRating * entry.baseCount + extraSum;
  return {
    rating: totalCount > 0 ? Math.round((totalSum / totalCount) * 10) / 10 : entry.baseRating,
    count:  totalCount,
  };
}

function formatCount(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
}

/* ── GET /api/ratings
   Response: { [bookId]: { rating: number, countStr: string, votes: Record<email,number> } }
── */
export async function GET() {
  try {
    const data = readFile();
    const result: Record<string, { rating: number; countStr: string; votes: Record<string, number> }> = {};

    for (const [id, entry] of Object.entries(data)) {
      const { rating, count } = computeEffective(entry);
      result[id] = { rating, countStr: formatCount(count), votes: entry.votes };
    }

    return NextResponse.json(result);
  } catch (e) {
    return NextResponse.json({ error: "Failed to read ratings" }, { status: 500 });
  }
}

/* ── POST /api/ratings
   Body: { bookId: string, email: string, stars: number (1-5) }
   Response: { rating: number, countStr: string, userVote: number }
── */
export async function POST(req: NextRequest) {
  try {
    const { bookId, email, stars } = await req.json();

    if (!bookId || !email || typeof stars !== "number" || stars < 1 || stars > 5) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    const data = readFile();

    // Nếu bookId chưa có trong file (sách mới được thêm vào mockData sau)
    if (!data[bookId]) {
      return NextResponse.json({ error: "Book not found" }, { status: 404 });
    }

    // Upsert vote — user có thể đổi vote
    data[bookId].votes[email] = stars;
    writeFile(data);

    const { rating, count } = computeEffective(data[bookId]);
    return NextResponse.json({
      rating,
      countStr: formatCount(count),
      userVote: stars,
    });
  } catch (e) {
    return NextResponse.json({ error: "Failed to write rating" }, { status: 500 });
  }
}
