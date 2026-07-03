import { ParishJoinForm } from "@/components/lesson/ParishJoinForm";
import { PageHeader } from "@/components/PageHeader";
import { PageShell } from "@/components/PageShell";
import { requireFamilySession } from "@/lib/family-auth";
import { canonicalForPath } from "@/lib/site-metadata";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Join parish",
  ...canonicalForPath("/program/join"),
};

export default async function ProgramJoinPage() {
  const session = await requireFamilySession();
  if (!session) redirect("/account/login?next=/program/join");

  return (
    <PageShell>
      <Link href="/program" className="text-sm font-semibold text-[var(--color-link)]">
        ← Class lessons
      </Link>
      <div className="mt-6">
        <PageHeader title="Join parish" subtitle="Enter the code from your DRE." />
        <ParishJoinForm />
      </div>
    </PageShell>
  );
}
