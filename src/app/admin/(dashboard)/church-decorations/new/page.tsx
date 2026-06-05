import { ChurchWallBulkSetup } from "@/components/admin/ChurchWallBulkSetup";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function NewChurchDecorationPage() {
  const items = await prisma.churchDecoration.findMany({
    where: { sortOrder: { gte: 0, lte: 13 } },
    orderBy: { sortOrder: "asc" },
  });

  return (
    <div>
      <Link
        href="/admin/church-decorations"
        className="text-sm font-semibold text-[var(--color-link)]"
      >
        ← Church decorations
      </Link>
      <h1 className="mt-4 text-2xl font-bold">Set up church wall pictures (14 slots)</h1>
      <p className="mt-2 text-sm text-[var(--color-muted)]">
        Upload all wall images at once instead of adding them one by one.
      </p>
      <div className="mt-6">
        <ChurchWallBulkSetup initialItems={items} />
      </div>
    </div>
  );
}
