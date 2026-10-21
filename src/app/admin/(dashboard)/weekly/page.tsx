import { prisma } from "@/lib/prisma";
import { formatSunday } from "@/lib/weekly-content";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AdminWeeklyPage() {
  const issues = await prisma.weeklyIssue.findMany({
    orderBy: { sundayDate: "desc" },
    include: { _count: { select: { items: true } } },
  });

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Weekly content</h1>
          <p className="mt-1 max-w-2xl text-sm text-[var(--color-muted)]">
            One issue per Sunday. Published items appear in &ldquo;This week&rdquo; and on the topic
            pages you tag them with. All weekly content is free for everyone.
          </p>
        </div>
        <Link
          href="/admin/weekly/new"
          className="bg-[var(--color-accent)] px-4 py-2 text-sm font-bold text-white"
        >
          New issue
        </Link>
      </div>

      {issues.length === 0 ? (
        <p className="mt-8 text-sm text-[var(--color-muted)]">No issues yet.</p>
      ) : (
        <table className="mt-6 w-full border-collapse border border-[var(--color-border)] bg-white text-sm">
          <thead className="bg-[var(--color-surface)] text-left">
            <tr>
              <th className="p-3">Sunday</th>
              <th className="p-3">Title</th>
              <th className="p-3">Items</th>
              <th className="p-3">Status</th>
              <th className="p-3" />
            </tr>
          </thead>
          <tbody>
            {issues.map((issue) => (
              <tr key={issue.id}>
                <td className="border-t border-[var(--color-border)] p-3">
                  {formatSunday(issue.sundayDate)}
                </td>
                <td className="border-t border-[var(--color-border)] p-3 font-semibold">{issue.title}</td>
                <td className="border-t border-[var(--color-border)] p-3">{issue._count.items}</td>
                <td className="border-t border-[var(--color-border)] p-3">
                  {issue.published ? (
                    <span className="font-semibold text-green-700">Published</span>
                  ) : (
                    <span className="text-[var(--color-muted)]">Draft</span>
                  )}
                </td>
                <td className="border-t border-[var(--color-border)] p-3 text-right">
                  <Link
                    href={`/admin/weekly/${issue.id}`}
                    className="font-semibold text-[var(--color-link)]"
                  >
                    Edit
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}