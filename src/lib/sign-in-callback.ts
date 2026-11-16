/**
 * Sign-in return path ("callbackUrl"): where the family sign-in page sends a parent afterwards.
 * Only same-site relative paths are kept (no other hosts, no protocol-relative "//", no
 * backslashes or control characters, no API routes, no sign-in pages), so it can never become
 * an open redirect. Pure (no server or browser APIs): used by the login page, the Google OAuth
 * routes, print pages and the client Print/Download buttons.
 */
export const SIGN_IN_PATH = "/account/login";
export const CALLBACK_PARAM = "callbackUrl";
const MAX_CALLBACK_LENGTH = 1024;
const BASE = "https://callback.invalid";

export function safeCallbackPath(raw: unknown): string | null {
  if (typeof raw !== "string" || raw.length === 0 || raw.length > MAX_CALLBACK_LENGTH) return null;
  if (!raw.startsWith("/") || raw.startsWith("//") || raw.includes("\\")) return null;
  if (/[\u0000-\u001f\u007f]/.test(raw)) return null;
  let url: URL;
  try {
    url = new URL(raw, BASE);
  } catch {
    return null;
  }
  if (url.origin !== BASE) return null;
  const path = url.pathname;
  if (path === "/api" || path.startsWith("/api/")) return null;
  if (path.startsWith(SIGN_IN_PATH) || path.startsWith("/account/signup")) return null;
  return `${path}${url.search}${url.hash}`;
}

/** "/account/login?callbackUrl=…" for a return path (plain sign-in page when it is not safe). */
export function signInPath(callback: string | null | undefined): string {
  const safe = safeCallbackPath(callback);
  return safe ? `${SIGN_IN_PATH}?${CALLBACK_PARAM}=${encodeURIComponent(safe)}` : SIGN_IN_PATH;
}

/** Rebuilds "path?query" from a page's searchParams (repeated keys kept, order kept). */
export function pathWithQuery(path: string, query: Record<string, string | string[] | undefined>): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (Array.isArray(value)) for (const v of value) params.append(key, v);
    else if (typeof value === "string") params.append(key, value);
  }
  const qs = params.toString();
  return qs ? `${path}?${qs}` : path;
}
