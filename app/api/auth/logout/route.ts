import { NextResponse } from "next/server";
import { COOKIE_NAME } from "@/lib/auth";

// ── POST /api/auth/logout ────────────────────────────────────
export async function POST() {
  const res = NextResponse.json({ ok: true });
  // Xoá cookie bằng cách set maxAge = 0
  res.cookies.set(COOKIE_NAME, "", {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  return res;
}
