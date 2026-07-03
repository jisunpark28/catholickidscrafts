import { serializeLessonKit, type LessonKitWithBlocks } from "@/lib/lesson-kit/serialize";
import { weekStartSundayUtc } from "@/lib/lesson-kit/week";
import { prisma } from "@/lib/prisma";
import type { LessonKitScope } from "@prisma/client";

export type SundayPinKitDto = {
  id: string;
  title: string;
  shareSlug: string;
  description: string;
  stepCount: number;
  estMinutes: number;
  scope: LessonKitScope;
  gradeBand: string | null;
  editHref: string | null;
};

export type SundayPinDto = {
  weekStart: string;
  pinnedWeekStart: string | null;
  stale: boolean;
  kit: SundayPinKitDto | null;
};

const kitInclude = { blocks: { orderBy: { sortOrder: "asc" as const } } };

function editHrefForKit(kit: { id: string; scope: LessonKitScope }): string | null {
  if (kit.scope === "PERSONAL") return `/program/kit/${kit.id}`;
  return null;
}

function toPinKitDto(kit: LessonKitWithBlocks): SundayPinKitDto {
  const dto = serializeLessonKit(kit);
  return {
    id: dto.id,
    title: dto.title,
    shareSlug: dto.shareSlug,
    description: dto.description,
    stepCount: dto.stepCount,
    estMinutes: dto.estMinutes,
    scope: dto.scope,
    gradeBand: dto.gradeBand,
    editHref: editHrefForKit(dto),
  };
}

export async function canPinLessonKit(
  lessonKitId: string,
  familyAccountId: string,
): Promise<boolean> {
  const kit = await prisma.lessonKit.findFirst({
    where: {
      id: lessonKitId,
      OR: [
        { familyAccountId, scope: "PERSONAL" },
        { scope: "GLOBAL_TEMPLATE", published: true },
      ],
    },
    select: { id: true },
  });
  return Boolean(kit);
}

export async function getTeacherSundayPin(familyAccountId: string): Promise<SundayPinDto> {
  const weekStart = weekStartSundayUtc();
  const account = await prisma.familyAccount.findUnique({
    where: { id: familyAccountId },
    select: {
      sundayWeekStart: true,
      sundayLessonKit: { include: kitInclude },
    },
  });

  if (!account?.sundayLessonKit) {
    return {
      weekStart,
      pinnedWeekStart: account?.sundayWeekStart ?? null,
      stale: false,
      kit: null,
    };
  }

  const pinnedWeekStart = account.sundayWeekStart;
  const stale = Boolean(pinnedWeekStart && pinnedWeekStart !== weekStart);

  return {
    weekStart,
    pinnedWeekStart,
    stale,
    kit: toPinKitDto(account.sundayLessonKit),
  };
}

export async function setTeacherSundayPin(
  familyAccountId: string,
  lessonKitId: string,
): Promise<SundayPinDto | null> {
  const allowed = await canPinLessonKit(lessonKitId, familyAccountId);
  if (!allowed) return null;

  const weekStart = weekStartSundayUtc();
  await prisma.familyAccount.update({
    where: { id: familyAccountId },
    data: {
      sundayLessonKitId: lessonKitId,
      sundayWeekStart: weekStart,
    },
  });

  return getTeacherSundayPin(familyAccountId);
}

export async function clearTeacherSundayPin(familyAccountId: string): Promise<SundayPinDto> {
  await prisma.familyAccount.update({
    where: { id: familyAccountId },
    data: {
      sundayLessonKitId: null,
      sundayWeekStart: null,
    },
  });
  return getTeacherSundayPin(familyAccountId);
}
