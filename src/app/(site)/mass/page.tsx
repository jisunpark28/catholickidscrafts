import { MassCalendar } from "@/components/MassCalendar";
import { PageShell } from "@/components/PageShell";
import { todayUtc, toDateKey } from "@/lib/dates";
import { copyText, getSiteCopyMap } from "@/lib/site-copy";
import { fetchMonthCalendar } from "@/lib/mass-source";
import { canonicalForPath } from "@/lib/site-metadata";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Daily Mass",
  description: "English Catholic daily Mass calendar with links to official reading sites.",
  ...canonicalForPath("/mass"),
};

export default async function DailyMassPage() {
  const today = todayUtc();
  const dateKey = toDateKey(today);
  const year = today.getUTCFullYear();
  const month = today.getUTCMonth() + 1;

  const [calendar, copy] = await Promise.all([
    fetchMonthCalendar(year, month),
    getSiteCopyMap(),
  ]);

  const massLabel = copyText(copy, "mass.page.title", "Daily Mass");

  return (
    <PageShell wide>
      <h1 className="mb-8 text-3xl text-[var(--color-ink)] sm:text-4xl">
        {massLabel} – {calendar.season.name}
      </h1>
      <MassCalendar initial={calendar} selectedDate={dateKey} todayDate={dateKey} />
    </PageShell>
  );
}
