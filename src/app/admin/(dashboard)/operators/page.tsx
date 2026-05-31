import { OperatorManager } from "@/components/admin/OperatorManager";
import { auth } from "@/auth";
import { isSuperAdmin } from "@/lib/admin-roles";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function OperatorsPage() {
  const session = await auth();
  if (!isSuperAdmin(session)) redirect("/admin");

  const users = await prisma.adminUser.findMany({
    orderBy: { createdAt: "asc" },
    select: { id: true, email: true, name: true, role: true, createdAt: true },
  });

  return (
    <div>
      <Link href="/admin" className="text-sm font-semibold text-[var(--color-link)]">
        ← Dashboard
      </Link>
      <h1 className="mt-4 text-2xl font-bold">Operator accounts</h1>
      <p className="mt-2 text-sm text-[var(--color-muted)]">
        Free on Neon + Vercel: invite teachers or co-admins. Only super admins see this page.
      </p>
      <div className="mt-8">
        <OperatorManager
          initial={users.map((u) => ({
            ...u,
            role: u.role.toString(),
            createdAt: u.createdAt.toISOString(),
          }))}
        />
      </div>
    </div>
  );
}
