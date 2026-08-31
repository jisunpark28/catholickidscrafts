import type { MassParticipationLine } from "@/lib/mass-participation/preview-script";

/**
 * First participation line for each Mass Order step (stepIndex 0–23).
 * Keep in sync with `prisma/data/mass-order-steps.ts` titles.
 */
export const MASS_ORDER_QUEST_ANCHORS: readonly string[] = [
  "intro-1", // 0 Entrance Song
  "intro-2", // 1 Sign of the Cross
  "intro-6", // 2 Penitential Rite
  "intro-11", // 3 Kyrie
  "intro-12", // 4 Gloria (skipped in Advent/Lent — resolves to Collect rubric)
  "intro-15", // 5 The Collect
  "word-1", // 6 1st Reading
  "word-3b", // 7 Responsorial Psalm
  "word-3c", // 8 2nd Reading
  "word-3d", // 9 Gospel Acclamation
  "word-6", // 10 Gospel
  "word-9b", // 11 Homily
  "word-9b2", // 12 Apostles' Creed
  "word-9c", // 13 Universal Prayer
  "euch-1", // 14 Preparation of the Gifts
  "euch-2", // 15 Prayer over the Offerings
  "thanks-1", // 16 Sanctus
  "thanks-2", // 17 Eucharistic Prayer
  "comm-1", // 18 The Lord's Prayer
  "comm-4", // 19 Sign of Peace
  "comm-6", // 20 Lamb of God
  "comm-7", // 21 Communion
  "end-3", // 22 Blessing
  "end-7", // 23 Dismissal
];

export function resolveQuestAnchorIndex(
  anchorId: string,
  allLines: readonly MassParticipationLine[],
  filteredLines: readonly MassParticipationLine[],
): number {
  const fullIndex = allLines.findIndex((line) => line.id === anchorId);
  if (fullIndex < 0 || filteredLines.length === 0) {
    return 0;
  }

  for (let i = 0; i < filteredLines.length; i++) {
    const line = filteredLines[i];
    const idx = allLines.findIndex((entry) => entry.id === line.id);
    if (idx >= fullIndex) {
      return i;
    }
  }

  return filteredLines.length - 1;
}

export function getQuestStepBounds(
  stepIndex: number,
  allLines: readonly MassParticipationLine[],
  filteredLines: readonly MassParticipationLine[],
): { start: number; end: number } {
  if (filteredLines.length === 0) {
    return { start: 0, end: 0 };
  }

  const anchorId = MASS_ORDER_QUEST_ANCHORS[stepIndex] ?? MASS_ORDER_QUEST_ANCHORS[0];
  const start = resolveQuestAnchorIndex(anchorId, allLines, filteredLines);
  let end = filteredLines.length - 1;

  const nextAnchorId = MASS_ORDER_QUEST_ANCHORS[stepIndex + 1];
  if (nextAnchorId) {
    const nextStart = resolveQuestAnchorIndex(nextAnchorId, allLines, filteredLines);
    if (nextStart > start) {
      end = nextStart - 1;
    }
  }

  return { start, end: Math.max(start, end) };
}
