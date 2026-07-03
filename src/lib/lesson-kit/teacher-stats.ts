import { prisma } from "@/lib/prisma";
import { formatWeekLabel, weekDateKeysUtc, weekStartSundayUtc } from "@/lib/lesson-kit/week";

export type StudentLessonStat = {
  subProfileId: string;
  displayName: string;
  completionsTotal: number;
  recentCompletions: {
    kitTitle: string;
    shareSlug: string;
    completedAt: string;
  }[];
  thisWeekAssignment: {
    kitTitle: string;
    shareSlug: string;
    completed: boolean;
    note: string;
  } | null;
};

export type KitWeeklyOpenStat = {
  kitId: string;
  title: string;
  shareSlug: string;
  weekOpens: number;
  isPersonal: boolean;
};

export type TeacherLessonStats = {
  weekStart: string;
  weekLabel: string;
  weekTotalOpens: number;
  kitOpens: KitWeeklyOpenStat[];
  students: StudentLessonStat[];
};

const RECENT_PER_STUDENT = 3;

type AssignmentRow = {
  subProfileId: string | null;
  note: string;
  completedAt: Date | null;
  lessonKit: { id: string; title: string; shareSlug: string };
};

function assignmentForStudent(subProfileId: string, assignments: AssignmentRow[]) {
  const direct = assignments.find((a) => a.subProfileId === subProfileId);
  if (direct) {
    return {
      kitTitle: direct.lessonKit.title,
      shareSlug: direct.lessonKit.shareSlug,
      completed: direct.completedAt !== null,
      note: direct.note,
    };
  }
  const classWide = assignments.find((a) => a.subProfileId === null);
  if (classWide) {
    return {
      kitTitle: classWide.lessonKit.title,
      shareSlug: classWide.lessonKit.shareSlug,
      completed: classWide.completedAt !== null,
      note: classWide.note,
    };
  }
  return null;
}

export async function loadTeacherLessonStats(
  familyAccountId: string,
): Promise<TeacherLessonStats> {
  const weekStart = weekStartSundayUtc();
  const dateKeys = weekDateKeysUtc(weekStart);

  const [subs, personalKits, assignments] = await Promise.all([
    prisma.subProfile.findMany({
      where: { familyAccountId, active: true },
      select: { id: true, displayName: true },
      orderBy: { displayName: "asc" },
    }),
    prisma.lessonKit.findMany({
      where: { familyAccountId, scope: "PERSONAL" },
      select: { id: true, title: true, shareSlug: true },
      orderBy: { title: "asc" },
    }),
    prisma.lessonAssignment.findMany({
      where: { familyAccountId, weekStart },
      include: {
        lessonKit: { select: { id: true, title: true, shareSlug: true } },
      },
    }),
  ]);

  const subIds = subs.map((s) => s.id);
  const personalKitIds = new Set(personalKits.map((k) => k.id));
  const trackedKitIds = [
    ...new Set([
      ...personalKits.map((k) => k.id),
      ...assignments.map((a) => a.lessonKit.id),
    ]),
  ];

  const [progressRows, openRows] = await Promise.all([
    subIds.length > 0
      ? prisma.lessonKitProgress.findMany({
          where: { subProfileId: { in: subIds } },
          orderBy: { completedAt: "desc" },
          include: {
            lessonKit: { select: { title: true, shareSlug: true } },
          },
        })
      : Promise.resolve([]),
    trackedKitIds.length > 0
      ? prisma.lessonKitOpen.findMany({
          where: {
            kitId: { in: trackedKitIds },
            dateKey: { in: dateKeys },
          },
          select: { kitId: true, opens: true },
        })
      : Promise.resolve([]),
  ]);

  const kitMeta = new Map<string, { title: string; shareSlug: string; isPersonal: boolean }>();
  for (const kit of personalKits) {
    kitMeta.set(kit.id, { title: kit.title, shareSlug: kit.shareSlug, isPersonal: true });
  }
  for (const a of assignments) {
    if (!kitMeta.has(a.lessonKit.id)) {
      kitMeta.set(a.lessonKit.id, {
        title: a.lessonKit.title,
        shareSlug: a.lessonKit.shareSlug,
        isPersonal: personalKitIds.has(a.lessonKit.id),
      });
    }
  }

  const opensByKit = new Map<string, number>();
  for (const row of openRows) {
    opensByKit.set(row.kitId, (opensByKit.get(row.kitId) ?? 0) + row.opens);
  }

  const kitOpens: KitWeeklyOpenStat[] = [...kitMeta.entries()]
    .map(([kitId, meta]) => ({
      kitId,
      title: meta.title,
      shareSlug: meta.shareSlug,
      weekOpens: opensByKit.get(kitId) ?? 0,
      isPersonal: meta.isPersonal,
    }))
    .sort((a, b) => b.weekOpens - a.weekOpens || a.title.localeCompare(b.title));

  const weekTotalOpens = kitOpens.reduce((sum, k) => sum + k.weekOpens, 0);

  const progressBySub = new Map<string, typeof progressRows>();
  for (const row of progressRows) {
    if (!row.subProfileId) continue;
    const list = progressBySub.get(row.subProfileId) ?? [];
    list.push(row);
    progressBySub.set(row.subProfileId, list);
  }

  const students: StudentLessonStat[] = subs.map((sub) => {
    const rows = progressBySub.get(sub.id) ?? [];
    return {
      subProfileId: sub.id,
      displayName: sub.displayName,
      completionsTotal: rows.length,
      recentCompletions: rows.slice(0, RECENT_PER_STUDENT).map((r) => ({
        kitTitle: r.lessonKit.title,
        shareSlug: r.lessonKit.shareSlug,
        completedAt: r.completedAt.toISOString(),
      })),
      thisWeekAssignment: assignmentForStudent(sub.id, assignments),
    };
  });

  return {
    weekStart,
    weekLabel: formatWeekLabel(weekStart),
    weekTotalOpens,
    kitOpens,
    students,
  };
}
