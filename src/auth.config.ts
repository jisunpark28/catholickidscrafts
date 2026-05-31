import type { NextAuthConfig } from "next-auth";

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
  session: { strategy: "jwt" },
  providers: [],
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const pathname = nextUrl.pathname;
      if (pathname === "/admin/login") return true;
      if (pathname.startsWith("/admin")) {
        return !!auth?.user;
      }
      return true;
    },
    jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
        token.id = user.id;
        token.email = user.email ?? undefined;
        token.role = user.role;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.email = token.email as string;
        session.user.role = token.role as typeof session.user.role;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
