import { auth } from "@/auth";
import { isSuperAdmin } from "@/lib/admin-roles";
import { isFamilyChildMode } from "@/lib/family-auth";
import { prisma } from "@/lib/prisma";
import type { AdminRole } from "@prisma/client";
import { NextResponse } from "next/server";
import { redirect } from "next/navigation";
import type { Session } from "next-auth";

export type AdminIdentity = { id: string; email: string; role: AdminRole };

/**
 * The single admin check (deny by default). A session only counts when its user id
 * still matches an AdminUser row with the same email; the role always comes from the
 * DB, so deleted or demoted operators lose access immediately even with an old JWT.
 */
export async function getAdmin(): Promise<{ session: Session; admin: AdminIdentity } | null> {
  // auth() stays outside try/catch so Next's dynamic-rendering signal is not swallowed.
  const session = await auth();
  try {
    const id = session?.user?.id;
    const email = session?.user?.email?.trim().toLowerCase();
    if (!session?.user || !id || !email) return null;
    // A browser handed to a child (family cookie in child mode) never has admin access.
    if (await isFamilyChildMode()) return null;
    const admin = await prisma.adminUser.findUnique({
      where: { id },
      select: { id: true, email: true, role: true },
    });
    if (!admin || admin.email.trim().toLowerCase() !== email) return null;
    session.user.role = admin.role;
    return { session, admin };
  } catch (e) {
    console.error("admin check failed", e);
    return null;
  }
}

export async function isAdmin(): Promise<boolean> {
  return (await getAdmin()) !== null;
}

/** For admin pages and layouts: redirects non-admins to the admin login. */
export async function requireAdminPage(): Promise<{ session: Session; admin: AdminIdentity }> {
  const result = await getAdmin();
  if (!result) redirect("/admin/login");
  return result;
}

/** For admin APIs: 401 when not signed in, 403 when signed in but not an admin. */
export async function requireAdminSession(): Promise<{
  session: Session | null;
  error: NextResponse | null;
}> {
  const result = await getAdmin();
  if (result) return { session: result.session, error: null };
  const session = await auth().catch(() => null);
  return session?.user
    ? { session: null, error: NextResponse.json({ error: "Forbidden" }, { status: 403 }) }
    : { session: null, error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
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
