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
          <h1 className="text-2xl font-bold">성당 소품 (Tiny Priest)</h1>
          <p className="mt-1 text-sm text-[var(--color-muted)]">
            소품(이미지)을 성당 안에 배치합니다. 이미지, 설명, 3D 위치(X/Y/Z), 크기(너비·높이), 회전을 설정할 수 있습니다.
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
                아직 소품이 없습니다. 성수반, 전례 안내판, 계절 장식 등을 추가해 보세요.
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
