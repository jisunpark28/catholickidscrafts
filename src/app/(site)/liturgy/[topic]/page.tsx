import { TestamentPageShell } from "@/components/bible/TestamentPageShell";
import { LiturgyCardGrid } from "@/components/liturgy/LiturgyCardGrid";
import { isLiturgyTopic, loadLiturgyCards, type LiturgyTopic } from "@/lib/liturgy-cards";
import { canonicalForPath } from "@/lib/site-metadata";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

const TITLES: Record<LiturgyTopic, string> = {
  mass: "Mass",
  sacraments: "Sacraments",
  saints: "Saints",
  devotions: "Devotions",
  "ordinary-time": "Ordinary Time",
  advent: "Advent",
  "christmas-time": "Christmas Time",
  lent: "Lent",
  "paschal-triduum": "Paschal Triduum",
  "easter-time": "Easter Time",
};

type Props = { params: Promise<{ topic: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { topic } = await params;
  if (!isLiturgyTopic(topic)) return { title: "Not found" };
  return {
    title: TITLES[topic],
    description: `${TITLES[topic]} resources for children and catechists.`,
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
      <h1 className="sr-only">{TITLES[topic]}</h1>
      <LiturgyCardGrid cards={cards} />
    </TestamentPageShell>
  );
}
