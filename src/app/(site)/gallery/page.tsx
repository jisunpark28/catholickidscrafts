import { CraftGalleryGrid } from "@/components/CraftGalleryGrid";
import { PageHeader } from "@/components/PageHeader";
import { PageShell } from "@/components/PageShell";
import { listApprovedGallerySubmissions } from "@/lib/craft-gallery";
import { canonicalForPath } from "@/lib/site-metadata";
import type { Metadata } from "next";

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
      <CraftGalleryGrid items={items} />
    </PageShell>
  );
}
