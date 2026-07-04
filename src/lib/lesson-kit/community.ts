import { estimateLessonMinutes } from "@/lib/lesson-kit/constants";
import { serializeLessonKit } from "@/lib/lesson-kit/serialize";
import type { LessonKitDto } from "@/lib/lesson-kit/types";
import { prisma } from "@/lib/prisma";

const kitInclude = { blocks: { orderBy: { sortOrder: "asc" as const } } };

export type CommunityLessonKitSummary = {
  id: string;
  shareSlug: string;
  title: string;
  description: string;
  gradeBand: string | null;
  authorDisplayName: string | null;
  publishedAt: string | null;
  stepCount: number;
  estMinutes: number;
};

export async function listCommunityLessonKits(): Promise<CommunityLessonKitSummary[]> {
  const kits = await prisma.lessonKit.findMany({
    where: {
      scope: "PERSONAL",
      communityVisible: true,
    },
    orderBy: [{ publishedAt: "desc" }, { updatedAt: "desc" }],
    include: {
      blocks: { select: { id: true } },
    },
  });

  return kits.map((kit) => ({
    id: kit.id,
    shareSlug: kit.shareSlug,
    title: kit.title,
    description: kit.description,
    gradeBand: kit.gradeBand,
    authorDisplayName: kit.authorDisplayName,
    publishedAt: kit.publishedAt?.toISOString() ?? null,
    stepCount: kit.blocks.length,
    estMinutes: estimateLessonMinutes(kit.blocks.length),
  }));
}

export async function getCommunityLessonKitByShareSlug(
  shareSlug: string,
): Promise<LessonKitDto | null> {
  const kit = await prisma.lessonKit.findUnique({
    where: { shareSlug },
    include: kitInclude,
  });
  if (!kit || kit.scope !== "PERSONAL" || !kit.communityVisible) {
    return null;
  }
  return serializeLessonKit(kit);
}

export type LessonKitForkAttribution = {
  title: string;
  authorLabel: string;
  href: string | null;
};

export async function getLessonKitForkAttribution(
  sourceKitId: string,
): Promise<LessonKitForkAttribution | null> {
  const source = await prisma.lessonKit.findUnique({
    where: { id: sourceKitId },
    select: {
      title: true,
      authorDisplayName: true,
      shareSlug: true,
      communityVisible: true,
    },
  });
  if (!source) return null;

  return {
    title: source.title,
    authorLabel: source.authorDisplayName?.trim() || "Another teacher",
    href: source.communityVisible ? `/program/community/${source.shareSlug}` : null,
  };
}

export async function canDuplicateLessonKitSource(
  sourceId: string,
  familyAccountId: string,
): Promise<boolean> {
  const source = await prisma.lessonKit.findUnique({
    where: { id: sourceId },
    select: { scope: true, communityVisible: true, familyAccountId: true },
  });
  if (!source) return false;
  if (source.scope === "GLOBAL_TEMPLATE") return true;
  if (source.familyAccountId === familyAccountId) return true;
  return source.scope === "PERSONAL" && source.communityVisible;
}
