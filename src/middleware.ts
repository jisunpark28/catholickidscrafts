import { authConfig } from "@/auth.config";
import { getCanonicalRedirectTarget } from "@/lib/canonical-host";
import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const { auth } = NextAuth(authConfig);

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

export default auth((request) => {
  const redirect = canonicalRedirect(request);
  if (redirect) return redirect;
  return NextResponse.next();
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
