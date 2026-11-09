/**
 * "When my child is…" moments with recommended verses (official Catholic / NABRE references).
 * Each ref is mapped to the reader page with nabreToDouay; scripts/test-moms-bible.ts checks
 * the mapping. The original fifteen chips stay first in each group. Extra moments from the
 * parenting dataset are appended from situation-catalog.ts. A note is a parent's wording,
 * not Scripture. A care line is for harm, crisis, or health: prayer does not replace help.
 */
import type { MbColorKey } from "@/lib/moms-bible/constants";
import type { NabreBookId } from "@/lib/bible/ref-map";
import { EXTRA_SITUATIONS } from "@/data/moms-bible/situation-catalog";
import { EXISTING_SITUATION_CARE } from "@/data/moms-bible/situation-coverage";

export type SituationRef = {
  book: NabreBookId;
  /** Shown to people, official numbering: "Psalm 34:19". */
  label: string;
  chapter: number;
  verse: number;
  verseEnd?: number;
};

export type Situation = {
  key: string;
  emoji: string;
  title: string;
  refs: readonly SituationRef[];
  /** A parent's suggested wording. Not scripture. */
  note?: string;
  /** Harm, crisis, or health: prayer does not replace a trusted adult or professional help. */
  care?: string;
};
export type SituationGroup = { color: MbColorKey; emoji: string; title: string; situations: readonly Situation[] };

const r = (book: NabreBookId, label: string, chapter: number, verse: number, verseEnd?: number): SituationRef => ({
  book,
  label,
  chapter,
  verse,
  ...(verseEnd ? { verseEnd } : {}),
});

const ORIGINAL_GROUPS: readonly SituationGroup[] = [
  {
    color: "YELLOW",
    emoji: "💛",
    title: "Love & Comfort",
    situations: [
      { key: "losing-a-pet", emoji: "🐾", title: "Losing a Pet", refs: [r("psalms", "Psalm 34:19", 34, 19), r("matthew", "Matthew 5:4", 5, 4)] },
      { key: "feeling-sad", emoji: "😢", title: "Feeling Sad", refs: [r("isaiah", "Isaiah 41:10", 41, 10), r("psalms", "Psalm 147:3", 147, 3)] },
      { key: "lonely", emoji: "🤝", title: "Lonely", refs: [r("deuteronomy", "Deuteronomy 31:6", 31, 6), r("john", "John 15:15", 15, 15)] },
      { key: "bullying", emoji: "🧩", title: "Bullying", refs: [r("psalms", "Psalm 34:18–19", 34, 18, 19), r("isaiah", "Isaiah 41:13", 41, 13)] },
    ],
  },
  {
    color: "GREEN",
    emoji: "💚",
    title: "Wisdom & Growth",
    situations: [
      { key: "honesty", emoji: "🤥", title: "Telling a Lie", refs: [r("ephesians", "Ephesians 4:25", 4, 25), r("proverbs", "Proverbs 12:22", 12, 22)] },
      { key: "anger", emoji: "😤", title: "Anger", refs: [r("james", "James 1:19", 1, 19), r("ephesians", "Ephesians 4:32", 4, 32)] },
      { key: "sharing", emoji: "🌱", title: "Sharing", refs: [r("hebrews", "Hebrews 13:16", 13, 16), r("luke", "Luke 6:31", 6, 31)] },
      { key: "screen-time", emoji: "📱", title: "Screen Time", refs: [r("romans", "Romans 12:2", 12, 2), r("proverbs", "Proverbs 4:23", 4, 23)] },
    ],
  },
  {
    color: "BLUE",
    emoji: "💙",
    title: "Courage & Peace",
    situations: [
      { key: "moving", emoji: "📦", title: "Moving / New School", refs: [r("joshua", "Joshua 1:9", 1, 9), r("psalms", "Psalm 23:1–4", 23, 1, 4)] },
      { key: "nightmares", emoji: "🌙", title: "Nightmares", refs: [r("psalms", "Psalm 4:9", 4, 9), r("philippians", "Philippians 4:6–7", 4, 6, 7)] },
      { key: "big-day", emoji: "📝", title: "Big Test", refs: [r("philippians", "Philippians 4:13", 4, 13), r("proverbs", "Proverbs 3:5–6", 3, 5, 6)] },
      { key: "anxiety", emoji: "🌥️", title: "Anxiety", refs: [r("matthew", "Matthew 6:34", 6, 34), r("1peter", "1 Peter 5:7", 5, 7)] },
    ],
  },
  {
    color: "PINK",
    emoji: "🩷",
    title: "Mom's Prayer for You",
    situations: [
      { key: "celebration", emoji: "🎂", title: "Birthday / First Communion", refs: [r("numbers", "Numbers 6:24–26", 6, 24, 26), r("jeremiah", "Jeremiah 29:11", 29, 11)] },
      { key: "just-because", emoji: "🙏", title: "Just Because", refs: [r("zephaniah", "Zephaniah 3:17", 3, 17), r("1corinthians", "1 Corinthians 13:4–7", 13, 4, 7)] },
      { key: "dreams", emoji: "✨", title: "Dreams", refs: [r("matthew", "Matthew 5:16", 5, 16), r("ephesians", "Ephesians 2:10", 2, 10)] },
    ],
  },
];

function withExistingCare(situations: readonly Situation[]): Situation[] {
  return situations.map((situation) => {
    const care = EXISTING_SITUATION_CARE[situation.key as keyof typeof EXISTING_SITUATION_CARE];
    return care ? { ...situation, care } : situation;
  });
}

/** Original chips stay first. Extra moments follow in dataset order inside the same four groups. */
export const SITUATION_GROUPS: readonly SituationGroup[] = ORIGINAL_GROUPS.map((group) => ({
  ...group,
  situations: [...withExistingCare(group.situations), ...EXTRA_SITUATIONS[group.color]],
}));

export const ORIGINAL_SITUATIONS: readonly Situation[] = ORIGINAL_GROUPS.flatMap((group) => group.situations);

export const SITUATIONS: readonly Situation[] = SITUATION_GROUPS.flatMap((g) => g.situations);

const BY_KEY = new Map(SITUATIONS.map((s) => [s.key, s]));

export function getSituation(key: string | null | undefined): Situation | null {
  return key ? (BY_KEY.get(key) ?? null) : null;
}

export function isSituationKey(key: unknown): key is string {
  return typeof key === "string" && BY_KEY.has(key);
}
