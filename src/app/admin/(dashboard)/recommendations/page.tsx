import { kindLabel } from "@/lib/recommendation-types";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function AdminRecommendationsPage() {
  const items = await prisma.recommendation.findMany({
    orderBy: [{ sortOrder: "asc" }, { updatedAt: "desc" }],
  });

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Recommendations</h1>
          <p className="mt-1 text-sm text-[var(--color-muted)]">
            Videos, books, templates, and links for the public Recommendations tab.
          </p>
        </div>
        <Link
          href="/admin/recommendations/new"
          className="bg-[var(--color-accent)] px-4 py-2 text-sm font-bold text-white"
        >
          Add recommendation
        </Link>
      </div>

      <table className="mt-8 w-full border-collapse border border-[var(--color-border)] bg-white text-sm">
        <thead className="bg-[var(--color-surface)] text-left">
          <tr>
            <th className="p-3">Title</th>
            <th className="p-3">Type</th>
            <th className="p-3">Published</th>
            <th className="p-3" />
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id}>
              <td className="border-t border-[var(--color-border)] p-3 font-semibold">
                {item.title}
              </td>
              <td className="border-t border-[var(--color-border)] p-3">
                {kindLabel(item.kind)}
              </td>
              <td className="border-t border-[var(--color-border)] p-3">
                {item.published ? "Yes" : "Draft"}
              </td>
              <td className="border-t border-[var(--color-border)] p-3 text-right">
                <Link
                  href={`/admin/recommendations/${item.id}/edit`}
                  className="font-semibold text-[var(--color-link)]"
                >
                  Edit
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {items.length === 0 && (
        <p className="mt-8 text-sm text-[var(--color-muted)]">No recommendations yet.</p>
      )}
    </div>
  );
}
