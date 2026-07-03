import { ParishCreateForm } from "@/components/lesson/ParishCreateForm";
import { PageHeader } from "@/components/PageHeader";
import { PageShell } from "@/components/PageShell";
import { getParishMembership } from "@/lib/lesson-kit/db";
import { requireFamilySession } from "@/lib/family-auth";
import { canonicalForPath } from "@/lib/site-metadata";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Create parish",
  ...canonicalForPath("/program/parish/setup"),
};

export default async function ParishSetupPage() {
  const session = await requireFamilySession();
  if (!session) redirect("/account/login?next=/program/parish/setup");

  const membership = await getParishMembership(session.familyAccountId);
  if (membership) redirect("/program/parish");

  return (
    <PageShell>
      <Link href="/program" className="text-sm font-semibold text-[var(--color-link)]">
        ← Class lessons
      </Link>
      <div className="mt-6">
        <PageHeader
          title="Create parish workspace"
          subtitle="For DREs and coordinators. You'll get an invite code for catechists."
        />
        <ParishCreateForm />
      </div>
    </PageShell>
  );
}
