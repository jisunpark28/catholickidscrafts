import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Edge middleware: only JWT check (no @/auth, Prisma, or NextAuth() wrapper).
 * Admin APIs use requireAdminSession() on the Node.js runtime.
 */
export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (pathname === "/admin/login") {
    return NextResponse.next();
  }

  if (!pathname.startsWith("/admin")) {
    return NextResponse.next();
  }

  const secret = process.env.AUTH_SECRET;
  if (!secret) {
    console.error("AUTH_SECRET is not set");
    const login = new URL("/admin/login", req.nextUrl.origin);
    login.searchParams.set("error", "Configuration");
    return NextResponse.redirect(login);
  }

  const token = await getToken({ req, secret });

  if (!token) {
    const login = new URL("/admin/login", req.nextUrl.origin);
    login.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(login);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
