import { TestamentPageShell } from "@/components/bible/TestamentPageShell";
import { LiturgyCardGrid } from "@/components/liturgy/LiturgyCardGrid";
import { QaFlipCards } from "@/components/liturgy/QaFlipCards";
import { QaPageHeader } from "@/components/liturgy/QaPageHeader";
import { WeeklyThisWeekSection } from "@/components/liturgy/WeeklyThisWeekSection";
import {
  isLiturgyTopic,
  type LiturgyTopic,
  LITURGY_TOPIC_LABELS,
  loadLiturgyCards,
} from "@/lib/liturgy-cards";
import { loadPublishedQa } from "@/lib/liturgy-qa";
import { pageMetadata } from "@/lib/site-metadata";
import { loadThisWeek, loadWeeklyCardsForTopic } from "@/lib/weekly-content";
import type { Metadata } from "next";
import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbNode } from "@/lib/structured-data";
import { notFound } from "next/navigation";
import "@/styles/qa-cards.css";

const LITURGY_SEO: Record<LiturgyTopic, { title: string; description: string }> = {
  "mass": { title: "Mass for Kids: Q&A Flip Cards", description: "Why do we go to Mass? Kid-friendly questions and answers on flip cards explain what happens at Mass. Ready to use in Sunday school or at home." },
  "sacraments": { title: "Seven Sacraments for Kids: Flip Cards", description: "Learn the seven sacraments with kid-friendly flip cards: Baptism, Eucharist, Confirmation and more. Simple Catholic answers for Sunday school and home." },
  "saints": { title: "Catholic Saints for Kids: Flip Cards", description: "Meet the Catholic saints with kid-friendly flip cards and activities. Simple stories and questions about holy men and women for Sunday school and home." },
  "devotions": { title: "Catholic Devotions for Kids: Rosary & More", description: "Rosary, Stations of the Cross and other Catholic devotions explained for kids with flip cards and simple answers, for catechists and parents." },
  "ordinary-time": { title: "Ordinary Time for Kids: Q&A Flip Cards", description: "What is Ordinary Time and why is it green? Kid-friendly flip cards and this week's activities for Catholic Sunday school and families." },
  "advent": { title: "Advent for Kids: Flip Cards & Activities", description: "Advent is getting our hearts ready for Jesus. Kid-friendly flip cards and weekly activities explain the Advent wreath, colors and waiting for Christmas." },
  "christmas-time": { title: "Christmas Season for Kids: Q&A Flip Cards", description: "Celebrate the Christmas season with kids: flip cards about the Nativity, Epiphany and Baptism of the Lord, plus weekly Catholic activities." },
  "lent": { title: "Lent for Kids: Flip Cards & Activities", description: "Prayer, fasting and almsgiving explained for kids. Flip cards and weekly activities help children and catechists walk through Lent toward Easter." },
  "paschal-triduum": { title: "Holy Week & Triduum for Kids: Flip Cards", description: "Holy Thursday, Good Friday and the Easter Vigil explained for kids with flip cards and simple answers, for Catholic families and catechists." },
  "easter-time": { title: "Easter Season for Kids: Q&A Flip Cards", description: "Jesus is risen! Kid-friendly flip cards and weekly activities for the 50 days of Easter, from Easter Sunday to Pentecost, for home and Sunday school." },
};

type Props = { params: Promise<{ topic: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { topic } = await params;
  if (!isLiturgyTopic(topic)) return { title: "Not found" };
  const seo = LITURGY_SEO[topic];
  return pageMetadata({
    title: seo.title,
    description: seo.description,
    path: `/liturgy/${topic}`,
  });
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
      <JsonLd nodes={[breadcrumbNode([{ name: LITURGY_TOPIC_LABELS[topic], path: `/liturgy/${topic}` }])]} />
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
