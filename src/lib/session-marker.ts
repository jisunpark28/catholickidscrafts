/**
 * "Someone may be signed in on this browser" hint for the cookie-free site header.
 *
 * The real sessions (ckc_family, ckc_reader, ckc_device_lock) are HttpOnly, so the browser
 * cannot see them. Login code paths also set this small, readable marker so the header only
 * calls /api/auth/session when a session might exist; guests and bots skip that call.
 *
 * The marker is a display hint only. It carries no identity and the server NEVER uses it for
 * access decisions: every protected page and API still checks the signed session cookies.
 * Every sign-out clears it (lib/session-reset.ts), and /api/auth/session sets or clears it to
 * match the real session. Kept free of DB and next/headers imports so the client can use it.
 */
export const SESSION_MARKER_COOKIE = "ckc_has_session";
/** Longest any session can live (90-day parent hard limit); a stale marker only costs one fetch. */
export const SESSION_MARKER_MAX_AGE_SEC = 60 * 60 * 24 * 90;

type CookieSink = {
  set(
    name: string,
    value: string,
    options: { path: string; maxAge: number; httpOnly: boolean; sameSite: "lax"; secure: boolean },
  ): unknown;
};

const isProd = () => process.env.NODE_ENV === "production";

export function setSessionMarker(res: { cookies: CookieSink }): void {
  res.cookies.set(SESSION_MARKER_COOKIE, "1", {
    path: "/",
    maxAge: SESSION_MARKER_MAX_AGE_SEC,
    httpOnly: false,
    sameSite: "lax",
    secure: isProd(),
  });
}

export function clearSessionMarker(res: { cookies: CookieSink }): void {
  res.cookies.set(SESSION_MARKER_COOKIE, "", {
    path: "/",
    maxAge: 0,
    httpOnly: false,
    sameSite: "lax",
    secure: isProd(),
  });
}

/** Browser only: true when the marker cookie is present. */
export function hasSessionMarker(): boolean {
  if (typeof document === "undefined") return false;
  return document.cookie
    .split(";")
    .some((part) => part.trim().startsWith(`${SESSION_MARKER_COOKIE}=1`));
}
