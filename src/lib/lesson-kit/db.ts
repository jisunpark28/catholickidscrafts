import { generateLessonShareSlug } from "@/lib/lesson-kit/share-slug";
import { serializeLessonKit, type LessonKitWithBlocks } from "@/lib/lesson-kit/serialize";
import type { LessonBlockConfig } from "@/lib/lesson-kit/types";
import { prisma } from "@/lib/prisma";
import type { LessonBlockType, LessonKitScope, Prisma } from "@prisma/client";

const kitInclude = { blocks: { orderBy: { sortOrder: "asc" as const } } };

export async function getLessonKitByShareSlug(shareSlug: string) {
  const kit = await prisma.lessonKit.findUnique({
    where: { shareSlug },
    include: kitInclude,
  });
  if (!kit) return null;
  if (!kit.published && kit.scope === "PERSONAL") {
    // personal drafts still runnable if you have link
  }
  return serializeLessonKit(kit);
}

export async function getLessonKitById(id: string) {
  const kit = await prisma.lessonKit.findUnique({
    where: { id },
    include: kitInclude,
  });
  return kit ? serializeLessonKit(kit) : null;
}

export async function listGlobalTemplates() {
  const kits = await prisma.lessonKit.findMany({
    where: { scope: "GLOBAL_TEMPLATE", published: true },
    orderBy: [{ sortOrder: "asc" }, { title: "asc" }],
    include: kitInclude,
  });
  return kits.map(serializeLessonKit);
}

export async function listPersonalKits(familyAccountId: string) {
  const kits = await prisma.lessonKit.findMany({
    where: { familyAccountId, scope: "PERSONAL" },
    orderBy: { updatedAt: "desc" },
    include: kitInclude,
  });
  return kits.map(serializeLessonKit);
}

export async function duplicateLessonKit(opts: {
  sourceId: string;
  familyAccountId?: string | null;
  scope: LessonKitScope;
  titleSuffix?: string;
}) {
  const source = await prisma.lessonKit.findUnique({
    where: { id: opts.sourceId },
    include: kitInclude,
  });
  if (!source) return null;

  const title =
    opts.titleSuffix !== undefined
      ? opts.titleSuffix
        ? `${source.title}${opts.titleSuffix}`
        : source.title
      : `${source.title} (copy)`;

  const created = await prisma.lessonKit.create({
    data: {
      shareSlug: generateLessonShareSlug(),
      title,
      description: source.description,
      scope: opts.scope,
      sourceKitId: source.id,
      familyAccountId: opts.familyAccountId ?? null,
      liturgicalPeriod: source.liturgicalPeriod,
      gradeBand: source.gradeBand,
      tptUrl: source.tptUrl,
      isFreeSample: source.isFreeSample,
      familyMode: source.familyMode ?? undefined,
      published: opts.scope === "PERSONAL",
      sortOrder: source.sortOrder,
      blocks: {
        create: source.blocks.map((b) => ({
          sortOrder: b.sortOrder,
          type: b.type,
          label: b.label,
          config: b.config as Prisma.InputJsonValue,
        })),
      },
    },
    include: kitInclude,
  });

  return serializeLessonKit(created);
}

export async function recordLessonOpen(kitId: string, dateKey: string) {
  await prisma.lessonKitOpen.upsert({
    where: { kitId_dateKey: { kitId, dateKey } },
    create: { kitId, dateKey, opens: 1 },
    update: { opens: { increment: 1 } },
  });
}

export async function updateLessonKitMeta(
  id: string,
  familyAccountId: string,
  data: {
    title?: string;
    description?: string;
    published?: boolean;
    familyMode?: import("@/lib/lesson-kit/types").FamilyModeConfig;
    tptUrl?: string | null;
    isFreeSample?: boolean;
    gradeBand?: string | null;
  },
) {
  const kit = await prisma.lessonKit.findFirst({
    where: { id, familyAccountId },
  });
  if (!kit) return null;
  const updated = await prisma.lessonKit.update({
    where: { id },
    data: {
      ...data,
      familyMode: data.familyMode ? (data.familyMode as Prisma.InputJsonValue) : undefined,
    },
    include: kitInclude,
  });
  return serializeLessonKit(updated);
}

export async function replaceLessonBlocks(
  kitId: string,
  familyAccountId: string,
  blocks: {
    id?: string;
    sortOrder: number;
    type: LessonBlockType;
    label?: string | null;
    config: LessonBlockConfig;
  }[],
) {
  const kit = await prisma.lessonKit.findFirst({
    where: { id: kitId, familyAccountId },
  });
  if (!kit) return null;

  await prisma.$transaction([
    prisma.lessonBlock.deleteMany({ where: { kitId } }),
    ...blocks.map((b) =>
      prisma.lessonBlock.create({
        data: {
          kitId,
          sortOrder: b.sortOrder,
          type: b.type,
          label: b.label ?? null,
          config: b.config as Prisma.InputJsonValue,
        },
      }),
    ),
  ]);

  return getLessonKitById(kitId);
}

export async function deleteLessonBlock(
  blockId: string,
  kitId: string,
  familyAccountId: string,
) {
  const kit = await prisma.lessonKit.findFirst({
    where: { id: kitId, familyAccountId },
  });
  if (!kit) return false;
  await prisma.lessonBlock.delete({ where: { id: blockId, kitId } });
  return true;
}

export async function createGlobalTemplate(data: {
  title: string;
  description?: string;
  liturgicalPeriod?: string;
  gradeBand?: string;
  sortOrder?: number;
  familyMode?: import("@/lib/lesson-kit/types").FamilyModeConfig;
  blocks: {
    sortOrder: number;
    type: LessonBlockType;
    label?: string;
    config: LessonBlockConfig;
  }[];
}) {
  const created = await prisma.lessonKit.create({
    data: {
      shareSlug: generateLessonShareSlug(),
      title: data.title,
      description: data.description ?? "",
      scope: "GLOBAL_TEMPLATE",
      liturgicalPeriod: data.liturgicalPeriod ?? null,
      gradeBand: data.gradeBand ?? null,
      familyMode: (data.familyMode ?? { gospelMaxChars: 150 }) as Prisma.InputJsonValue,
      published: true,
      sortOrder: data.sortOrder ?? 0,
      blocks: {
        create: data.blocks.map((b) => ({
          sortOrder: b.sortOrder,
          type: b.type,
          label: b.label ?? null,
          config: b.config as Prisma.InputJsonValue,
        })),
      },
    },
    include: kitInclude,
  });
  return serializeLessonKit(created);
}

export async function canEditLessonKit(
  kit: { familyAccountId: string | null },
  familyAccountId: string,
) {
  return kit.familyAccountId === familyAccountId;
}

export async function replaceLessonBlocksForEditor(
  kitId: string,
  familyAccountId: string,
  blocks: {
    sortOrder: number;
    type: LessonBlockType;
    label?: string | null;
    config: LessonBlockConfig;
  }[],
) {
  const kit = await prisma.lessonKit.findFirst({
    where: { id: kitId, familyAccountId },
  });
  if (!kit) return null;
  return replaceLessonBlocks(kitId, familyAccountId, blocks);
}

export type { LessonKitWithBlocks };
