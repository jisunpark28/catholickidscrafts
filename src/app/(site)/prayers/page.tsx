import { TestamentPageShell } from "@/components/bible/TestamentPageShell";
import { QaFlipCards } from "@/components/liturgy/QaFlipCards";
import { QaPageHeader } from "@/components/liturgy/QaPageHeader";
import { loadPublishedQa } from "@/lib/liturgy-qa";
import { pageMetadata } from "@/lib/site-metadata";
import type { Metadata } from "next";
import "@/styles/qa-cards.css";

export const metadata: Metadata = pageMetadata({
  title: "Catholic Prayers for Kids",
  description:
    "Learn Catholic prayers with kids: the Sign of the Cross, Our Father, Hail Mary and more on tap-to-pray flip cards.",
  path: "/prayers",
});

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
        </>
      ) : (
        <h1 className="mb-4 text-2xl font-bold">Catholic Prayers</h1>
      )}
    </TestamentPageShell>
  );
}
