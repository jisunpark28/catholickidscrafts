import { estimateLessonMinutes } from "@/lib/lesson-kit/constants";
import { parseBlockConfig, parseFamilyMode, type LessonKitDto } from "@/lib/lesson-kit/types";
import type { LessonBlock, LessonKit } from "@prisma/client";

export type LessonKitWithBlocks = LessonKit & { blocks: LessonBlock[] };

export function serializeLessonKit(kit: LessonKitWithBlocks): LessonKitDto {
  const blocks = kit.blocks
    .slice()
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((b) => ({
      id: b.id,
      sortOrder: b.sortOrder,
      type: b.type,
      label: b.label,
      config: parseBlockConfig(b.config),
    }));

  return {
    id: kit.id,
    shareSlug: kit.shareSlug,
    title: kit.title,
    description: kit.description,
    scope: kit.scope,
    sourceKitId: kit.sourceKitId,
    familyAccountId: kit.familyAccountId,
    liturgicalPeriod: kit.liturgicalPeriod,
    gradeBand: kit.gradeBand,
    tptUrl: kit.tptUrl,
    isFreeSample: kit.isFreeSample,
    familyMode: parseFamilyMode(kit.familyMode),
    published: kit.published,
    sortOrder: kit.sortOrder,
    blocks,
    stepCount: blocks.length,
    estMinutes: estimateLessonMinutes(blocks.length),
  };
}
