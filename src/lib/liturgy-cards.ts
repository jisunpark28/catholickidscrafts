import { prisma } from "@/lib/prisma";
import { type LiturgyTopic } from "@/lib/liturgy-topics";

export type { LiturgyTopic } from "@/lib/liturgy-topics";
export {
  isLiturgyCardLink,
  isLiturgyTopic,
  LITURGY_TOPIC_LABELS,
  LITURGY_TOPICS,
} from "@/lib/liturgy-topics";

export type LiturgyCard = {
  id: string;
  title: string;
  href?: string;
  imageUrl?: string;
  /** Small label in the top-left corner (e.g. weekly item type). */
  badge?: string;
};

const EMPTY_FRAMES = 7;

export function emptyLiturgyFrames(topic: LiturgyTopic): LiturgyCard[] {
  return Array.from({ length: EMPTY_FRAMES }, (_, index) => ({
    id: `empty-${topic}-${index}`,
    title: "",
  }));
}

export function isEmptyFrame(card: LiturgyCard): boolean {
  return card.id.startsWith("empty-");
}

export async function loadLiturgyCards(topic: LiturgyTopic): Promise<LiturgyCard[]> {
  try {
    const rows = await prisma.liturgyCard.findMany({
      where: { topic },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    });
    if (rows.length > 0) {
      return rows.map((row) => ({
        id: row.id,
        title: row.title,
        href: row.href.trim() || undefined,
        imageUrl: row.imageUrl.trim() || undefined,
      }));
    }
  } catch {
    // No table yet, or the database is down: show the empty grid.
  }

  return emptyLiturgyFrames(topic);
}