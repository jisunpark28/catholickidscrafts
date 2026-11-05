import { SignJWT, jwtVerify } from "jose";

/**
 * Admin (operator) session limits. Edge-safe (jose only): used by middleware and lib/admin-auth.
 * - Absolute: 8 hours after the password sign-in, never extended.
 * - Idle: 30 minutes without an /admin or /api/admin request ends the session.
 *   The last admin request time lives in a signed, HttpOnly cookie bound to the admin id and
 *   the sign-in time, so it cannot be copied from another session or edited.
 */
export const ADMIN_SESSION_MAX_AGE_SEC = 8 * 60 * 60;
export const ADMIN_IDLE_TIMEOUT_SEC = 30 * 60;
export const ADMIN_ACTIVITY_COOKIE = "ckc_admin_activity";
/** The cookie outlives the idle limit by 2 minutes so the server re-check can apply its grace. */
const ADMIN_ACTIVITY_TTL_SEC = ADMIN_IDLE_TIMEOUT_SEC + 120;

const CLOCK_SKEW_SEC = 60;

function key(): Uint8Array {
  const s = process.env.AUTH_SECRET?.trim();
  if (!s) throw new Error("AUTH_SECRET is required for admin sessions");
  return new TextEncoder().encode(s);
}

export const nowSec = () => Math.floor(Date.now() / 1000);

/** True when the sign-in time is missing, in the future, or more than 8 hours ago. */
export function isAdminLoginExpired(loginAt: unknown, now = nowSec()): boolean {
  if (typeof loginAt !== "number" || !Number.isFinite(loginAt)) return true;
  if (loginAt > now + CLOCK_SKEW_SEC) return true;
  return now - loginAt > ADMIN_SESSION_MAX_AGE_SEC;
}

export type AdminActivityRef = { adminId: string; loginAt: number };

export async function signAdminActivity(ref: AdminActivityRef, now = nowSec()): Promise<string> {
  return new SignJWT({ kind: "admin-activity", aid: ref.adminId, lat: ref.loginAt })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt(now)
    .setExpirationTime(now + ADMIN_ACTIVITY_TTL_SEC)
    .sign(key());
}

/** Last admin request time from the cookie, or null when missing, expired, tampered or from another session. */
export async function readAdminLastActivity(
  token: string | undefined | null,
  ref: AdminActivityRef,
  now = nowSec(),
): Promise<number | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, key(), { currentDate: new Date(now * 1000) });
    if (payload.kind !== "admin-activity") return null;
    if (payload.aid !== ref.adminId || payload.lat !== ref.loginAt) return null;
    return typeof payload.iat === "number" ? payload.iat : null;
  } catch {
    return null;
  }
}

/**
 * Idle check. Without a valid activity cookie the session counts from the sign-in itself,
 * so a missing cookie never grants more than 30 minutes after sign-in.
 */
export async function isAdminIdleExpired(input: {
  token: string | undefined | null;
  ref: AdminActivityRef;
  now?: number;
  /** Extra seconds allowed (server re-check that sees the cookie from before this request). */
  graceSec?: number;
}): Promise<boolean> {
  const now = input.now ?? nowSec();
  if (isAdminLoginExpired(input.ref.loginAt, now)) return true;
  const last = (await readAdminLastActivity(input.token, input.ref, now)) ?? input.ref.loginAt;
  if (last > now + CLOCK_SKEW_SEC) return true;
  return now - Math.max(last, input.ref.loginAt) > ADMIN_IDLE_TIMEOUT_SEC + (input.graceSec ?? 0);
}

export function adminActivityCookieOptions(value: string, maxAge = ADMIN_ACTIVITY_TTL_SEC) {
  return {
    name: ADMIN_ACTIVITY_COOKIE,
    value,
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge,
  };
}

/** Admin pages and admin APIs (the login page itself does not count as activity). */
export function isAdminActivityPath(pathname: string): boolean {
  if (pathname === "/admin/login" || pathname.startsWith("/admin/login/")) return false;
  return pathname === "/admin" || pathname.startsWith("/admin/") || pathname === "/api/admin" || pathname.startsWith("/api/admin/");
}
