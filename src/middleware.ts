import { authConfig } from "@/auth.config";
import {
  ADMIN_ACTIVITY_COOKIE,
  adminActivityCookieOptions,
  isAdminActivityPath,
  isAdminIdleExpired,
  signAdminActivity,
} from "@/lib/admin-session-policy";
import {
  getCanonicalRedirectTarget,
  isVercelDeploymentHost,
} from "@/lib/canonical-host";
import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const { auth } = NextAuth(authConfig);

function requestHostname(request: NextRequest): string {
  return request.headers.get("x-forwarded-host") ?? request.headers.get("host") ?? "";
}

function canonicalRedirect(request: NextRequest): NextResponse | null {
  const hostHeader = request.headers.get("host") ?? "";
  const protoHeader = request.headers.get("x-forwarded-proto") ?? "https";
  const protocol = protoHeader === "http" ? "http:" : "https:";

  const target = getCanonicalRedirectTarget({
    hostname: hostHeader,
    protocol,
  });
  if (!target) return null;

  const url = request.nextUrl.clone();
  url.hostname = target.hostname;
  url.protocol = target.protocol;
  return NextResponse.redirect(url, 308);
}

/** Mark *.vercel.app responses as non-indexable without breaking previews. */
function withVercelNoIndex(request: NextRequest, response: NextResponse): NextResponse {
  if (isVercelDeploymentHost(requestHostname(request))) {
    response.headers.set("X-Robots-Tag", "noindex, nofollow");
  }
  return response;
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
  const redirect = canonicalRedirect(request);
  if (redirect) return withVercelNoIndex(request, redirect);
  const blocked = crossSiteAdminWrite(request);
  if (blocked) return withVercelNoIndex(request, blocked);
  const idle = await adminIdle(request as AuthedRequest);
  if (idle && "expired" in idle) return withVercelNoIndex(request, idle.expired);
  const res = NextResponse.next();
  if (idle) {
    const c = adminActivityCookieOptions(idle.activity);
    res.cookies.set(c.name, c.value, c);
  }
  return withVercelNoIndex(request, res);
});

export const config = {
  matcher: [
    /*
     * Run canonical host checks on pages; skip static assets.
     * Auth still applies via authorized() for /admin routes.
     */
    "/((?!_next/static|_next/image|.*\\.(?:ico|png|jpg|jpeg|gif|webp|svg|woff2?|css|js|map)$).*)",
  ],
};
