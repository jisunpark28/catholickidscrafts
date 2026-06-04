import { AffiliateDisclosure } from "@/components/AffiliateDisclosure";
import { RecommendationCard } from "@/components/RecommendationCard";
import { RecommendationsToolbar } from "@/components/RecommendationsToolbar";
import { PageHeader } from "@/components/PageHeader";
import { PageShell } from "@/components/PageShell";
import { parseKindParam } from "@/lib/recommendation-types";
import { getPublishedRecommendations } from "@/lib/recommendations";
import type { Metadata } from "next";
import { Suspense } from "react";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Recommendations",
  description:
    "Curated Catholic videos, books, templates, and resources for families and teachers.",
};

type Props = {
  searchParams: Promise<{ q?: string; kind?: string }>;
};

export default async function RecommendationsPage({ searchParams }: Props) {
  const params = await searchParams;
  const q = params.q;
  const kind = parseKindParam(params.kind);
  const items = await getPublishedRecommendations({ q, kind });

  return (
    <PageShell wide>
      <PageHeader
        title="Recommendations"
        subtitle="Stuff we actually use or would suggest to a friend on the parish team."
        programNote="Handy when a parent asks “What Bible story video is okay?” or you need one more book for the shelf. Some Amazon links help support the site—see disclosure."
      />

      <Suspense fallback={<p className="text-sm text-[var(--color-muted)]">Loading filters…</p>}>
        <RecommendationsToolbar />
      </Suspense>

      <p className="mt-6 text-sm text-[var(--color-muted)]">
        {items.length} {items.length === 1 ? "item" : "items"}
        {q ? ` matching “${q}”` : ""}
      </p>

      {items.length > 0 ? (
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {items.map((item) => (
            <RecommendationCard key={item.slug} item={item} />
          ))}
        </div>
      ) : (
        <p className="mt-10 border border-[var(--color-border)] bg-white p-8 text-center text-[var(--color-muted)]">
          No recommendations found. Try another search or category.
        </p>
      )}
      <AffiliateDisclosure variant="block" className="mt-12" />
    </PageShell>
  );
}
