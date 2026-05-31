import { AdminRole } from "@prisma/client";
import type { Session } from "next-auth";

export function isSuperAdmin(session: Session | null): boolean {
  return session?.user?.role === AdminRole.SUPER_ADMIN;
}
