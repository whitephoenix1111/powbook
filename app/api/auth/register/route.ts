import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import crypto from "crypto";
import { hashPassword, signJWT, COOKIE_NAME } from "@/lib/auth";

// ── Types ────────────────────────────────────────────────────
interface UserRecord {
  id:           string;   // UUID — dùng làm foreign key ở library.json
  email:        string;
  passwordHash: string;
  createdAt:    number;
}

// ── File helpers ─────────────────────────────────────────────
const USERS_FILE = path.join(process.cwd(), "data", "users.json");

function readUsers(): UserRecord[] {
  try { return JSON.parse(fs.readFileSync(USERS_FILE, "utf8")); } catch { return []; }
}
function writeUsers(users: UserRecord[]): void {
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
}

// ── POST /api/auth/register ──────────────────────────────────
export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const { email, password } = body as { email?: string; password?: string };

  if (!email || !password) {
    return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
  }

  const users = readUsers();
  const exists = users.some((u) => u.email.toLowerCase() === email.toLowerCase());
  if (exists) {
    return NextResponse.json(
      { error: "An account with this email already exists." },
      { status: 409 }
    );
  }

  const newUser: UserRecord = {
    id:           crypto.randomUUID(),
    email,
    passwordHash: hashPassword(password),
    createdAt:    Date.now(),
  };
  writeUsers([...users, newUser]);

  const token = signJWT(newUser.id, newUser.email);
  const res = NextResponse.json({ ok: true, id: newUser.id, email: newUser.email });
  res.cookies.set(COOKIE_NAME, token, {
    httpOnly: true, sameSite: "lax", path: "/",
    maxAge: 60 * 60 * 24 * 7,
    secure: process.env.NODE_ENV === "production",
  });
  return res;
}
