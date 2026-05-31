import { auth } from "@/auth";
import { isSuperAdmin } from "@/lib/admin-roles";
import { NextResponse } from "next/server";
import type { Session } from "next-auth";

export async function requireAdminSession(): Promise<{
  session: Session | null;
  error: NextResponse | null;
}> {
  const session = await auth();
  if (!session?.user?.email) {
    return { session: null, error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }
  return { session, error: null };
}

export async function requireSuperAdminSession(): Promise<{
  session: Session | null;
  error: NextResponse | null;
}> {
  const { session, error } = await requireAdminSession();
  if (error) return { session: null, error };
  if (!isSuperAdmin(session)) {
    return {
      session: null,
      error: NextResponse.json({ error: "Super admin only" }, { status: 403 }),
    };
  }
  return { session, error: null };
}
