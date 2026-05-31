import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function AdminCurriculumPage() {
  const items = await prisma.curriculumTrack.findMany({ orderBy: { sortOrder: "asc" } });

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">Curriculum tracks</h1>
        <Link
          href="/admin/curriculum/new"
          className="bg-[var(--color-accent)] px-4 py-2 text-sm font-bold text-white"
        >
          + New track
        </Link>
      </div>

      <table className="mt-8 w-full border-collapse border border-[var(--color-border)] bg-white text-sm">
        <thead className="bg-[var(--color-surface)] text-left">
          <tr>
            <th className="border-b p-3">Title</th>
            <th className="border-b p-3">Stage</th>
            <th className="border-b p-3">Lessons</th>
            <th className="border-b p-3">Status</th>
            <th className="border-b p-3" />
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id}>
              <td className="border-b p-3 font-medium">{item.title}</td>
              <td className="border-b p-3 text-[var(--color-muted)]">{item.stage}</td>
              <td className="border-b p-3">{item.lessonCount}</td>
              <td className="border-b p-3">{item.published ? "Published" : "Draft"}</td>
              <td className="border-b p-3 text-right">
                <Link
                  href={`/admin/curriculum/${item.id}/edit`}
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
