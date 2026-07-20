import { HomeLearnHub } from "@/components/HomeLearnHub";
import { todayUtc, toDateKey } from "@/lib/dates";
import { getPublishedHomeSections } from "@/lib/home-sections";
import { formatRomanCalendarCelebration } from "@/lib/liturgical-calendar";
import { fetchMassDaySummaryWithCalendar, fetchMonthCalendar } from "@/lib/mass-source";
import { canonicalForPath } from "@/lib/site-metadata";
import { copyText, getSiteCopyMap } from "@/lib/site-copy";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Home",
  description:
    "Daily Mass, Bible reading, liturgical activities, and games for Catholic children's ministry.",
  ...canonicalForPath("/"),
};

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const today = todayUtc();
  const dateKey = toDateKey(today);
  const year = today.getUTCFullYear();
  const month = today.getUTCMonth() + 1;

  const [calendar, todaySummary, copy, sections] = await Promise.all([
    fetchMonthCalendar(year, month),
    fetchMassDaySummaryWithCalendar(today).catch(() => null),
    getSiteCopyMap(),
    getPublishedHomeSections(),
  ]);

  const calendarCelebration =
    todaySummary &&
    formatRomanCalendarCelebration(
      todaySummary.liturgicalTitle,
      todaySummary.saint,
      todaySummary.feast,
    );

  const dailyMassLabel = copyText(copy, "home.daily_mass.label", "Daily Mass");

  return (
    <HomeLearnHub
      dailyMassLabel={dailyMassLabel}
      calendar={calendar}
      selectedDate={dateKey}
      todayDate={dateKey}
      todayTitle={todaySummary?.liturgicalTitle}
      calendarCelebration={calendarCelebration ?? undefined}
      sections={sections}
    />
  );
}
