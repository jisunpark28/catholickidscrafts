import { prisma } from "@/lib/prisma";

export type CurriculumResourceRow = {
  id: string;
  slug: string;
  title: string;
  published: boolean;
  sortOrder: number | null;
};

function sortResourcesByTrackOrder<
  T extends { id: string; updatedAt: Date },
>(resources: T[], orderByResourceId: Map<string, number>): T[] {
  return [...resources].sort((a, b) => {
    const aOrder = orderByResourceId.get(a.id);
    const bOrder = orderByResourceId.get(b.id);
    const aRank = aOrder ?? Number.MAX_SAFE_INTEGER;
    const bRank = bOrder ?? Number.MAX_SAFE_INTEGER;
    if (aRank !== bRank) return aRank - bRank;
    return b.updatedAt.getTime() - a.updatedAt.getTime();
  });
}

/** Resources whose Title (grade field) matches the curriculum track title, in operator sort order. */
export async function getPublishedResourcesForTrackTitle(
  trackId: string,
  trackTitle: string,
) {
  const [resources, links] = await Promise.all([
    prisma.resource.findMany({
      where: { published: true, grade: trackTitle },
    }),
    prisma.curriculumTrackResource.findMany({
      where: { trackId },
      orderBy: { sortOrder: "asc" },
    }),
  ]);

  const orderByResourceId = new Map(links.map((l) => [l.resourceId, l.sortOrder]));
  return sortResourcesByTrackOrder(resources, orderByResourceId);
}

export async function listAdminResourcesForTrack(
  trackId: string,
  trackTitle: string,
): Promise<CurriculumResourceRow[]> {
  const [resources, links] = await Promise.all([
    prisma.resource.findMany({
      where: { grade: trackTitle },
      orderBy: { title: "asc" },
      select: {
        id: true,
        slug: true,
        title: true,
        published: true,
        updatedAt: true,
      },
    }),
    prisma.curriculumTrackResource.findMany({
      where: { trackId },
      orderBy: { sortOrder: "asc" },
    }),
  ]);

  const orderByResourceId = new Map(links.map((l) => [l.resourceId, l.sortOrder]));
  const sorted = sortResourcesByTrackOrder(resources, orderByResourceId);

  return sorted.map((r) => ({
    id: r.id,
    slug: r.slug,
    title: r.title,
    published: r.published,
    sortOrder: orderByResourceId.get(r.id) ?? null,
  }));
}

export async function saveTrackResourceOrder(trackId: string, resourceIds: string[]) {
  await prisma.$transaction(async (tx) => {
    await tx.curriculumTrackResource.deleteMany({ where: { trackId } });
    if (resourceIds.length === 0) return;
    await tx.curriculumTrackResource.createMany({
      data: resourceIds.map((resourceId, index) => ({
        trackId,
        resourceId,
        sortOrder: index,
      })),
    });
  });
}
