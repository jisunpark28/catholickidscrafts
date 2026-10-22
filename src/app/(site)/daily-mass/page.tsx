import { DailyMassView, type DailyMassReadingRef } from "@/components/daily-mass/DailyMassView";
import { HomePdfShell } from "@/components/home/HomePdfShell";
import { loadFaithJournal } from "@/lib/daily-mass/faith-journal";
import { familyTalkFor } from "@/lib/daily-mass/family-talk";
import { parseGospelCitation } from "@/lib/daily-mass/gospel-citation";
import { deriveVestmentColor } from "@/lib/daily-mass/vestment-color";
import { formatDisplayDate, parseDateParam, todayUtc, toDateKey } from "@/lib/dates";
import { buildHomePdfNav } from "@/lib/home-pdf-nav";
import { getPublishedHomeSections } from "@/lib/home-sections";
import { formatLiturgicalTitleDisplay } from "@/lib/liturgical-calendar";
import { getLiturgicalSeason } from "@/lib/liturgical-season";
import { fetchMassDay, fetchMonthCalendar } from "@/lib/mass-source";
import { livingWithChristReadingUrl } from "@/lib/scripture-links";
import { pageMetadata } from "@/lib/site-metadata";
import { copyText, getSiteCopyMap } from "@/lib/site-copy";
import { usccbReadingsPageUrl } from "@/lib/usccb-rss";
import type { MassDay, MassDaySummary, MonthCalendar } from "@/types/mass";
import type { Metadata } from "next";
import "@/styles/daily-mass.css";

export const metadata: Metadata = pageMetadata({
  title: "Today's Mass Readings for Kids",
  description:
    "Today's Mass readings and Gospel with kid-friendly questions and a Faith Journal. Read with your children or Sunday school class, then talk about it.",
  path: "/daily-mass",
});

export const dynamic = "force-dynamic";

const ORDER = ["first_reading", "psalm", "second_reading", "gospel"] as const;

function addDays(date: Date, days: number): Date {
  return new Date(date.getTime() + days * 86_400_000);
}

function summaryFrom(calendar: MonthCalendar | null, key: string): MassDaySummary | undefined {
  return calendar?.days.find((d) => d.date === key);
}

/** "Holy Gospel ... according to Saint Matthew 22,34-40." -> "Matthew 22:34-40" (Evangelizo fallback titles). */
function tidyCitation(raw: string): string {
  return raw
    .trim()
    .replace(/^.*?according to (?:Saint |St\. )?/i, "")
    .replace(/^(?:A reading from )?(?:the )?(?:Book of (?:the Prophet )?|(?:First |Second )?Letter of (?:Saint )?Paul to the |Letter of Saint )/i, "")
    .replace(/(\d+),(\d+)/g, "$1:$2")
    .replace(/\.$/, "");
}

/** Evangelizo lists several saints with years; keep the first, without dates. */
function firstSaint(raw?: string): string | undefined {
  if (!raw) return undefined;
  const first = raw.split(/\)\s+(?=(?:St\.|Saint|Bl\.|Blessed|Our Lady)\s)/)[0] ?? raw;
  const clean = first.replace(/\s*\([^)]*\d{3,4}[^)]*\)?\s*$/, "").trim();
  return clean || undefined;
}

function readingRefs(day: MassDay | null): DailyMassReadingRef[] {
  if (!day) return [];
  return ORDER.flatMap((kind) => {
    const r = day.readings.find((x) => x.kind === kind && x.title.trim());
    return r ? [{ kind, label: r.label, citation: tidyCitation(r.title) }] : [];
  });
}

export default async function DailyMassPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  const params = await searchParams;
  const requested = params.date ? parseDateParam(params.date) : null;
  const date = requested ?? todayUtc();
  const dateKey = toDateKey(date);
  const dow = date.getUTCDay();
  const sunday = addDays(date, dow === 0 ? 7 : 7 - dow);
  const sundayKey = toDateKey(sunday);

  const [calendar, sundayCalendar, day, sundayDay, copy, sections] = await Promise.all([
    fetchMonthCalendar(date.getUTCFullYear(), date.getUTCMonth() + 1),
    sunday.getUTCMonth() === date.getUTCMonth()
      ? Promise.resolve(null)
      : fetchMonthCalendar(sunday.getUTCFullYear(), sunday.getUTCMonth() + 1).catch(() => null),
    fetchMassDay(date).catch(() => null),
    fetchMassDay(sunday).catch(() => null),
    getSiteCopyMap(),
    getPublishedHomeSections(),
  ]);

  const { groups } = buildHomePdfNav(sections, {
    gallery: "Gallery",
    curriculum: copyText(copy, "global.nav.curriculum", "Curriculum"),
    resources: copyText(copy, "home.hub.cta_resources", "Kids Resources"),
    play: copyText(copy, "global.nav.play_learn", "Play & Learn"),
  });

  const summary: MassDaySummary = day ?? summaryFrom(calendar, dateKey) ?? {
    date: dateKey,
    liturgicalTitle: "",
    rank: "ferial",
  };
  const season = getLiturgicalSeason(date);
  const readings = readingRefs(day);
  const sundaySummary = sundayDay ?? summaryFrom(sundayCalendar ?? calendar, sundayKey);
  const sundayGospel = readingRefs(sundayDay).find((r) => r.kind === "gospel")?.citation;

  const familyTalk = familyTalkFor(dateKey);
  const gospelCitation = readings.find((r) => r.kind === "gospel")?.citation;
  const journalCitation = familyTalk?.gospel ?? gospelCitation;
  const passage = parseGospelCitation(journalCitation);
  const gospelReadHref = passage ? `/bible/read/${passage.bookSlug}/${passage.chapter}` : "/gospel";
  const journal = await loadFaithJournal(journalCitation);

  const shortDate = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", timeZone: "UTC" }).format(sunday);

  return (
    <HomePdfShell groups={groups} dailyMassLabel={copyText(copy, "home.hub.cta_mass", "Daily Mass")}>
      <DailyMassView
        dateKey={dateKey}
        explicitDate={Boolean(requested)}
        displayDate={formatDisplayDate(date)}
        dayTitle={formatLiturgicalTitleDisplay(summary.liturgicalTitle) || season.name}
        seasonName={season.name}
        memorial={summary.rank === "ferial" ? firstSaint(summary.saint) : undefined}
        color={deriveVestmentColor({ ...summary, saint: firstSaint(summary.saint) }, season)}
        readings={readings}
        usccbUrl={usccbReadingsPageUrl(date)}
        familyTalk={familyTalk}
        gospelCitation={gospelCitation}
        gospelReadHref={gospelReadHref}
        journal={journal}
        nextSunday={{
          dateKey: sundayKey,
          shortDate,
          title: formatLiturgicalTitleDisplay(sundaySummary?.liturgicalTitle ?? "") || "Sunday",
          gospel: sundayGospel,
          usccbUrl: usccbReadingsPageUrl(sunday),
          lwcUrl: livingWithChristReadingUrl(sundayKey),
        }}
        calendar={calendar}
      />
    </HomePdfShell>
  );
}
