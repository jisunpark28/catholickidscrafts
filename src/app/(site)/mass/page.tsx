import { LiturgicalSeasonBanner } from "@/components/LiturgicalSeasonBanner";
import { MassCalendar } from "@/components/MassCalendar";
import { PageHeader } from "@/components/PageHeader";
import { PageShell } from "@/components/PageShell";
import { todayUtc, toDateKey } from "@/lib/dates";
import { copyText, getSiteCopyMap } from "@/lib/site-copy";
import { livingWithChristReadingUrl } from "@/lib/scripture-links";
import { fetchMassDaySummary, fetchMonthCalendar } from "@/lib/mass-source";
import { canonicalForPath } from "@/lib/site-metadata";
import { usccbReadingsPageUrl } from "@/lib/usccb-rss";
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
    fetchMassDaySummary(today).catch(() => null),
  ]);

  const lwcToday = livingWithChristReadingUrl(dateKey);
  const usccbToday = usccbReadingsPageUrl(today);
  const copy = await getSiteCopyMap();

  return (
    <PageShell wide>
      <PageHeader
        title={copyText(copy, "mass.page.title", "Daily Mass")}
        subtitle={copyText(copy, "mass.page.subtitle", "")}
        programNote={copyText(copy, "mass.page.program_note", "")}
      >
        <div className="flex flex-wrap gap-3">
          <a
            href={usccbToday}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-[var(--color-accent)] px-6 py-3 text-sm font-bold text-white transition hover:bg-[var(--color-accent-hover)]"
          >
            {copyText(copy, "mass.page.cta.usccb", "Today's readings (USCCB) ↗")}
          </a>
          <a
            href={lwcToday}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-[var(--color-accent)] px-6 py-3 text-sm font-bold text-white transition hover:bg-[var(--color-accent-hover)]"
          >
            {copyText(copy, "mass.page.cta.lwc", "Today's readings (Living with Christ) ↗")}
          </a>
        </div>
        <p className="mt-3 text-sm text-[var(--color-muted)]">
          {copyText(copy, "mass.page.link_hint", "")}
        </p>
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
