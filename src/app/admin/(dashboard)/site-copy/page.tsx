import { SiteCopyManager } from "@/components/admin/SiteCopyManager";
import { requireAdminPage } from "@/lib/admin-auth";
import { listSiteCopyForAdmin, type AdminSiteCopyRow } from "@/lib/site-copy-admin-data";
import { SITE_COPY_GROUPS } from "@/lib/site-copy-types";

export const dynamic = "force-dynamic";

export default async function AdminSiteCopyPage() {
  await requireAdminPage();

  let rows: AdminSiteCopyRow[] = [];
  let loadError = "";
  try {
    rows = await listSiteCopyForAdmin();
  } catch (e) {
    console.error("site-copy admin:", e);
    loadError = "Could not load site copy from the database.";
  }

  const groupLabels: Record<string, string> = {};
  for (const g of SITE_COPY_GROUPS) groupLabels[g.id] = g.label;

  return (
    <div>
      <h1 className="text-2xl font-bold">Site copy</h1>
      <p className="mt-2 text-sm text-[var(--color-muted)]">
        Text shown across the public site. A saved value overrides the built-in default; Reset
        removes the override so the default from the code is used again. Changes appear on the
        site within about 30 seconds.
      </p>
      {loadError && (
        <p className="mt-4 border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {loadError}
        </p>
      )}
      <div className="mt-6">
        <SiteCopyManager initialRows={rows} groupLabels={groupLabels} />
      </div>
    </div>
  );
}
