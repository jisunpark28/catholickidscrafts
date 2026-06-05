import { SiteCopyManager } from "@/components/admin/SiteCopyManager";
import { mergeSiteCopyForAdmin } from "@/lib/site-copy-admin";
import { prisma } from "@/lib/prisma";

export default async function AdminSiteCopyPage() {
  const dbRows = await prisma.siteCopy.findMany({
    orderBy: [{ group: "asc" }, { key: "asc" }],
  });
  const items = mergeSiteCopyForAdmin(dbRows);

  return (
    <div>
      <h1 className="text-2xl font-bold">Site &amp; game text</h1>
      <p className="mt-2 text-sm text-[var(--color-muted)]">
        {items.length} editable strings across pages and games.
      </p>
      <div className="mt-6">
        <SiteCopyManager initialItems={items} />
      </div>
    </div>
  );
}
