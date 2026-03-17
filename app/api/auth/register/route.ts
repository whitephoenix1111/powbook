import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { hashPassword, signJWT, COOKIE_NAME } from "@/lib/auth";

// ── POST /api/auth/register ──────────────────────────────────
export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const { email, password } = body as { email?: string; password?: string };

  if (!email || !password) {
    return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
  }

  // Check duplicate
  const existing = await db.select().from(users).where(eq(users.email, email.toLowerCase()));
  if (existing.length) {
    return NextResponse.json(
      { error: "An account with this email already exists." },
      { status: 409 }
    );
  }

  const [newUser] = await db
    .insert(users)
    .values({
      email:        email.toLowerCase(),
      passwordHash: hashPassword(password),
    })
    .returning({ id: users.id, email: users.email });

  const token = signJWT(newUser.id, newUser.email);
  const res = NextResponse.json({ ok: true, id: newUser.id, email: newUser.email });
  res.cookies.set(COOKIE_NAME, token, {
    httpOnly: true, sameSite: "lax", path: "/",
    maxAge: 60 * 60 * 24 * 7,
    secure: process.env.NODE_ENV === "production",
  });
  return res;
}
