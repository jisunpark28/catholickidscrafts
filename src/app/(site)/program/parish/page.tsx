import { ParishDashboard } from "@/components/lesson/ParishDashboard";
import { PageHeader } from "@/components/PageHeader";
import { PageShell } from "@/components/PageShell";
import { requireFamilySession } from "@/lib/family-auth";
import { canonicalForPath } from "@/lib/site-metadata";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Parish dashboard",
  ...canonicalForPath("/program/parish"),
};

export default async function ProgramParishPage() {
  const session = await requireFamilySession();
  if (!session) redirect("/account/login?next=/program/parish");

  return (
    <PageShell>
      <Link href="/program" className="text-sm font-semibold text-[var(--color-link)]">
        ← Class lessons
      </Link>
      <div className="mt-6">
        <PageHeader title="Parish dashboard" />
        <ParishDashboard />
      </div>
    </PageShell>
  );
}
