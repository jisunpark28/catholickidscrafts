import { authConfig } from "@/auth.config";
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

export default auth((request) => {
  const redirect = canonicalRedirect(request);
  if (redirect) return withVercelNoIndex(request, redirect);
  const blocked = crossSiteAdminWrite(request);
  if (blocked) return withVercelNoIndex(request, blocked);
  return withVercelNoIndex(request, NextResponse.next());
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
