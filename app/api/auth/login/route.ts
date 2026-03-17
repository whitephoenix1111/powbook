import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { verifyPassword, signJWT, COOKIE_NAME } from "@/lib/auth";

// ── POST /api/auth/login ─────────────────────────────────────
export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const { email, password } = body as { email?: string; password?: string };

  if (!email || !password) {
    return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
  }

  const rows = await db.select().from(users).where(eq(users.email, email.toLowerCase()));
  const user = rows[0];

  if (!user || !verifyPassword(password, user.passwordHash)) {
    return NextResponse.json({ error: "Incorrect email or password." }, { status: 401 });
  }

  const token = signJWT(user.id, user.email);
  const res = NextResponse.json({ ok: true, id: user.id, email: user.email });
  res.cookies.set(COOKIE_NAME, token, {
    httpOnly: true, sameSite: "lax", path: "/",
    maxAge: 60 * 60 * 24 * 7,
    secure: process.env.NODE_ENV === "production",
  });
  return res;
}
