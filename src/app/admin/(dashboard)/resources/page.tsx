import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function AdminResourcesPage() {
  const items = await prisma.resource.findMany({ orderBy: { updatedAt: "desc" } });

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">Kids resources</h1>
        <Link
          href="/admin/resources/new"
          className="bg-[var(--color-accent)] px-4 py-2 text-sm font-bold text-white"
        >
          + New resource
        </Link>
      </div>

      <table className="mt-8 w-full border-collapse border border-[var(--color-border)] bg-white text-sm">
        <thead className="bg-[var(--color-surface)] text-left">
          <tr>
            <th className="border-b border-[var(--color-border)] p-3">Title</th>
            <th className="border-b border-[var(--color-border)] p-3">Season</th>
            <th className="border-b border-[var(--color-border)] p-3">Status</th>
            <th className="border-b border-[var(--color-border)] p-3" />
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id}>
              <td className="border-b border-[var(--color-border)] p-3 font-medium">
                {item.title}
              </td>
              <td className="border-b border-[var(--color-border)] p-3 text-[var(--color-muted)]">
                {item.liturgicalPeriod}
              </td>
              <td className="border-b border-[var(--color-border)] p-3">
                {item.published ? "Published" : "Draft"}
              </td>
              <td className="border-b border-[var(--color-border)] p-3 text-right">
                <Link
                  href={`/admin/resources/${item.id}/edit`}
                  className="font-semibold text-[var(--color-link)]"
                >
                  Edit
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
