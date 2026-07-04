import { estimateLessonMinutes } from "@/lib/lesson-kit/constants";
import { prisma } from "@/lib/prisma";

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
