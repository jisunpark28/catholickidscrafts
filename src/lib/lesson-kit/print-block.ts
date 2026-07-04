import {
  LESSON_BLOCK_DEFAULT_LABEL,
  LESSON_GAME_SLUGS,
  LESSON_RESOURCE_SLUGS,
  LESSON_WORD_PRESETS,
} from "@/lib/lesson-kit/constants";
import type { LessonBlockDto, LessonKitDto } from "@/lib/lesson-kit/types";
import { formatWeekLabel, weekStartSundayUtc } from "@/lib/lesson-kit/week";
import { getLiturgicalPeriod, type LiturgicalPeriodId } from "@/lib/content-types";
import type { LessonBlockType } from "@prisma/client";

const BLOCK_PRINT_MINUTES: Partial<Record<LessonBlockType, number>> = {
  CUSTOM_NOTE: 2,
  WRITING: 5,
  LINK: 3,
  IMAGE: 4,
  SLIDES: 8,
  GAME: 7,
  PLAY_GAME: 8,
  TYPING_WORDS: 7,
  HANGMAN_WORDS: 7,
  RESOURCE: 5,
  GOSPEL_TYPING: 10,
  BIBLE_CHAPTER: 10,
  MASS_TODAY: 5,
};

export type LessonPrintMetaRow = {
  label: string;
  value: string;
};

export function formatPrintLiturgicalPeriod(raw: string | null): string | null {
  if (!raw?.trim()) return null;
  const id = raw.trim().toLowerCase();
  const known = [
    "advent",
    "christmas",
    "lent",
    "holy-week",
    "easter",
    "ordinary",
    "general",
  ] as const;
  if ((known as readonly string[]).includes(id)) {
    return getLiturgicalPeriod(id as LiturgicalPeriodId).title;
  }
  return raw.trim();
}

export function printWeekLabel(date: Date = new Date()): string {
  return formatWeekLabel(weekStartSundayUtc(date));
}

export function estimateBlockPrintMinutes(block: LessonBlockDto): number {
  const base = BLOCK_PRINT_MINUTES[block.type] ?? 5;
  if (block.type === "WRITING" && block.config.writingMode === "display") {
    return 2;
  }
  return base;
}

export function lessonPrintMetaRows(kit: LessonKitDto): LessonPrintMetaRow[] {
  const rows: LessonPrintMetaRow[] = [];

  if (kit.gradeBand?.trim()) {
    rows.push({ label: "Grade", value: kit.gradeBand.trim() });
  }

  const season = formatPrintLiturgicalPeriod(kit.liturgicalPeriod);
  if (season) {
    rows.push({ label: "Season", value: season });
  }

  rows.push({ label: "Week", value: printWeekLabel() });
  rows.push({ label: "Steps", value: String(kit.stepCount) });
  rows.push({ label: "Est. time", value: `~${kit.estMinutes} min` });

  return rows;
}

export function blockPrintTypeLabel(block: LessonBlockDto): string {
  return LESSON_BLOCK_DEFAULT_LABEL[block.type];
}

export function playGamePrintLabel(block: LessonBlockDto): string {
  const slug = block.config.gameSlug ?? "liturgical-vestments";
  return LESSON_GAME_SLUGS.find((g) => g.slug === slug)?.label ?? slug;
}

export function resourcePrintLabel(block: LessonBlockDto): string {
  const slug = block.config.resourceSlug ?? "";
  return LESSON_RESOURCE_SLUGS.find((r) => r.slug === slug)?.label ?? (slug || "(craft link)");
}

export function typingWordsPrintLabel(block: LessonBlockDto): string {
  const preset = block.config.wordPreset ?? "sunday";
  return LESSON_WORD_PRESETS[preset]?.label ?? preset;
}
