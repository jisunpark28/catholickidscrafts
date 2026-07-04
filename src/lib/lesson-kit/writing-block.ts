import type { LessonBlockDto } from "@/lib/lesson-kit/types";

export type LessonWritingMode = "display" | "student";

export function lessonWritingMode(block: LessonBlockDto): LessonWritingMode {
  return block.config.writingMode === "display" ? "display" : "student";
}

export function lessonWritingPrompt(block: LessonBlockDto): string {
  return block.config.prompt?.trim() ?? "";
}

export function lessonWritingPlaceholder(block: LessonBlockDto): string {
  return block.config.placeholder?.trim() || "Write your answer here…";
}

export function lessonWritingMaxChars(block: LessonBlockDto): number {
  const max = block.config.maxChars ?? 200;
  return Math.min(2000, Math.max(20, max));
}

export function lessonWritingMinChars(block: LessonBlockDto): number {
  const min = block.config.minChars ?? 0;
  const max = lessonWritingMaxChars(block);
  return Math.min(max, Math.max(0, min));
}

/** Ruled blank lines for letter-size print worksheets. */
export function lessonWritingPrintBlankLines(block: LessonBlockDto): number {
  const max = lessonWritingMaxChars(block);
  if (max <= 80) return 3;
  if (max <= 200) return 5;
  return 8;
}
