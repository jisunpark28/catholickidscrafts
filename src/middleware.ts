import { authConfig } from "@/auth.config";
import NextAuth from "next-auth";

/**
 * Use the same Auth.js config as sign-in (no Prisma here).
 * getToken() alone can miss v5 session cookies and bounce users back to login.
 */
export default NextAuth(authConfig).auth;

export const config = {
  matcher: ["/admin/:path*"],
};
