import { TestamentPageShell } from "@/components/bible/TestamentPageShell";
import { LiturgyCardGrid } from "@/components/liturgy/LiturgyCardGrid";
import { QaFlipCards } from "@/components/liturgy/QaFlipCards";
import { QaPageHeader } from "@/components/liturgy/QaPageHeader";
import { WeeklyThisWeekSection } from "@/components/liturgy/WeeklyThisWeekSection";
import {
  isLiturgyTopic,
  LITURGY_TOPIC_LABELS,
  loadLiturgyCards,
} from "@/lib/liturgy-cards";
import { loadPublishedQa } from "@/lib/liturgy-qa";
import { canonicalForPath } from "@/lib/site-metadata";
import { loadThisWeek, loadWeeklyCardsForTopic } from "@/lib/weekly-content";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import "@/styles/qa-cards.css";

type Props = { params: Promise<{ topic: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { topic } = await params;
  if (!isLiturgyTopic(topic)) return { title: "Not found" };
  return {
    title: LITURGY_TOPIC_LABELS[topic],
    description: `${LITURGY_TOPIC_LABELS[topic]} resources for children and catechists.`,
    ...canonicalForPath(`/liturgy/${topic}`),
  };
}

export const dynamic = "force-dynamic";

export default async function LiturgyTopicPage({ params }: Props) {
  const { topic } = await params;
  if (!isLiturgyTopic(topic)) notFound();

  const [liturgyCards, weeklyCards, thisWeek, qa] = await Promise.all([
    loadLiturgyCards(topic),
    loadWeeklyCardsForTopic(topic),
    loadThisWeek(),
    loadPublishedQa(topic),
  ]);
  const cards = [...liturgyCards, ...weeklyCards];

  return (
    <TestamentPageShell>
      {qa ? (
        <>
          <QaPageHeader topic={qa.topic} eyebrow={`Faith & Prayer · ${LITURGY_TOPIC_LABELS[topic]}`} />
          <QaFlipCards cards={qa.cards} cardBackColor={qa.topic.cardBackColor} />
        </>
      ) : (
        <h1 className="sr-only">{LITURGY_TOPIC_LABELS[topic]}</h1>
      )}
      {thisWeek && <WeeklyThisWeekSection week={thisWeek} />}
      <LiturgyCardGrid cards={cards} />
    </TestamentPageShell>
  );
}
