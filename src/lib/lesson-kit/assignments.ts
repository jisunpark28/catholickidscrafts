import { getLessonKitByShareSlug } from "@/lib/lesson-kit/db";
import { weekStartSundayUtc } from "@/lib/lesson-kit/week";
import type { ReaderKey } from "@/lib/bible/reader";
import { prisma } from "@/lib/prisma";

export type LessonAssignmentDto = {
  id: string;
  weekStart: string;
  note: string;
  completedAt: string | null;
  subProfileId: string | null;
  subDisplayName: string | null;
  kit: {
    id: string;
    title: string;
    shareSlug: string;
    description: string;
    stepCount: number;
    estMinutes: number;
  };
};

function mapAssignment(row: {
  id: string;
  weekStart: string;
  note: string;
  completedAt: Date | null;
  subProfileId: string | null;
  subProfile: { displayName: string } | null;
  lessonKit: {
    id: string;
    title: string;
    shareSlug: string;
    description: string;
    blocks: { id: string }[];
  };
}): LessonAssignmentDto {
  const stepCount = row.lessonKit.blocks.length;
  return {
    id: row.id,
    weekStart: row.weekStart,
    note: row.note,
    completedAt: row.completedAt?.toISOString() ?? null,
    subProfileId: row.subProfileId,
    subDisplayName: row.subProfile?.displayName ?? null,
    kit: {
      id: row.lessonKit.id,
      title: row.lessonKit.title,
      shareSlug: row.lessonKit.shareSlug,
      description: row.lessonKit.description,
      stepCount,
      estMinutes: Math.max(10, stepCount * 7),
    },
  };
}

const assignmentInclude = {
  subProfile: { select: { displayName: true } },
  lessonKit: { include: { blocks: { select: { id: true } } } },
} as const;

export async function listFamilyAssignments(
  familyAccountId: string,
  weekStart = weekStartSundayUtc(),
) {
  const rows = await prisma.lessonAssignment.findMany({
    where: { familyAccountId, weekStart },
    orderBy: { createdAt: "asc" },
    include: assignmentInclude,
  });
  return rows.map(mapAssignment);
}

export async function createFamilyAssignment(opts: {
  familyAccountId: string;
  lessonKitId: string;
  subProfileId?: string | null;
  weekStart?: string;
  note?: string;
}) {
  const weekStart = opts.weekStart ?? weekStartSundayUtc();
  const kit = await prisma.lessonKit.findFirst({
    where: {
      id: opts.lessonKitId,
      OR: [{ familyAccountId: opts.familyAccountId }, { scope: "GLOBAL_TEMPLATE" }],
    },
  });
  if (!kit) return null;

  if (opts.subProfileId) {
    const sub = await prisma.subProfile.findFirst({
      where: { id: opts.subProfileId, familyAccountId: opts.familyAccountId, active: true },
    });
    if (!sub) return null;
  }

  const existing = await prisma.lessonAssignment.findFirst({
    where: {
      lessonKitId: opts.lessonKitId,
      familyAccountId: opts.familyAccountId,
      weekStart,
      subProfileId: opts.subProfileId ?? null,
    },
  });

  const row = existing
    ? await prisma.lessonAssignment.update({
        where: { id: existing.id },
        data: { note: opts.note ?? "" },
        include: assignmentInclude,
      })
    : await prisma.lessonAssignment.create({
        data: {
          lessonKitId: opts.lessonKitId,
          familyAccountId: opts.familyAccountId,
          subProfileId: opts.subProfileId ?? null,
          weekStart,
          note: opts.note ?? "",
        },
        include: assignmentInclude,
      });

  return mapAssignment(row);
}

export async function deleteFamilyAssignment(id: string, familyAccountId: string) {
  const row = await prisma.lessonAssignment.findFirst({
    where: { id, familyAccountId },
  });
  if (!row) return false;
  await prisma.lessonAssignment.delete({ where: { id } });
  return true;
}

export async function getThisWeekAssignmentForReader(reader: ReaderKey | null) {
  if (!reader || reader.type === "guest") return null;

  const weekStart = weekStartSundayUtc();
  const familyAccountId = reader.type === "owner" ? reader.familyAccountId : undefined;
  const subProfileId = reader.type === "sub" ? reader.subProfileId : undefined;

  let familyId = familyAccountId;
  if (subProfileId && !familyId) {
    const sub = await prisma.subProfile.findUnique({
      where: { id: subProfileId },
      select: { familyAccountId: true },
    });
    familyId = sub?.familyAccountId;
  }
  if (!familyId) return null;

  const row = await prisma.lessonAssignment.findFirst({
    where: {
      familyAccountId: familyId,
      weekStart,
      completedAt: null,
      OR:
        reader.type === "sub"
          ? [{ subProfileId: reader.subProfileId }, { subProfileId: null }]
          : [{ subProfileId: null }],
    },
    orderBy: { createdAt: "asc" },
    include: assignmentInclude,
  });

  if (!row) return null;
  return mapAssignment(row);
}

export async function markAssignmentCompleteForReader(
  shareSlug: string,
  reader: ReaderKey | null,
) {
  const kit = await getLessonKitByShareSlug(shareSlug);
  if (!kit) return false;

  await prisma.lessonKitProgress.create({
    data: {
      lessonKitId: kit.id,
      familyAccountId: reader?.type === "owner" ? reader.familyAccountId : undefined,
      subProfileId: reader?.type === "sub" ? reader.subProfileId : undefined,
      guestId: reader?.type === "guest" ? reader.guestId : undefined,
    },
  });

  if (!reader || reader.type === "guest") return true;

  const weekStart = weekStartSundayUtc();
  let familyId = reader.type === "owner" ? reader.familyAccountId : undefined;
  const subId = reader.type === "sub" ? reader.subProfileId : undefined;
  if (subId && !familyId) {
    const sub = await prisma.subProfile.findUnique({
      where: { id: subId },
      select: { familyAccountId: true },
    });
    familyId = sub?.familyAccountId;
  }
  if (!familyId) return true;

  await prisma.lessonAssignment.updateMany({
    where: {
      lessonKitId: kit.id,
      familyAccountId: familyId,
      weekStart,
      completedAt: null,
      OR: [{ subProfileId: subId ?? null }, { subProfileId: null }],
    },
    data: { completedAt: new Date() },
  });

  return true;
}

export async function listAssignableKits(familyAccountId: string) {
  const kits = await prisma.lessonKit.findMany({
    where: {
      OR: [
        { familyAccountId, scope: "PERSONAL" },
        { scope: "GLOBAL_TEMPLATE", published: true },
      ],
    },
    orderBy: { title: "asc" },
    include: { blocks: { select: { id: true } } },
  });

  return kits.map((k) => ({
    id: k.id,
    title: k.title,
    shareSlug: k.shareSlug,
    scope: k.scope,
    stepCount: k.blocks.length,
  }));
}
