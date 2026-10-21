import { requireAdminPage } from "@/lib/admin-auth";
import { FamilyTalkNotice } from "@/components/admin/FamilyTalkNotice";
import { familyTalkCoverage } from "@/lib/daily-mass/family-talk-coverage";

export const dynamic = "force-dynamic";

export default async function AdminNoticesPage() {
  await requireAdminPage();
  const coverage = familyTalkCoverage();
  return (
    <div>
      <h1 className="text-3xl font-bold text-[var(--color-ink)]">Admin notices</h1>
      <p className="mt-2 text-[var(--color-muted)]">Things that need attention before they affect the site.</p>
      <div className="mt-8 space-y-6">
        <FamilyTalkNotice coverage={coverage} />
      </div>
    </div>
  );
}
