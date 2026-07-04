import type { LessonBlockDto } from "@/lib/lesson-kit/types";
import type { LessonBlockType } from "@prisma/client";
import { defaultGameConfig } from "@/lib/lesson-kit/game-block";

/** Palette categories for the lesson-plan editor (lego / puzzle pieces). */
export type LessonBlockPaletteCategory = "content" | "media" | "games";

export const DEFAULT_PALETTE_CATEGORY: LessonBlockPaletteCategory = "content";

export type LessonBlockPaletteEntry = {
  type: LessonBlockType;
  /** Short label in the add palette (may differ from run-time block label). */
  paletteLabel: string;
  description: string;
};

export type LessonBlockPaletteGroup = {
  id: LessonBlockPaletteCategory;
  label: string;
  description: string;
  blocks: LessonBlockPaletteEntry[];
};

/** Liturgy blocks kept for existing kits; hidden from the add palette. */
export const LEGACY_HIDDEN_BLOCK_TYPES: readonly LessonBlockType[] = [
  "MASS_TODAY",
  "GOSPEL_TYPING",
  "BIBLE_CHAPTER",
] as const;

export function isLegacyHiddenBlockType(type: LessonBlockType): boolean {
  return (LEGACY_HIDDEN_BLOCK_TYPES as readonly string[]).includes(type);
}

export const LESSON_BLOCK_PALETTE: LessonBlockPaletteGroup[] = [
  {
    id: "content",
    label: "Content",
    description: "Notes, prompts, and teacher script",
    blocks: [
      {
        type: "CUSTOM_NOTE",
        paletteLabel: "Teacher note",
        description: "Class-only script or reminders (not a student worksheet)",
      },
      {
        type: "WRITING",
        paletteLabel: "Short writing",
        description: "Prompt for discussion or a student written response",
      },
    ],
  },
  {
    id: "media",
    label: "Media",
    description: "Links, images, slides, and site activities",
    blocks: [
      {
        type: "IMAGE",
        paletteLabel: "Image",
        description: "Upload or link a picture with optional caption",
      },
      {
        type: "SLIDES",
        paletteLabel: "Slides",
        description: "Google Slides embed or uploaded PDF / PowerPoint",
      },
      {
        type: "LINK",
        paletteLabel: "External link",
        description: "Prayer, video, Google Doc, or any web page",
      },
      {
        type: "RESOURCE",
        paletteLabel: "Activity link",
        description: "Link to a craft or printable on this site",
      },
    ],
  },
  {
    id: "games",
    label: "Games",
    description: "Game formats — you supply words and settings",
    blocks: [
      {
        type: "GAME",
        paletteLabel: "Custom game",
        description: "Hangman, typing, quizzes — you supply words and data",
      },
      {
        type: "PLAY_GAME",
        paletteLabel: "Site game",
        description: "Liturgical colors, church builder, and more",
      },
    ],
  },
];

/** Default config when a block is added from the palette. */
export function defaultBlockConfig(type: LessonBlockType): LessonBlockDto["config"] {
  switch (type) {
    case "PLAY_GAME":
      return { gameSlug: "liturgical-vestments" };
    case "TYPING_WORDS":
      return { wordPreset: "sunday" };
    case "GOSPEL_TYPING":
      return { readingKind: "gospel", maxChars: 400 };
    case "BIBLE_CHAPTER":
      return { bookSlug: "matthew", chapter: 1, maxChars: 400 };
    case "HANGMAN_WORDS":
      return { gameSlug: "hangman" };
    case "CUSTOM_NOTE":
      return {
        html: "<p>Welcome the class and share the goal for this step.</p>",
      };
    case "WRITING":
      return {
        prompt: "What is one kind thing you can do for someone this week?",
        placeholder: "Write your answer here…",
        minChars: 0,
        maxChars: 200,
        writingMode: "student",
      };
    case "RESOURCE":
      return { resourceSlug: "lent-stations-cross-craft" };
    case "LINK":
      return {
        url: "",
        buttonLabel: "Opening prayer",
        openInNewTab: true,
      };
    case "IMAGE":
      return {
        imageUrl: "",
        alt: "",
        caption: "",
        imageSource: "upload",
      };
    case "SLIDES":
      return {
        embedUrl: "",
        slidesSource: "embed",
        buttonLabel: "Open slides",
      };
    case "GAME":
      return defaultGameConfig("hangman");
    case "MASS_TODAY":
      return {};
    default:
      return {};
  }
}

export function paletteTypesFlat(): LessonBlockType[] {
  return LESSON_BLOCK_PALETTE.flatMap((g) => g.blocks.map((b) => b.type));
}
