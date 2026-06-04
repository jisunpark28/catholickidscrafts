import { LiturgicalSeasonBanner } from "@/components/LiturgicalSeasonBanner";
import { MassCalendar } from "@/components/MassCalendar";
import { PageHeader } from "@/components/PageHeader";
import { PageShell } from "@/components/PageShell";
import { todayUtc, toDateKey } from "@/lib/dates";
import { livingWithChristReadingUrl } from "@/lib/scripture-links";
import { fetchMassDaySummary, fetchMonthCalendar } from "@/lib/mass-source";
import { usccbReadingsPageUrl } from "@/lib/usccb-rss";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Daily Mass",
  description: "English Catholic daily Mass calendar with links to official reading sites.",
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

  const lwcToday = livingWithChristReadingUrl(dateKey);
  const usccbToday = usccbReadingsPageUrl(today);

  return (
    <PageShell wide>
      <PageHeader
        title="Daily Mass"
        subtitle="Roman calendar in English. Click a date for Canadian readings, or use the buttons below for today."
      >
        <div className="flex flex-wrap gap-3">
          <a
            href={lwcToday}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-[var(--color-accent)] px-6 py-3 text-sm font-bold text-white transition hover:bg-[var(--color-accent-hover)]"
          >
            Today&apos;s readings (Canada) ↗
          </a>
          <a
            href={usccbToday}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-[var(--color-accent)] px-6 py-3 text-sm font-bold text-white transition hover:bg-[var(--color-accent-hover)]"
          >
            Today&apos;s readings (USA) ↗
          </a>
        </div>
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
