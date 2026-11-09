import { TestamentPageShell } from "@/components/bible/TestamentPageShell";
import { SidebarPagePanel } from "@/components/SidebarPagePanel";
import { QaCardsByTopic, type QaTopicTab } from "@/components/liturgy/QaCardsByTopic";
import { JsonLd } from "@/components/seo/JsonLd";
import { loadLiturgyQaDeck } from "@/lib/liturgy-qa-deck";
import { LITURGY_TOPIC_LABELS, LITURGY_TOPICS } from "@/lib/liturgy-topics";
import { pageMetadata } from "@/lib/site-metadata";
import { breadcrumbNode } from "@/lib/structured-data";
import type { Metadata } from "next";
import "@/styles/qa-cards.css";

export const metadata: Metadata = pageMetadata({
  title: "Catholic Q&A Flip Cards for Kids",
  description:
    "Questions and answers about the Mass, the sacraments, the saints, devotions, and the Church seasons on tap-to-flip cards for kids.",
  path: "/qa-cards",
});

// Q&A deck is edited in admin: saves call revalidatePath, and the hourly refresh is a fallback.
export const revalidate = 3600;

export default async function QaCardsPage() {
  const deck = await loadLiturgyQaDeck();
  const bySlug = new Map(deck.map((section) => [section.slug, section]));
  const tabs: QaTopicTab[] = LITURGY_TOPICS.map((slug) => {
    const section = bySlug.get(slug);
    return { slug, label: LITURGY_TOPIC_LABELS[slug], topic: section?.topic ?? null, cards: section?.cards ?? [] };
  });

  return (
    <TestamentPageShell>
      <JsonLd nodes={[breadcrumbNode([{ name: "Q&A Cards", path: "/qa-cards" }])]} />
      <SidebarPagePanel id="qa-cards">
        <h1 className="font-[Georgia,serif] text-3xl font-bold text-[#405329]">Q&amp;A Cards</h1>
        <p className="mt-3 max-w-3xl text-base leading-relaxed text-[#374151]">
          Find answers to your questions about the Mass and the liturgy. Have another question? Send us feedback anytime.
        </p>
        <QaCardsByTopic tabs={tabs} />
      </SidebarPagePanel>
    </TestamentPageShell>
  );
}