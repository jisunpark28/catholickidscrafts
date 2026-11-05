import { ADMIN_ACTIVITY_COOKIE } from "@/lib/admin-session-policy";
import { DEVICE_UNLOCK_COOKIE, DEVICE_UNLOCK_PATH } from "@/lib/device-unlock";
import { DEVICE_LOCK_COOKIE, FAMILY_SESSION_COOKIE, READER_SESSION_COOKIE } from "@/lib/family-session";
import { GOOGLE_OAUTH_NONCE_COOKIE, GOOGLE_OAUTH_NONCE_PATH } from "@/lib/google-oauth";

/**
 * Full sign-out: every logout (parent, child/reader, "back to parent", all devices, admin)
 * ends the session and resets the device, including the child-mode lock. Removing cookies
 * never grants access, so this is safe to run for anyone. Kept free of DB and next/headers
 * imports so it can be unit tested.
 *
 * A browser only deletes a cookie when name + path (+ domain) match how it was set, and
 * __Secure-/__Host- names must be cleared with Secure. All our cookies are host-only
 * (no Domain), and the apex domain always 308s to www before any cookie is set.
 */

export type ResetSameSite = "lax" | "strict";

export type ResetCookieSpec = {
  name: string;
  path: string;
  sameSite: ResetSameSite;
  httpOnly: boolean;
  secure: boolean;
};

export type ResetCookieWrite = {
  path: string;
  maxAge: 0;
  expires: Date;
  httpOnly: boolean;
  secure: boolean;
  sameSite: ResetSameSite;
};

/** NextResponse.cookies and the server-action cookies() store both fit this. */
export interface ResetCookieSink {
  set(name: string, value: string, options: ResetCookieWrite): unknown;
}

const isProd = () => process.env.NODE_ENV === "production";

/** Our cookies with the exact path / flags they are set with. */
function knownCkcCookies(): ResetCookieSpec[] {
  const secure = isProd();
  const root = (name: string): ResetCookieSpec => ({ name, path: "/", sameSite: "lax", httpOnly: true, secure });
  return [
    root(FAMILY_SESSION_COOKIE),
    root(READER_SESSION_COOKIE),
    root(DEVICE_LOCK_COOKIE),
    root(ADMIN_ACTIVITY_COOKIE),
    // Guest Bible progress id (lib/bible/reader) and the analytics visitor id.
    root("ckc_bible_reader"),
    root("ckc_vid"),
    { name: DEVICE_UNLOCK_COOKIE, path: DEVICE_UNLOCK_PATH, sameSite: "strict", httpOnly: true, secure },
    { name: GOOGLE_OAUTH_NONCE_COOKIE, path: GOOGLE_OAUTH_NONCE_PATH, sameSite: "lax", httpOnly: true, secure },
    // Set from the browser (MbToolbar): path=/, not HttpOnly, not Secure.
    { name: "ckc_mb_child", path: "/", sameSite: "lax", httpOnly: false, secure: false },
  ];
}

/** Auth.js / next-auth cookies (admin), plain, __Secure- and __Host- forms, incl. chunks ".0", ".1". */
export const AUTH_COOKIE_RE =
  /^(__Secure-|__Host-)?(authjs|next-auth)\.(session-token|callback-url|csrf-token|pkce\.code_verifier|state|nonce|challenge)(\.\d+)?$/;

const AUTH_BASE_NAMES = [
  "session-token",
  "callback-url",
  "csrf-token",
  "pkce.code_verifier",
  "state",
  "nonce",
  "challenge",
];

function authSpec(name: string): ResetCookieSpec {
  const prefixed = name.startsWith("__Secure-") || name.startsWith("__Host-");
  return { name, path: "/", sameSite: "lax", httpOnly: true, secure: prefixed || isProd() };
}

function defaultAuthNames(): string[] {
  const out: string[] = [];
  for (const brand of ["authjs", "next-auth"]) {
    for (const base of AUTH_BASE_NAMES) {
      const name = `${brand}.${base}`;
      out.push(name, `__Secure-${name}`);
      if (base === "csrf-token") out.push(`__Host-${name}`);
    }
  }
  return out;
}

/**
 * Every cookie a logout clears: our known ckc_* cookies (exact paths), the Auth.js cookies,
 * and any other ckc_* / Auth.js cookie the browser sent (e.g. session-token chunks).
 */
export function sessionResetCookieSpecs(presentNames: Iterable<string> = []): ResetCookieSpec[] {
  const specs = new Map<string, ResetCookieSpec>();
  const add = (s: ResetCookieSpec) => {
    if (!specs.has(s.name)) specs.set(s.name, s);
  };
  for (const s of knownCkcCookies()) add(s);
  for (const n of defaultAuthNames()) add(authSpec(n));
  for (const name of presentNames) {
    if (AUTH_COOKIE_RE.test(name)) add(authSpec(name));
    else if (name.startsWith("ckc_")) add({ name, path: "/", sameSite: "lax", httpOnly: true, secure: isProd() });
  }
  return [...specs.values()];
}

/** Write an expired, empty copy of every session cookie. */
export function applySessionReset(sink: ResetCookieSink, presentNames: Iterable<string> = []): void {
  for (const s of sessionResetCookieSpecs(presentNames)) {
    sink.set(s.name, "", {
      path: s.path,
      maxAge: 0,
      expires: new Date(0),
      httpOnly: s.httpOnly,
      secure: s.secure,
      sameSite: s.sameSite,
    });
  }
}

/** Belt and braces for browsers that support it: also drops cookies on any other path. */
export const CLEAR_SITE_DATA_HEADER = "Clear-Site-Data";
export const CLEAR_SITE_DATA_COOKIES = '"cookies"';

/** Logout API response: clear every session cookie and tell the browser to drop this site's cookies. */
export function resetSessionOnResponse(
  res: { cookies: ResetCookieSink; headers: Headers },
  presentNames: Iterable<string> = [],
): void {
  applySessionReset(res.cookies, presentNames);
  res.headers.set(CLEAR_SITE_DATA_HEADER, CLEAR_SITE_DATA_COOKIES);
  res.headers.set("Cache-Control", "private, no-store");
}
