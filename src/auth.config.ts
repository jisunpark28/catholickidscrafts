import type { NextAuthConfig } from "next-auth";
import { ADMIN_SESSION_MAX_AGE_SEC, isAdminLoginExpired, nowSec } from "@/lib/admin-session-policy";

/**
 * Edge-safe Auth.js config (used by middleware).
 * Do not import Prisma, bcrypt, or Node-only modules here.
 */
export const authConfig = {
  secret: process.env.AUTH_SECRET?.trim(),
  trustHost: true,
  pages: {
    signIn: "/admin/login",
  },
  // Admin sessions: at most 8 hours after the password sign-in, never extended (loginAt check
  // in the jwt callback). The 30-minute idle timeout is enforced by middleware + lib/admin-auth.
  session: { strategy: "jwt", maxAge: ADMIN_SESSION_MAX_AGE_SEC },
  providers: [],
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const pathname = nextUrl.pathname;
      if (pathname === "/admin/login") return true;
      // Edge pre-check only; every admin page/API also calls the DB-backed helper in lib/admin-auth.
      const role = (auth?.user as { role?: string } | undefined)?.role;
      const hasAdminRole = role === "SUPER_ADMIN" || role === "OPERATOR";
      if (pathname.startsWith("/api/admin")) {
        if (hasAdminRole) return true;
        return Response.json({ error: "Unauthorized" }, { status: 401 });
      }
      if (pathname.startsWith("/admin")) {
        return hasAdminRole;
      }
      return true;
    },
    jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
        token.id = user.id;
        token.email = user.email ?? undefined;
        token.role = user.role;
        token.loginAt = nowSec();
        return token;
      }
      // No sliding past 8 hours: Auth.js re-signs the cookie on every read, so the limit is
      // checked against the original sign-in. Tokens without loginAt (older sessions) end too.
      // Returning null clears the session cookie.
      if (isAdminLoginExpired(token.loginAt)) return null;
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.email = token.email as string;
        session.user.role = token.role as typeof session.user.role;
      }
      session.loginAt = typeof token.loginAt === "number" ? token.loginAt : undefined;
      return session;
    },
  },
} satisfies NextAuthConfig;
