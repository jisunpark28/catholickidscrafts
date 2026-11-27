import type { SundaySheetContent } from "@/lib/sunday-sheet-content";

export const MASS_SHEET_KEYS = ["MASS_INTRO", "MASS_WORD", "MASS_EUCHARIST", "MASS_PARTS"] as const;

export type MassSheetKey = (typeof MASS_SHEET_KEYS)[number];

export function isMassSheetKey(key: string): key is MassSheetKey {
  return (MASS_SHEET_KEYS as readonly string[]).includes(key);
}

/** Our own sentences. Not a Bible translation. The reference is stored separately. */
export const MASS_KID_VERSES: Record<MassSheetKey, string> = {
  MASS_INTRO: "Jesus is with us when we gather in his name.",
  MASS_WORD: "Jesus calls people blessed when they hear God's word and live it.",
  MASS_EUCHARIST: "Jesus gives his body for us and asks us to do this in memory of him.",
  MASS_PARTS: "Jesus sends us to share the good news with the whole world.",
};

export const MASS_DOCTRINE_NOTES: Record<MassSheetKey, readonly string[]> = {
  MASS_INTRO: [
    "We begin in the name of the Father, and of the Son, and of the Holy Spirit.",
    "The short prayer for mercy at the start of Mass is not confession.",
    "Penance is given before absolution and completed afterward.",
  ],
  MASS_WORD: [
    "We sit to listen, then stand for the Gospel.",
    "God speaks to us in the readings.",
  ],
  MASS_EUCHARIST: [
    "The bread and wine become Christ's Body and Blood.",
    "Christ is present whole and entire under the form of bread, and whole and entire under the form of wine.",
    "We kneel during the Eucharistic Prayer, following our parish custom, or bow if we cannot kneel.",
  ],
  MASS_PARTS: [
    "The Word and the Eucharist are the two main parts, and they are one act of worship.",
    "We are sent to love our neighbor.",
  ],
};

export const MASS_GUIDE_LINK = {
  href: "/catholic-mass-for-kids/four-parts-of-the-mass",
  label: "All 4 Parts of the Mass for Kids (Guide & Worksheet)",
} as const;

/** Level 2 key: the activity list is already the correct order, before the sheet shuffles it. */
export function massLevel2AnswerKey(sheet: SundaySheetContent): string[] {
  const activity = sheet.levels.level2.activity;
  if (!activity) return [];
  if (activity.type === "wordorder") return activity.pieces.map((piece, index) => `${index + 1}. ${piece}`);
  if (activity.type === "matchup") return activity.pairs.map(([left, right]) => `${left}: ${right}`);
  return [];
}
