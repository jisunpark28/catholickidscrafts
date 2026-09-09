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

  return (
    <HomeLearnHub
      copy={{
        heroTitle: copyText(
          copy,
          "home.hub.title",
          "Catholic crafts, prayers, and games for kids",
        ),
        heroSubtitle: copyText(
          copy,
          "home.hub.subtitle",
          "Free liturgical activities for catechists and parents.",
        ),
        ctaMass: copyText(copy, "home.hub.cta_mass", "Daily Mass"),
        ctaResources: copyText(copy, "home.hub.cta_resources", "Kids Resources"),
        dailyMassLabel: copyText(copy, "home.daily_mass.calendar_label", "Today's Mass calendar"),
        dailyMassHint: copyText(
          copy,
          "home.daily_mass.hint",
          "Church calendar and reading links — not a menu of Bible, Play, or Catechesis.",
        ),
        dailyMassShow: copyText(copy, "home.daily_mass.show", "Show"),
        dailyMassHide: copyText(copy, "home.daily_mass.hide", "Hide"),
        exploreHeading: copyText(copy, "home.explore.heading", "Explore"),
      }}
      calendar={calendar}
      selectedDate={dateKey}
      todayDate={dateKey}
      todayTitle={todaySummary?.liturgicalTitle}
      calendarCelebration={calendarCelebration ?? undefined}
      sections={sections}
    />
  );
}
