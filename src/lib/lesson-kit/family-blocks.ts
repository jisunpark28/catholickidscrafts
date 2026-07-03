import type { LessonBlockDto, LessonKitDto } from "@/lib/lesson-kit/types";
import { LESSON_BLOCK_DEFAULT_LABEL } from "@/lib/lesson-kit/constants";

export function blockDisplayLabel(block: LessonBlockDto): string {
  if (block.label?.trim()) return block.label.trim();
  return LESSON_BLOCK_DEFAULT_LABEL[block.type];
}

export function filterFamilyBlocks(
  kit: LessonKitDto,
  mode: "classroom" | "family",
): LessonBlockDto[] {
  if (mode === "classroom") return kit.blocks;

  const fm = kit.familyMode;
  if (fm?.includedBlockIds?.length) {
    const set = new Set(fm.includedBlockIds);
    return kit.blocks.filter((b) => set.has(b.id));
  }

  return kit.blocks.filter((b) => {
    if (b.config.familyInclude === false) return false;
    if (b.type === "CUSTOM_NOTE") return false;
    if (b.type === "MASS_TODAY") return true;
    if (b.type === "GOSPEL_TYPING") return true;
    if (b.type === "PLAY_GAME" || b.type === "TYPING_WORDS" || b.type === "HANGMAN_WORDS") {
      return true;
    }
    if (b.type === "RESOURCE") return false;
    if (b.type === "BIBLE_CHAPTER") return false;
    return true;
  });
}

export function gospelMaxCharsForBlock(
  block: LessonBlockDto,
  kit: LessonKitDto,
  mode: "classroom" | "family",
): number | undefined {
  const fromBlock = block.config.maxChars;
  if (mode === "family") {
    return kit.familyMode?.gospelMaxChars ?? fromBlock ?? 150;
  }
  return fromBlock ?? 400;
}
