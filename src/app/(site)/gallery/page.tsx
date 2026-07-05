import { CraftGalleryGrid } from "@/components/CraftGalleryGrid";
import { CraftGallerySubmitForm } from "@/components/CraftGallerySubmitForm";
import { PageHeader } from "@/components/PageHeader";
import { PageShell } from "@/components/PageShell";
import { listApprovedGallerySubmissions } from "@/lib/craft-gallery";
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
  const items = await listApprovedGallerySubmissions({ limit: 60 });

  return (
    <PageShell wide>
      <PageHeader
        title="Family craft gallery"
        subtitle="Real work from families—shared after operator review."
      />

      <div className="mb-12 max-w-xl">
        <CraftGallerySubmitForm />
      </div>

      <h2 className="mb-4 text-xl font-bold text-[var(--color-ink)]">Community gallery</h2>
      <CraftGalleryGrid items={items} />

      <p className="mt-10 text-center text-sm text-[var(--color-muted)]">
        Finished a craft from{" "}
        <Link href="/resources" className="font-semibold text-[var(--color-link)]">
          Kids Resources
        </Link>
        ? You can also share from the resource page after you make it.
      </p>
    </PageShell>
  );
}
