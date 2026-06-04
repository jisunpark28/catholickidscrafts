import Link from "next/link";
import { prisma } from "@/lib/prisma";

const LAYOUT_LABEL: Record<string, string> = {
  SINGLE: "Single",
  STRIP: "4-cut",
  BOTH: "Both",
};

export default async function AdminPhotoBoothFramesPage() {
  const items = await prisma.photoBoothFrame.findMany({
    orderBy: [{ sortOrder: "asc" }, { title: "asc" }],
  });

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Photo booth frames</h1>
          <p className="mt-1 text-sm text-[var(--color-muted)]">
            PNG overlays for /play/photo-booth (drawn in front of photos).
          </p>
        </div>
        <Link
          href="/admin/photo-booth-frames/new"
          className="bg-[var(--color-accent)] px-4 py-2 text-sm font-bold text-white"
        >
          + New frame
        </Link>
      </div>

      <table className="mt-8 w-full border-collapse border border-[var(--color-border)] bg-white text-sm">
        <thead className="bg-[var(--color-surface)] text-left">
          <tr>
            <th className="border-b border-[var(--color-border)] p-3">Preview</th>
            <th className="border-b border-[var(--color-border)] p-3">Title</th>
            <th className="border-b border-[var(--color-border)] p-3">Layout</th>
            <th className="border-b border-[var(--color-border)] p-3">Status</th>
            <th className="border-b border-[var(--color-border)] p-3" />
          </tr>
        </thead>
        <tbody>
          {items.length === 0 ? (
            <tr>
              <td colSpan={5} className="p-6 text-center text-[var(--color-muted)]">
                No frames yet. Upload a transparent PNG (360×480 recommended).
              </td>
            </tr>
          ) : (
            items.map((item) => (
              <tr key={item.id}>
                <td className="border-b border-[var(--color-border)] p-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.imageUrl}
                    alt=""
                    className="h-14 w-10 border border-[var(--color-border)] bg-[var(--color-surface)] object-contain"
                  />
                </td>
                <td className="border-b border-[var(--color-border)] p-3 font-medium">{item.title}</td>
                <td className="border-b border-[var(--color-border)] p-3 text-[var(--color-muted)]">
                  {LAYOUT_LABEL[item.layout] ?? item.layout}
                </td>
                <td className="border-b border-[var(--color-border)] p-3">
                  {item.published ? "Published" : "Draft"}
                </td>
                <td className="border-b border-[var(--color-border)] p-3 text-right">
                  <Link
                    href={`/admin/photo-booth-frames/${item.id}/edit`}
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
