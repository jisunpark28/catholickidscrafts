import Link from "next/link";
import { LiturgicalSeasonBanner } from "@/components/LiturgicalSeasonBanner";
import { MassCalendar } from "@/components/MassCalendar";
import { PageHeader } from "@/components/PageHeader";
import { PageShell } from "@/components/PageShell";
import { todayUtc, toDateKey } from "@/lib/dates";
import { fetchMassDaySummary, fetchMonthCalendar } from "@/lib/mass-source";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Daily Mass",
  description: "English Catholic daily Mass readings and liturgical calendar.",
};

export default async function DailyMassPage() {
  const today = todayUtc();
  const dateKey = toDateKey(today);
  const year = today.getUTCFullYear();
  const month = today.getUTCMonth() + 1;

  const [calendar, todaySummary] = await Promise.all([
    fetchMonthCalendar(year, month),
    fetchMassDaySummary(today).catch(() => null),
  ]);

  return (
    <PageShell wide>
      <PageHeader
        title="Daily Mass"
        subtitle="Roman calendar in English (U.S. lectionary). Open a date for readings—full text when provided by the official USCCB RSS feed, otherwise citations with a link to bible.usccb.org."
      >
        <Link
          href={`/mass/${dateKey}`}
          className="inline-block bg-[var(--color-accent)] px-6 py-3 text-sm font-bold text-white transition hover:bg-[var(--color-accent-hover)]"
        >
          Read today&apos;s Mass
        </Link>
      </PageHeader>

      <div className="space-y-8">
        <LiturgicalSeasonBanner
          season={calendar.season}
          todayTitle={todaySummary?.liturgicalTitle}
        />
        <MassCalendar
          initial={calendar}
          selectedDate={dateKey}
          todayDate={dateKey}
        />
      </div>
    </PageShell>
  );
}
