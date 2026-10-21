import { prisma } from "@/lib/prisma";
import type { QaTopic } from "@/lib/liturgy-qa-topics";

/** Public shape only. Never add internalSourceRef, reviewNote or image prompts here. */
export type PublicQaTopic = {
  slug: string;
  title: string;
  bigIdea: string;
  accentColor: string;
  cardBackColor: string;
};

export type PublicQaCard = {
  id: string;
  question: string;
  answer: string;
  tryThis: string;
  iconFallback: string;
  imageUrl: string | null;
  altText: string;
  cardColor: string;
};

export async function loadPublishedQa(
  topic: QaTopic,
): Promise<{ topic: PublicQaTopic; cards: PublicQaCard[] } | null> {
  try {
    const row = await prisma.liturgyQaTopic.findUnique({
      where: { slug: topic },
      select: {
        slug: true,
        title: true,
        bigIdea: true,
        accentColor: true,
        cardBackColor: true,
      },
    });
    if (!row) return null;
    const cards = await prisma.liturgyQaCard.findMany({
      where: { topicSlug: topic, status: "PUBLISHED" },
      orderBy: { sortOrder: "asc" },
      select: {
        id: true,
        question: true,
        answer: true,
        tryThis: true,
        iconFallback: true,
        imageUrl: true,
        altText: true,
        cardColor: true,
      },
    });
    if (cards.length === 0) return null;
    return { topic: row, cards };
  } catch {
    // Table missing or DB down: the page falls back to the existing grid only.
    return null;
  }
}
