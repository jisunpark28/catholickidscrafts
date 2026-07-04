import type { LessonBlockType } from "@prisma/client";

/** Stable shareSlug for the Lent Week 1 showcase template (seed). */
export const LENT_WK1_SHOWCASE_SLUG = "lent-wk1-g3";

export const LESSON_BLOCK_DEFAULT_LABEL: Record<LessonBlockType, string> = {
  CUSTOM_NOTE: "Teacher note",
  WRITING: "Writing",
  RESOURCE: "Craft",
  LINK: "Link",
  IMAGE: "Image",
  SLIDES: "Slides",
  PLAY_GAME: "Game",
  TYPING_WORDS: "Words",
  HANGMAN_WORDS: "Hangman",
  GOSPEL_TYPING: "Gospel",
  BIBLE_CHAPTER: "Bible",
  MASS_TODAY: "Today",
};

export const LESSON_WORD_PRESETS: Record<string, { label: string; words: string[] }> = {
  advent: {
    label: "Advent words",
    words: ["advent", "hope", "peace", "joy", "love", "emmanuel", "mary", "angel"],
  },
  communion: {
    label: "Communion words",
    words: ["eucharist", "communion", "jesus", "bread", "wine", "altar", "amen", "grace"],
  },
  sunday: {
    label: "Sunday words",
    words: ["alleluia", "amen", "gospel", "mass", "lord", "praise", "sunday", "church"],
  },
  lent: {
    label: "Lent words",
    words: [
      "lent",
      "ashes",
      "fast",
      "prayer",
      "almsgiving",
      "purple",
      "cross",
      "mercy",
      "repent",
      "easter",
    ],
  },
};

export const LESSON_GAME_SLUGS = [
  { slug: "liturgical-vestments", label: "Liturgical colors" },
  { slug: "typing", label: "Typing (words)" },
  { slug: "hangman", label: "Hangman" },
  { slug: "church", label: "Tiny Priest church" },
] as const;

/** Common craft pages for lesson RESOURCE blocks (slug must match DB). */
export const LESSON_RESOURCE_SLUGS = [
  { slug: "advent-wreath-craft", label: "Advent wreath craft" },
  { slug: "first-communion-examination", label: "First Communion examination" },
  { slug: "lent-stations-cross-craft", label: "Stations of the Cross craft" },
  { slug: "easter-egg-decorating", label: "Easter egg decorating" },
] as const;

export function estimateLessonMinutes(blockCount: number): number {
  if (blockCount <= 0) return 0;
  return Math.max(10, blockCount * 7);
}
