import seedJson from "../../prisma/data/liturgy-qa-cards.json";
import type { PublicQaCard, PublicQaTopic } from "@/lib/liturgy-qa";
import { LITURGY_TOPIC_LABELS, LITURGY_TOPICS, type LiturgyTopic } from "@/lib/liturgy-topics";

type SeedTopic = {
  slug: string;
  title: string;
  bigIdea: string;
  accentColor: string;
  cardBackColor: string;
  sortOrder: number;
};

type SeedCard = {
  topicSlug: string;
  sortOrder: number;
  question: string;
  answer: string;
  tryThis?: string;
  iconFallback?: string;
  altText?: string;
  cardColor?: string;
};

const seed = seedJson as { topics: SeedTopic[]; cards: SeedCard[] };

/** Database read for one topic. `empty` means the database answered and nothing is published. */
export type QaDeckRead =
  | { status: "ok"; topic: PublicQaTopic; cards: PublicQaCard[] }
  | { status: "empty" }
  | { status: "error" };

export type QaDeckSection = {
  slug: LiturgyTopic;
  label: string;
  topic: PublicQaTopic;
  cards: PublicQaCard[];
  source: "published" | "catalog";
};

const topicBySlug = new Map(seed.topics.map((topic) => [topic.slug, topic]));

function publicCard(card: SeedCard): PublicQaCard {
  return {
    id: `seed-${card.topicSlug}-${card.sortOrder}`,
    question: card.question,
    answer: card.answer,
    tryThis: card.tryThis ?? "",
    iconFallback: card.iconFallback ?? "",
    imageUrl: null,
    altText: card.altText ?? "",
    cardColor: card.cardColor ?? "",
  };
}

/** Authored questions for one liturgy topic. Public fields only — no review notes or image prompts. */
export function catalogSection(slug: LiturgyTopic): QaDeckSection | null {
  const topic = topicBySlug.get(slug);
  if (!topic) return null;
  const cards = seed.cards
    .filter((card) => card.topicSlug === slug && card.question.trim() && card.answer.trim())
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map(publicCard);
  if (cards.length === 0) return null;
  return {
    slug,
    label: LITURGY_TOPIC_LABELS[slug],
    topic: {
      slug: topic.slug,
      title: topic.title,
      bigIdea: topic.bigIdea,
      accentColor: topic.accentColor,
      cardBackColor: topic.cardBackColor,
    },
    cards,
    source: "catalog",
  };
}

/** The ten liturgy topics, in the same order as the liturgy routes. Prayers stay on /prayers. */
export function catalogQaDeck(): QaDeckSection[] {
  return LITURGY_TOPICS.map((slug) => catalogSection(slug)).filter((section): section is QaDeckSection => section !== null);
}

/**
 * Published database cards win. A topic the database reports as empty stays empty.
 * A failed read uses the authored catalog for that topic.
 */
export function assembleQaDeck(reads: Partial<Record<LiturgyTopic, QaDeckRead>>): QaDeckSection[] {
  const catalog = new Map(catalogQaDeck().map((section) => [section.slug, section]));
  const sections: QaDeckSection[] = [];
  for (const slug of LITURGY_TOPICS) {
    const read = reads[slug];
    if (read?.status === "ok" && read.cards.length > 0) {
      sections.push({
        slug,
        label: LITURGY_TOPIC_LABELS[slug],
        topic: read.topic,
        cards: read.cards,
        source: "published",
      });
      continue;
    }
    if (read?.status === "empty") continue;
    const fallback = catalog.get(slug);
    if (fallback) sections.push(fallback);
  }
  return sections;
}
