import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function AdminChurchDecorationsPage() {
  const items = await prisma.churchDecoration.findMany({
    orderBy: [{ sortOrder: "asc" }, { updatedAt: "desc" }],
  });

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Church decorations (Tiny Priest)</h1>
          <p className="mt-1 text-sm text-[var(--color-muted)]">
            Place decoration images inside the church. Set image, description, 3D position (X/Y/Z), size (width and height), and rotation.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/admin/church-decorations/new"
            className="bg-[var(--color-accent)] px-4 py-2 text-sm font-bold text-white"
          >
            Set up all 14 walls
          </Link>
        </div>
      </div>

      <table className="mt-8 w-full border-collapse border border-[var(--color-border)] bg-white text-sm">
        <thead className="bg-[var(--color-surface)] text-left">
          <tr>
            <th className="border-b border-[var(--color-border)] p-3">Title</th>
            <th className="border-b border-[var(--color-border)] p-3">Position</th>
            <th className="border-b border-[var(--color-border)] p-3">Status</th>
            <th className="border-b border-[var(--color-border)] p-3" />
          </tr>
        </thead>
        <tbody>
          {items.length === 0 ? (
            <tr>
              <td colSpan={4} className="p-6 text-center text-[var(--color-muted)]">
                No decorations yet. Add holy water fonts, liturgy boards, seasonal displays, and more.
              </td>
            </tr>
          ) : (
            items.map((item) => (
              <tr key={item.id}>
                <td className="border-b border-[var(--color-border)] p-3 font-medium">
                  {item.title}
                </td>
                <td className="border-b border-[var(--color-border)] p-3 text-[var(--color-muted)]">
                  x {item.posX}, y {item.posY}, z {item.posZ}
                </td>
                <td className="border-b border-[var(--color-border)] p-3">
                  {item.published ? "Published" : "Draft"}
                </td>
                <td className="border-b border-[var(--color-border)] p-3 text-right">
                  <Link
                    href={`/admin/church-decorations/${item.id}/edit`}
                    className="font-semibold text-[var(--color-link)]"
                  >
                    Edit
                  </Link>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
