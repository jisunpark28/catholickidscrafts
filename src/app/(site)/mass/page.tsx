import { DailyMassCalendarBlock } from "@/components/DailyMassCalendarBlock";
import { PageHeader } from "@/components/PageHeader";
import { PageShell } from "@/components/PageShell";
import { todayUtc, toDateKey } from "@/lib/dates";
import { copyText, getSiteCopyMap } from "@/lib/site-copy";
import { formatRomanCalendarCelebration } from "@/lib/liturgical-calendar";
import { fetchMassDaySummaryWithCalendar, fetchMonthCalendar } from "@/lib/mass-source";
import { canonicalForPath } from "@/lib/site-metadata";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Daily Mass",
  description: "English Catholic daily Mass calendar with links to official reading sites.",
  ...canonicalForPath("/mass"),
};

export const dynamic = "force-dynamic";

export default async function DailyMassPage() {
  const today = todayUtc();
  const dateKey = toDateKey(today);
  const year = today.getUTCFullYear();
  const month = today.getUTCMonth() + 1;

  const [calendar, todaySummary] = await Promise.all([
    fetchMonthCalendar(year, month),
    fetchMassDaySummaryWithCalendar(today).catch(() => null),
  ]);

  const calendarCelebration =
    todaySummary &&
    formatRomanCalendarCelebration(
      todaySummary.liturgicalTitle,
      todaySummary.saint,
      todaySummary.feast,
    );

  const copy = await getSiteCopyMap();

  const readingLinkLabels = {
    usccb: copyText(copy, "mass.page.cta.usccb", "Today's readings (USCCB)"),
    lwc: copyText(copy, "mass.page.cta.lwc", "Today's readings (Living with Christ)"),
    goodnews: copyText(copy, "mass.page.cta.goodnews", "Today's readings (GoodNews)"),
  };

  return (
    <PageShell wide>
      <PageHeader
        title={copyText(copy, "mass.page.title", "Daily Mass")}
        subtitle={copyText(copy, "mass.page.subtitle", "")}
        programNote={copyText(copy, "mass.page.program_note", "")}
      />

      <div className="space-y-8">
        <DailyMassCalendarBlock
          calendar={calendar}
          selectedDate={dateKey}
          todayDate={dateKey}
          todayTitle={todaySummary?.liturgicalTitle}
          calendarCelebration={calendarCelebration ?? undefined}
          readingLinkLabels={readingLinkLabels}
          readingLinkHint={copyText(copy, "mass.page.link_hint", "")}
        />
      </div>
    </PageShell>
  );
}
