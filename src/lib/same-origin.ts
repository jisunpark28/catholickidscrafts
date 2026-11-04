import { NextResponse } from "next/server";

/**
 * Defense in depth against cross-site writes (same check as /api/admin/site-copy):
 * when a browser sends an Origin header it must match this host. Requests without an
 * Origin (non-browser clients) still need a valid session cookie to do anything.
 */
export function crossOriginError(request: Request): NextResponse | null {
  const origin = request.headers.get("origin");
  if (!origin) return null;
  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  try {
    if (host && new URL(origin).host === host) return null;
  } catch {
    // fall through
  }
  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}
