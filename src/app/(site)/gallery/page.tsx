import { CraftGalleryGrid } from "@/components/CraftGalleryGrid";
import { CraftGallerySubmitForm } from "@/components/CraftGallerySubmitForm";
import { PageHeader } from "@/components/PageHeader";
import { PageShell } from "@/components/PageShell";
import { listApprovedGallerySubmissions } from "@/lib/craft-gallery";
import { copyText, getSiteCopyMap } from "@/lib/site-copy";
import { canonicalForPath } from "@/lib/site-metadata";
import type { Metadata } from "next";
import Link from "next/link";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Family craft gallery",
  description: "Photos shared by families after trying Catholic Kids Crafts activities.",
  ...canonicalForPath("/gallery"),
};

export default async function GalleryPage() {
  const [items, copy] = await Promise.all([
    listApprovedGallerySubmissions({ limit: 60 }),
    getSiteCopyMap(),
  ]);
  const emptyCopy = copyText(
    copy,
    "gallery.empty",
    "No family craft photos have been shared yet.",
  );

  return (
    <PageShell wide>
      <PageHeader
        title="Family craft gallery"
        subtitle={
          items.length > 0
            ? "Real work from families—shared after operator review."
            : emptyCopy
        }
      />

      {items.length > 0 ? (
        <>
          <div className="mb-12 max-w-xl">
            <CraftGallerySubmitForm />
          </div>
          <h2 className="mb-4 text-xl font-bold text-[var(--color-ink)]">Community gallery</h2>
          <CraftGalleryGrid items={items} />
        </>
      ) : (
        <div className="max-w-xl">
          <p className="text-[var(--color-muted)]">
            When families share crafts from{" "}
            <Link href="/resources" className="font-semibold text-[var(--color-link)]">
              Kids Resources
            </Link>
            , approved photos will show here.
          </p>
          <div className="mt-8">
            <CraftGallerySubmitForm />
          </div>
        </div>
      )}
    </PageShell>
  );
}
