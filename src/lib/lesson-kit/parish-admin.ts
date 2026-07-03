import { randomBytes } from "crypto";
import { prisma } from "@/lib/prisma";
import { generateLessonShareSlug } from "@/lib/lesson-kit/share-slug";
import { serializeLessonKit } from "@/lib/lesson-kit/serialize";
import { duplicateLessonKit } from "@/lib/lesson-kit/db";
import type { Prisma } from "@prisma/client";
import { Prisma as PrismaRuntime } from "@prisma/client";

function slugifyParishName(name: string): string {
  const base = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 48);
  return base || "parish";
}

function randomInviteCode(): string {
  return randomBytes(4).toString("hex").toUpperCase();
}

export async function createParishForDre(familyAccountId: string, name: string) {
  const existing = await prisma.parishMember.findFirst({ where: { familyAccountId } });
  if (existing) return { error: "already_member" as const };

  const trimmed = name.trim();
  if (!trimmed) return { error: "name_required" as const };

  let slug = slugifyParishName(trimmed);
  let inviteCode = randomInviteCode();
  for (let i = 0; i < 5; i++) {
    try {
      const parish = await prisma.parish.create({
        data: {
          name: trimmed,
          slug: i === 0 ? slug : `${slug}-${randomBytes(2).toString("hex")}`,
          inviteCode,
          members: {
            create: { familyAccountId, role: "DRE" },
          },
        },
      });
      return { parish };
    } catch (e) {
      if (e instanceof PrismaRuntime.PrismaClientKnownRequestError && e.code === "P2002") {
        slug = `${slugifyParishName(trimmed)}-${randomBytes(2).toString("hex")}`;
        inviteCode = randomInviteCode();
        continue;
      }
      throw e;
    }
  }
  return { error: "create_failed" as const };
}

export async function createParishKitFromSource(opts: {
  parishId: string;
  sourceId: string;
  title?: string;
}) {
  const source = await prisma.lessonKit.findUnique({ where: { id: opts.sourceId } });
  if (!source) return null;

  const created = await prisma.lessonKit.create({
    data: {
      shareSlug: generateLessonShareSlug(),
      title: opts.title?.trim() || source.title,
      description: source.description,
      scope: "PARISH",
      sourceKitId: source.id,
      parishId: opts.parishId,
      liturgicalPeriod: source.liturgicalPeriod,
      gradeBand: source.gradeBand,
      familyMode: source.familyMode ?? undefined,
      published: true,
      sortOrder: source.sortOrder,
      blocks: {
        create: (
          await prisma.lessonBlock.findMany({
            where: { kitId: source.id },
            orderBy: { sortOrder: "asc" },
          })
        ).map((b) => ({
          sortOrder: b.sortOrder,
          type: b.type,
          label: b.label,
          config: b.config as Prisma.InputJsonValue,
        })),
      },
    },
    include: { blocks: { orderBy: { sortOrder: "asc" } } },
  });

  return serializeLessonKit(created);
}

export async function publishPersonalKitToParish(opts: {
  personalKitId: string;
  parishId: string;
  familyAccountId: string;
}) {
  const kit = await prisma.lessonKit.findFirst({
    where: {
      id: opts.personalKitId,
      familyAccountId: opts.familyAccountId,
      scope: "PERSONAL",
    },
  });
  if (!kit) return null;
  return createParishKitFromSource({
    parishId: opts.parishId,
    sourceId: kit.id,
    title: kit.title,
  });
}

export async function listParishPlans(parishId: string, limit = 12) {
  return prisma.parishPlan.findMany({
    where: { parishId },
    orderBy: [{ weekStart: "asc" }, { sortOrder: "asc" }],
    take: limit,
    include: { lessonKit: { select: { id: true, title: true, shareSlug: true } } },
  });
}

export async function upsertParishPlan(opts: {
  parishId: string;
  weekStart: string;
  title: string;
  lessonKitId?: string | null;
  notes?: string;
}) {
  const existing = await prisma.parishPlan.findFirst({
    where: { parishId: opts.parishId, weekStart: opts.weekStart },
  });

  if (existing) {
    return prisma.parishPlan.update({
      where: { id: existing.id },
      data: {
        title: opts.title,
        lessonKitId: opts.lessonKitId ?? null,
        notes: opts.notes ?? "",
      },
      include: { lessonKit: { select: { id: true, title: true, shareSlug: true } } },
    });
  }

  return prisma.parishPlan.create({
    data: {
      parishId: opts.parishId,
      weekStart: opts.weekStart,
      title: opts.title,
      lessonKitId: opts.lessonKitId ?? null,
      notes: opts.notes ?? "",
    },
    include: { lessonKit: { select: { id: true, title: true, shareSlug: true } } },
  });
}

export async function duplicateGlobalToParish(parishId: string, templateId: string) {
  return duplicateLessonKit({
    sourceId: templateId,
    parishId,
    scope: "PARISH",
    titleSuffix: "",
  });
}
