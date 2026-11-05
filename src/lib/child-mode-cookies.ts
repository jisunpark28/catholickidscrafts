import { DEVICE_LOCK_COOKIE, FAMILY_SESSION_COOKIE, READER_SESSION_COOKIE } from "@/lib/family-session";
import type { NextResponse } from "next/server";

/**
 * Cookie clearing for child mode, kept free of DB imports so it can be unit tested.
 * Every clear uses the same name + path ("/") + host-only domain the cookie was set with,
 * otherwise the browser keeps the old cookie.
 */

/** Remove the "this device was handed to a child" marker (only after a proven grown-up sign-in). */
export function clearDeviceLockCookie(res: NextResponse): void {
  res.cookies.set(DEVICE_LOCK_COOKIE, "", { path: "/", maxAge: 0 });
}

/**
 * A child signs out: always drop the child's ckc_reader. The parent cookie is dropped too
 * when it only keeps the child reading (child mode) or is no longer valid, so no stale
 * child-mode state is left behind. An active parent session is left alone.
 * The device lock is kept on purpose: leaving child mode needs grown-up proof.
 */
export function clearChildSignOutCookies(res: NextResponse, opts: { clearFamily: boolean }): void {
  res.cookies.set(READER_SESSION_COOKIE, "", { path: "/", maxAge: 0 });
  if (opts.clearFamily) res.cookies.set(FAMILY_SESSION_COOKIE, "", { path: "/", maxAge: 0 });
}

/** Should a child sign-out also clear ckc_family? */
export function shouldClearFamilyOnChildSignOut(input: {
  familyCookiePresent: boolean;
  /** null when the cookie is missing, expired, tampered or revoked. */
  familyMode: "owner" | "sub" | null;
}): boolean {
  if (!input.familyCookiePresent) return false;
  return input.familyMode !== "owner";
}
