import { auth } from "@/auth";
import { isSuperAdmin } from "@/lib/admin-roles";
import Link from "next/link";
import { getTrafficSummary } from "@/lib/analytics";
import { prisma } from "@/lib/prisma";
import { TrafficStats } from "@/components/admin/TrafficStats";
import { signOut } from "@/auth";

export default async function AdminDashboardPage() {
  const session = await auth();
  const superAdmin = isSuperAdmin(session);
  const [cardCount, traffic] = await Promise.all([
    prisma.liturgyCard.count(),
    getTrafficSummary(),
  ]);

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[var(--color-ink)]">Operator dashboard</h1>
          <p className="mt-2 text-[var(--color-muted)]">Signed in as {session?.user?.email}</p>
        </div>
        <form
          action={async () => {
            "use server";
            await signOut({ redirectTo: "/admin/login" });
          }}
        >
          <button
            type="submit"
            className="border border-[var(--color-border)] px-4 py-2 text-sm font-semibold hover:bg-white"
          >
            Sign out
          </button>
        </form>
      </div>

      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div className="border border-[var(--color-border)] bg-white p-6">
          <p className="text-3xl font-bold">{cardCount}</p>
          <p className="mt-1 text-sm text-[var(--color-muted)]">Liturgy cards</p>
          <Link href="/admin/liturgy-cards" className="mt-4 inline-block text-sm font-semibold text-[var(--color-link)]">
            Manage →
          </Link>
        </div>
        {superAdmin && (
          <div className="border border-[var(--color-border)] bg-white p-6 sm:col-span-3">
            <h2 className="font-bold text-[var(--color-ink)]">Operator accounts</h2>
            <p className="mt-1 text-sm text-[var(--color-muted)]">
              Invite co-teachers or editors (free on Neon + Vercel).
            </p>
            <Link
              href="/admin/operators"
              className="mt-4 inline-block text-sm font-semibold text-[var(--color-link)]"
            >
              Manage operators →
            </Link>
          </div>
        )}
      </div>

      <TrafficStats stats={traffic} />

      <section className="mt-12 border border-[var(--color-border)] bg-white p-6">
        <h2 className="font-bold text-[var(--color-ink)]">What you can manage</h2>
        <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-[var(--color-muted)]">
          <li>
            <strong className="text-[var(--color-ink)]">Liturgy cards</strong> — image, link, and
            title for Mass, the sacraments, saints, devotions, and each season
          </li>
          <li>
            <strong className="text-[var(--color-ink)]">Daily Mass</strong> — automatic from
            Evangelizo (not edited here)
          </li>
        </ul>
      </section>
    </div>
  );
}
