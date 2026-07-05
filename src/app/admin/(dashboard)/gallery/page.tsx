import { GalleryModerationPanel } from "@/components/admin/GalleryModerationPanel";
import {
  listPendingGallerySubmissions,
  listRecentModeratedGallerySubmissions,
} from "@/lib/craft-gallery";

export default async function AdminGalleryPage() {
  const [pending, recent] = await Promise.all([
    listPendingGallerySubmissions(),
    listRecentModeratedGallerySubmissions(),
  ]);

  return (
    <div>
      <h1 className="text-2xl font-bold text-[var(--color-ink)]">Craft gallery</h1>
      <p className="mt-2 max-w-2xl text-sm text-[var(--color-muted)]">
        Review family craft photos before they appear on the public gallery. Approve only
        submissions that are safe, on-topic, and appropriate for children.
      </p>

      <h2 className="mt-10 text-lg font-bold text-[var(--color-ink)]">
        Pending ({pending.length})
      </h2>
      <GalleryModerationPanel pending={pending} />

      {recent.length > 0 ? (
        <section className="mt-12">
          <h2 className="text-lg font-bold text-[var(--color-ink)]">Recently moderated</h2>
          <ul className="mt-4 space-y-2 text-sm text-[var(--color-muted)]">
            {recent.map((row) => (
              <li key={row.id} className="rounded-lg bg-white px-4 py-3 shadow-sm">
                <span className="font-semibold text-[var(--color-ink)]">{row.authorName}</span>
                {" — "}
                {row.isApproved ? (
                  <span className="text-emerald-700">Approved</span>
                ) : (
                  <span>Rejected</span>
                )}
                {row.resourceTitle ? ` · ${row.resourceTitle}` : ""}
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
