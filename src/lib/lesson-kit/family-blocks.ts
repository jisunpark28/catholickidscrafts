import type { LessonBlockDto, FamilyModeConfig, LessonKitDto } from "@/lib/lesson-kit/types";
import type { LessonBlockType } from "@prisma/client";
import { LESSON_BLOCK_DEFAULT_LABEL } from "@/lib/lesson-kit/constants";

export function blockDisplayLabel(block: LessonBlockDto): string {
  if (block.label?.trim()) return block.label.trim();
  return LESSON_BLOCK_DEFAULT_LABEL[block.type];
}

/** Default at-home inclusion when `familyInclude` is not set on the block. */
export function defaultFamilyIncludedByType(type: LessonBlockType): boolean {
  switch (type) {
    case "CUSTOM_NOTE":
    case "RESOURCE":
    case "LINK":
    case "BIBLE_CHAPTER":
      return false;
    default:
      return true;
  }
}

export function familyIncludeHint(block: LessonBlockDto): string {
  const def = defaultFamilyIncludedByType(block.type);
  if (block.config.familyInclude === true) return "Always included at home";
  if (block.config.familyInclude === false) return "Class only";
  return def
    ? "Included at home by default (games, Gospel, Mass)"
    : "Class only by default (longer activities)";
}

export function isBlockIncludedInFamily(
  block: LessonBlockDto,
  familyMode: FamilyModeConfig | null,
): boolean {
  const manualIds = familyMode?.includedBlockIds;
  if (manualIds && manualIds.length > 0) {
    return manualIds.includes(block.id);
  }

  if (block.config.familyInclude === false) return false;
  if (block.config.familyInclude === true) return true;

  if (block.type === "CUSTOM_NOTE") return false;
  return defaultFamilyIncludedByType(block.type);
}

export function filterFamilyBlocks(
  kit: LessonKitDto,
  mode: "classroom" | "family",
): LessonBlockDto[] {
  if (mode === "classroom") return kit.blocks;
  return kit.blocks.filter((b) => isBlockIncludedInFamily(b, kit.familyMode));
}

export function countFamilySteps(
  blocks: LessonBlockDto[],
  familyMode: FamilyModeConfig | null,
): number {
  return blocks.filter((b) => isBlockIncludedInFamily(b, familyMode)).length;
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

/** Map saved block ids to step indexes (for editor init). */
export function stepIndexesFromIncludedIds(
  blocks: LessonBlockDto[],
  includedBlockIds: string[] | undefined,
): number[] {
  if (!includedBlockIds?.length) return [];
  return blocks
    .map((b, i) => (includedBlockIds.includes(b.id) ? i : -1))
    .filter((i) => i >= 0);
}

/** Build familyMode JSON for persistence. */
export function buildFamilyModeConfig(
  gospelMaxChars: number,
  pickMode: "auto" | "manual",
  includedBlockIds: string[],
): FamilyModeConfig {
  const chars = Math.min(1200, Math.max(80, gospelMaxChars || 150));
  if (pickMode === "manual" && includedBlockIds.length > 0) {
    return { gospelMaxChars: chars, includedBlockIds };
  }
  return { gospelMaxChars: chars };
}
