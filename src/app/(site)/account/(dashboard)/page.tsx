import { FamilyLogoutButton } from "@/components/FamilyLogoutButton";
import { LessonAssignmentsPanel } from "@/components/lesson/LessonAssignmentsPanel";
import { SubProfilesManager } from "@/components/SubProfilesManager";
import { PageShell } from "@/components/PageShell";
import { MAX_SUB_PROFILES_PER_FAMILY } from "@/lib/access-code";
import { loadAccountDashboardReaders } from "@/lib/account-dashboard";
import { LESSON_KIT_PRODUCT_NAME_PLURAL } from "@/lib/lesson-kit/branding";
import { requireFamilySession } from "@/lib/family-auth";
import { canonicalForPath } from "@/lib/site-metadata";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Teacher dashboard",
  description: "Manage student Access IDs, assign at-home lesson kits, and track Bible progress.",
  ...canonicalForPath("/account"),
};

export default async function AccountDashboardPage() {
  const session = await requireFamilySession();
  const { owner, subs } = await loadAccountDashboardReaders(session!.familyAccountId);

  return (
    <PageShell wide>
      <Link href="/" className="text-sm font-semibold text-[var(--color-link)]">
        ← Home
      </Link>
      <div className="mt-6 flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <h1 className="text-3xl text-[var(--color-ink)]">Teacher dashboard</h1>
          <p className="mt-2 break-all text-sm text-[var(--color-muted)]">{session!.email}</p>
          <p className="mt-3 text-sm">
            <Link href="/program" className="font-semibold text-[var(--color-link)]">
              {LESSON_KIT_PRODUCT_NAME_PLURAL}
            </Link>
            <span className="text-[var(--color-muted)]"> — build and run class lessons</span>
          </p>
        </div>
        <FamilyLogoutButton />
      </div>

      <SubProfilesManager
        initialOwner={owner}
        initialSubs={subs}
        maxSubs={MAX_SUB_PROFILES_PER_FAMILY}
      />

      <LessonAssignmentsPanel
        subs={subs.map((s) => ({ id: s.id!, displayName: s.displayName }))}
      />
    </PageShell>
  );
}
