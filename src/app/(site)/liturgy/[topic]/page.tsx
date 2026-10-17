import { TestamentPageShell } from "@/components/bible/TestamentPageShell";
import { LiturgyCardGrid } from "@/components/liturgy/LiturgyCardGrid";
import { isLiturgyTopic, LITURGY_TOPIC_LABELS, loadLiturgyCards } from "@/lib/liturgy-cards";
import { canonicalForPath } from "@/lib/site-metadata";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

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

  const cards = await loadLiturgyCards(topic);

  return (
    <TestamentPageShell>
      <h1 className="sr-only">{LITURGY_TOPIC_LABELS[topic]}</h1>
      <LiturgyCardGrid cards={cards} />
    </TestamentPageShell>
  );
}
