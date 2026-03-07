import { NextRequest, NextResponse } from "next/server";
import { verifyJWT, COOKIE_NAME } from "@/lib/auth";

// ── GET /api/auth/me ─────────────────────────────────────────
export async function GET(req: NextRequest) {
  const token = req.cookies.get(COOKIE_NAME)?.value;
  if (!token) return NextResponse.json({ user: null });

  const payload = verifyJWT(token);
  if (!payload) {
    const res = NextResponse.json({ user: null });
    res.cookies.set(COOKIE_NAME, "", { httpOnly: true, path: "/", maxAge: 0 });
    return res;
  }

  return NextResponse.json({ user: { id: payload.userId, email: payload.email } });
}
