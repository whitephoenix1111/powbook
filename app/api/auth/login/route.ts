import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { verifyPassword, signJWT, COOKIE_NAME } from "@/lib/auth";

// ── Types ────────────────────────────────────────────────────
interface UserRecord {
  id:           string;
  email:        string;
  passwordHash: string;
  createdAt:    number;
}

// ── File helpers ─────────────────────────────────────────────
const USERS_FILE = path.join(process.cwd(), "data", "users.json");

function readUsers(): UserRecord[] {
  try { return JSON.parse(fs.readFileSync(USERS_FILE, "utf8")); } catch { return []; }
}

// ── POST /api/auth/login ─────────────────────────────────────
export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const { email, password } = body as { email?: string; password?: string };

  if (!email || !password) {
    return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
  }

  const users  = readUsers();
  const user   = users.find((u) => u.email.toLowerCase() === email.toLowerCase());

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
