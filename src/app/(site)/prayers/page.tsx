import { TestamentPageShell } from "@/components/bible/TestamentPageShell";
import { QaFlipCards } from "@/components/liturgy/QaFlipCards";
import { QaPageHeader } from "@/components/liturgy/QaPageHeader";
import { PrayersReader } from "@/components/prayers/PrayersReader";
import { loadPublishedQa } from "@/lib/liturgy-qa";
import { canonicalForPath } from "@/lib/site-metadata";
import type { Metadata } from "next";
import { Suspense } from "react";
import "@/styles/prayers.css";
import "@/styles/qa-cards.css";

export const metadata: Metadata = {
  title: "Catholic Prayers",
  description:
    "Essential Catholic prayers for children and catechists: Our Father, Hail Mary, creeds, meal prayers, and more.",
  ...canonicalForPath("/prayers"),
};

// Prayer cards are edited in admin, so read them per request.
export const dynamic = "force-dynamic";

export default async function PrayersPage() {
  const qa = await loadPublishedQa("prayers");

  return (
    <TestamentPageShell>
      {qa ? (
        <>
          <QaPageHeader topic={qa.topic} eyebrow="Faith & Prayer · Prayers" />
          <QaFlipCards cards={qa.cards} variant="prayer" cardBackColor={qa.topic.cardBackColor} />
          <h2 className="mb-4 mt-4 text-xl font-bold">All prayers in 10 languages</h2>
        </>
      ) : (
        <h1 className="sr-only">Catholic Prayers</h1>
      )}
      <Suspense fallback={<p className="text-sm text-[var(--color-muted)]">Loading prayers…</p>}>
        <PrayersReader />
      </Suspense>
    </TestamentPageShell>
  );
}
