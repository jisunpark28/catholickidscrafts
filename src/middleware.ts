import { authConfig } from "@/auth.config";
import {
  ADMIN_ACTIVITY_COOKIE,
  adminActivityCookieOptions,
  isAdminActivityPath,
  isAdminIdleExpired,
  signAdminActivity,
} from "@/lib/admin-session-policy";
import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const { auth } = NextAuth(authConfig);

function requestHostname(request: NextRequest): string {
  return request.headers.get("x-forwarded-host") ?? request.headers.get("host") ?? "";
}

const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

/** Block cross-site writes to admin APIs (defense in depth on top of SameSite cookies). */
function crossSiteAdminWrite(request: NextRequest): NextResponse | null {
  if (!request.nextUrl.pathname.startsWith("/api/admin") || SAFE_METHODS.has(request.method)) return null;
  const origin = request.headers.get("origin");
  const host = requestHostname(request);
  if (!origin) return null;
  try {
    if (new URL(origin).host === host) return null;
  } catch {
    /* fall through */
  }
  return NextResponse.json({ error: "Cross-site request blocked" }, { status: 403 });
}

type AuthedRequest = NextRequest & { auth?: { user?: { id?: string } | null; loginAt?: number } | null };

/**
 * Admin idle timeout (30 min): every /admin and /api/admin request by a signed-in admin
 * renews the signed ckc_admin_activity cookie; once it lapses the session is dead for good
 * (lib/admin-auth applies the same check), and the admin has to sign in again.
 */
async function adminIdle(
  request: AuthedRequest,
): Promise<{ expired: NextResponse } | { activity: string } | null> {
  const pathname = request.nextUrl.pathname;
  if (!isAdminActivityPath(pathname)) return null;
  const adminId = request.auth?.user?.id;
  const loginAt = request.auth?.loginAt;
  // Not signed in: authorized() in auth.config already sent the request to the login page / 401.
  if (!adminId || typeof loginAt !== "number") return null;
  const ref = { adminId, loginAt };
  const token = request.cookies.get(ADMIN_ACTIVITY_COOKIE)?.value;
  if (await isAdminIdleExpired({ token, ref })) {
    const res = pathname.startsWith("/api/admin")
      ? NextResponse.json({ error: "Session expired. Sign in again." }, { status: 401 })
      : NextResponse.redirect(new URL("/admin/login?error=SessionExpired", request.nextUrl));
    const c = adminActivityCookieOptions("", 0);
    res.cookies.set(c.name, "", c);
    return { expired: res };
  }
  return { activity: await signAdminActivity(ref) };
}

export default auth(async (request) => {
  const blocked = crossSiteAdminWrite(request);
  if (blocked) return blocked;
  const idle = await adminIdle(request as AuthedRequest);
  if (idle && "expired" in idle) return idle.expired;
  const res = NextResponse.next();
  if (idle) {
    const c = adminActivityCookieOptions(idle.activity);
    res.cookies.set(c.name, c.value, c);
  }
  return res;
});

export const config = {
  /*
   * Admin only (CPU): auth pre-check via authorized(), cross-site write block, 30-min idle cookie.
   * Every admin page/API also re-checks server-side (lib/admin-auth).
   * apex -> www is in vercel.json `redirects`; HTTP -> HTTPS is Vercel's default;
   * *.vercel.app X-Robots-Tag noindex is in next.config.ts `headers()`.
   * `/admin/:path*` also matches `/admin` itself.
   */
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
