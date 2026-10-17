import { prisma } from "@/lib/prisma";
import { getTptStoreUrl } from "@/lib/tpt";

export const LITURGY_TOPICS = [
  "mass",
  "sacraments",
  "saints",
  "devotions",
  "ordinary-time",
  "advent",
  "christmas-time",
  "lent",
  "paschal-triduum",
  "easter-time",
] as const;

export type LiturgyTopic = (typeof LITURGY_TOPICS)[number];

export type LiturgyCard = {
  id: string;
  title: string;
  href?: string;
  imageUrl?: string;
};

const TOPIC_MATCH: Record<LiturgyTopic, RegExp> = {
  mass: /\bmass\b/i,
  sacraments: /sacrament|communion|baptism|confirmation|reconciliation|eucharist/i,
  saints: /\bsaints?\b/i,
  devotions: /devotion|rosary|novena|adoration|stations of the cross/i,
  "ordinary-time": /\bordinary\b/i,
  advent: /\badvent\b/i,
  "christmas-time": /christmas/i,
  lent: /\blent\b/i,
  "paschal-triduum": /triduum|holy week|good friday/i,
  "easter-time": /\beaster\b/i,
};

/** Resources already in the repo. Shown even when the database is unavailable. */
const BUNDLED_CARDS: (LiturgyCard & { topics: LiturgyTopic[] })[] = [
  {
    id: "mass-etiquette-lower",
    title: "Mass Etiquette — Lower Elementary",
    href: getTptStoreUrl(),
    topics: ["mass"],
  },
  {
    id: "first-communion-examination",
    title: "First Communion: Examination of Conscience",
    href: "/resources/first-communion-examination",
    topics: ["sacraments"],
  },
  {
    id: "lent-stations-cross-craft",
    title: "Stations of the Cross Coloring Craft",
    href: "/resources/lent-stations-cross-craft",
    topics: ["devotions", "lent"],
  },
  {
    id: "noahs-ark-coloring",
    title: "Noah's Ark Coloring Page",
    href: "/resources/noahs-ark-coloring",
    topics: ["ordinary-time"],
  },
  {
    id: "advent-wreath-craft",
    title: "Advent Wreath Paper Craft",
    href: "/resources/advent-wreath-craft",
    topics: ["advent"],
  },
];

const MIN_CARDS = 7;

export function isLiturgyTopic(value: string): value is LiturgyTopic {
  return (LITURGY_TOPICS as readonly string[]).includes(value);
}

function matchesTopic(topic: LiturgyTopic, text: string): boolean {
  return TOPIC_MATCH[topic].test(text);
}

export async function loadLiturgyCards(topic: LiturgyTopic): Promise<LiturgyCard[]> {
  const cards: LiturgyCard[] = [];
  const seen = new Set<string>();

  function add(card: LiturgyCard) {
    if (seen.has(card.id)) return;
    seen.add(card.id);
    cards.push(card);
  }

  for (const card of BUNDLED_CARDS) {
    if (card.topics.includes(topic)) add(card);
  }

  try {
    const resources = await prisma.resource.findMany({
      where: { published: true },
      select: {
        slug: true,
        title: true,
        topic: true,
        liturgicalPeriod: true,
        tptUrl: true,
        previewImageUrl: true,
        downloadUrl: true,
      },
    });
    for (const resource of resources) {
      const blob = `${resource.title} ${resource.topic} ${resource.liturgicalPeriod} ${resource.slug}`;
      if (!matchesTopic(topic, blob)) continue;
      const external = resource.tptUrl?.trim() || undefined;
      add({
        id: resource.slug,
        title: resource.title,
        href: external || `/resources/${resource.slug}`,
        imageUrl: resource.previewImageUrl?.trim() || undefined,
      });
    }
  } catch {
    // Database is optional; bundled cards and empty frames still render.
  }

  try {
    const kits = await prisma.lessonKit.findMany({
      where: { published: true, tptUrl: { not: null } },
      select: { shareSlug: true, title: true, description: true, tptUrl: true },
    });
    for (const kit of kits) {
      const blob = `${kit.title} ${kit.description} ${kit.shareSlug}`;
      if (!matchesTopic(topic, blob) || !kit.tptUrl) continue;
      add({
        id: kit.shareSlug,
        title: kit.title,
        href: kit.tptUrl,
      });
    }
  } catch {
    // Same as resources: skip when the database cannot be reached.
  }

  while (cards.length < MIN_CARDS) {
    cards.push({ id: `empty-${topic}-${cards.length}` , title: "" });
  }

  return cards;
}
