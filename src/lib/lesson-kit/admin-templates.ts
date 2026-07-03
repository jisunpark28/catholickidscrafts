import { generateLessonShareSlug } from "@/lib/lesson-kit/share-slug";
import { serializeLessonKit } from "@/lib/lesson-kit/serialize";
import type { LessonBlockConfig, FamilyModeConfig } from "@/lib/lesson-kit/types";
import { prisma } from "@/lib/prisma";
import type { LessonBlockType, Prisma } from "@prisma/client";

const kitInclude = { blocks: { orderBy: { sortOrder: "asc" as const } } };

export async function listAdminGlobalTemplates() {
  const kits = await prisma.lessonKit.findMany({
    where: { scope: "GLOBAL_TEMPLATE" },
    orderBy: [{ sortOrder: "asc" }, { title: "asc" }],
    include: kitInclude,
  });
  return kits.map(serializeLessonKit);
}

export async function getAdminGlobalTemplate(id: string) {
  const kit = await prisma.lessonKit.findFirst({
    where: { id, scope: "GLOBAL_TEMPLATE" },
    include: kitInclude,
  });
  return kit ? serializeLessonKit(kit) : null;
}

export async function createAdminGlobalTemplate(data: {
  title: string;
  description?: string;
  liturgicalPeriod?: string | null;
  gradeBand?: string | null;
  sortOrder?: number;
  published?: boolean;
  tptUrl?: string | null;
  isFreeSample?: boolean;
  familyMode?: FamilyModeConfig;
}) {
  const created = await prisma.lessonKit.create({
    data: {
      shareSlug: generateLessonShareSlug(),
      title: data.title.trim(),
      description: data.description?.trim() ?? "",
      scope: "GLOBAL_TEMPLATE",
      liturgicalPeriod: data.liturgicalPeriod ?? null,
      gradeBand: data.gradeBand ?? null,
      tptUrl: data.tptUrl ?? null,
      isFreeSample: data.isFreeSample ?? true,
      familyMode: (data.familyMode ?? { gospelMaxChars: 150 }) as Prisma.InputJsonValue,
      published: data.published ?? false,
      sortOrder: data.sortOrder ?? 0,
      blocks: {
        create: {
          sortOrder: 0,
          type: "MASS_TODAY",
          label: "Today",
          config: {},
        },
      },
    },
    include: kitInclude,
  });
  return serializeLessonKit(created);
}

export async function updateAdminGlobalTemplate(
  id: string,
  data: {
    title?: string;
    description?: string;
    liturgicalPeriod?: string | null;
    gradeBand?: string | null;
    sortOrder?: number;
    published?: boolean;
    tptUrl?: string | null;
    isFreeSample?: boolean;
    familyMode?: FamilyModeConfig;
  },
) {
  const kit = await prisma.lessonKit.findFirst({
    where: { id, scope: "GLOBAL_TEMPLATE" },
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

export async function replaceAdminGlobalTemplateBlocks(
  id: string,
  blocks: {
    sortOrder: number;
    type: LessonBlockType;
    label?: string | null;
    config: LessonBlockConfig;
  }[],
) {
  const kit = await prisma.lessonKit.findFirst({
    where: { id, scope: "GLOBAL_TEMPLATE" },
  });
  if (!kit) return null;

  await prisma.$transaction([
    prisma.lessonBlock.deleteMany({ where: { kitId: id } }),
    ...blocks.map((b) =>
      prisma.lessonBlock.create({
        data: {
          kitId: id,
          sortOrder: b.sortOrder,
          type: b.type,
          label: b.label ?? null,
          config: b.config as Prisma.InputJsonValue,
        },
      }),
    ),
  ]);

  return getAdminGlobalTemplate(id);
}

export async function deleteAdminGlobalTemplate(id: string) {
  const kit = await prisma.lessonKit.findFirst({
    where: { id, scope: "GLOBAL_TEMPLATE" },
  });
  if (!kit) return false;
  await prisma.lessonKit.delete({ where: { id } });
  return true;
}
