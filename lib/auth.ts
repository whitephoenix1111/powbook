/**
 * lib/auth.ts — Server-only auth utilities
 * Dùng Node.js built-in `crypto`, không cần thêm dependency.
 * Import file này CHỈ ở API routes (server-side).
 */
import crypto from "crypto";

// ── Constants ────────────────────────────────────────────────
export const COOKIE_NAME = "lv_session";
const JWT_SECRET =
  process.env.JWT_SECRET ?? "litverse-dev-secret-change-in-prod";

// ── Password hashing (scrypt) ────────────────────────────────

/** Hash password → "salt:hash" string để lưu vào users.json */
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

/** So sánh plain-text password với stored "salt:hash" */
export function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const attempt = crypto.scryptSync(password, salt, 64).toString("hex");
  return crypto.timingSafeEqual(Buffer.from(attempt), Buffer.from(hash));
}

// ── JWT (HS256, Node crypto only) ────────────────────────────

export interface JWTPayload {
  userId: string;
  email:  string;
  iat: number;
  exp: number;
}

/** Tạo JWT token, mặc định hết hạn sau 7 ngày */
export function signJWT(userId: string, email: string, expiresInDays = 7): string {
  const header = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64url");
  const body = Buffer.from(
    JSON.stringify({
      userId,
      email,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + expiresInDays * 86400,
    })
  ).toString("base64url");

  const sig = crypto
    .createHmac("sha256", JWT_SECRET)
    .update(`${header}.${body}`)
    .digest("base64url");

  return `${header}.${body}.${sig}`;
}

/** Xác thực JWT — trả về payload hoặc null nếu invalid/hết hạn */
export function verifyJWT(token: string): JWTPayload | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const [header, body, sig] = parts;

    const expected = crypto
      .createHmac("sha256", JWT_SECRET)
      .update(`${header}.${body}`)
      .digest("base64url");

    // Timing-safe compare
    if (sig.length !== expected.length) return null;
    if (
      !crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))
    )
      return null;

    const payload = JSON.parse(
      Buffer.from(body, "base64url").toString()
    ) as JWTPayload;

    if (payload.exp < Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch {
    return null;
  }
}
