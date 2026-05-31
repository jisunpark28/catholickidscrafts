import { authConfig } from "@/auth.config";
import NextAuth from "next-auth";

/**
 * Edge middleware must not import @/auth (Prisma/bcrypt live there).
 * Admin API routes use requireAdminSession() on the Node.js runtime instead.
 */
export default NextAuth(authConfig).auth;

export const config = {
  matcher: ["/admin/:path*"],
};
