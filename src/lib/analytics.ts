import { prisma } from "@/lib/prisma";

/** UTC calendar date YYYY-MM-DD */
export function utcDayKey(date = new Date()): string {
  return date.toISOString().slice(0, 10);
}

export async function recordPublicVisit(visitorId: string): Promise<void> {
  const date = utcDayKey();

  await prisma.trafficDay.upsert({
    where: { date },
    create: { date, pageViews: 1, uniqueVisitors: 0 },
    update: { pageViews: { increment: 1 } },
  });

  try {
    await prisma.trafficVisitorDay.create({
      data: { visitorId, date },
    });
    await prisma.trafficDay.update({
      where: { date },
      data: { uniqueVisitors: { increment: 1 } },
    });
  } catch {
    // Already counted this visitor today (composite primary key).
  }
}

export type TrafficSummary = {
  today: { pageViews: number; uniqueVisitors: number };
  last7Days: { pageViews: number; uniqueVisitors: number };
  allTime: { pageViews: number; uniqueVisitors: number };
};

const emptySummary: TrafficSummary = {
  today: { pageViews: 0, uniqueVisitors: 0 },
  last7Days: { pageViews: 0, uniqueVisitors: 0 },
  allTime: { pageViews: 0, uniqueVisitors: 0 },
};

export async function getTrafficSummary(): Promise<TrafficSummary> {
  try {
    return await loadTrafficSummary();
  } catch (e) {
    console.error("getTrafficSummary", e);
    return emptySummary;
  }
}

async function loadTrafficSummary(): Promise<TrafficSummary> {
  const today = utcDayKey();
  const sevenDaysAgo = utcDayKey(new Date(Date.now() - 6 * 24 * 60 * 60 * 1000));

  const [todayRow, weekRows, allRows] = await Promise.all([
    prisma.trafficDay.findUnique({ where: { date: today } }),
    prisma.trafficDay.findMany({
      where: { date: { gte: sevenDaysAgo } },
    }),
    prisma.trafficDay.aggregate({
      _sum: { pageViews: true, uniqueVisitors: true },
    }),
  ]);

  const sumWeek = weekRows.reduce(
    (acc, row) => ({
      pageViews: acc.pageViews + row.pageViews,
      uniqueVisitors: acc.uniqueVisitors + row.uniqueVisitors,
    }),
    { pageViews: 0, uniqueVisitors: 0 },
  );

  return {
    today: {
      pageViews: todayRow?.pageViews ?? 0,
      uniqueVisitors: todayRow?.uniqueVisitors ?? 0,
    },
    last7Days: sumWeek,
    allTime: {
      pageViews: allRows._sum.pageViews ?? 0,
      uniqueVisitors: allRows._sum.uniqueVisitors ?? 0,
    },
  };
}
