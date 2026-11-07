import type { QaDeckRead } from "@/lib/liturgy-qa-catalog";
import type { QaTopic } from "@/lib/liturgy-qa-topics";
import { prisma } from "@/lib/prisma";

export type QaRead = QaDeckRead;

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

export async function readPublishedQa(topic: QaTopic): Promise<QaRead> {
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
    if (!row) return { status: "empty" };
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
    if (cards.length === 0) return { status: "empty" };
    return { status: "ok", topic: row, cards };
  } catch {
    // Table missing or DB down. Callers decide whether to use the authored catalog.
    return { status: "error" };
  }
}

export async function loadPublishedQa(
  topic: QaTopic,
): Promise<{ topic: PublicQaTopic; cards: PublicQaCard[] } | null> {
  const read = await readPublishedQa(topic);
  if (read.status !== "ok") return null;
  return { topic: read.topic, cards: read.cards };
}
