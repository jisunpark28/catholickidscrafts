import { DailyMassView } from "@/components/daily-mass/DailyMassView";
import { HomePdfShell } from "@/components/home/HomePdfShell";
import { SidebarPagePanel } from "@/components/SidebarPagePanel";
import { JsonLd } from "@/components/seo/JsonLd";
import { loadFaithJournal } from "@/lib/daily-mass/faith-journal";
import type { FaithJournalState } from "@/lib/daily-mass/faith-journal-shared";
import { familyTalkFor } from "@/lib/daily-mass/family-talk";
import { parseGospelCitation } from "@/lib/daily-mass/gospel-citation";
import { readingRefs } from "@/lib/daily-mass/reading-refs";
import { deriveVestmentColor } from "@/lib/daily-mass/vestment-color";
import { daysInMonth, formatDisplayDate, parseDateParam, todayUtc, toDateKey } from "@/lib/dates";
import { buildHomePdfNav } from "@/lib/home-pdf-nav";
import { getPublishedHomeSections } from "@/lib/home-sections";
import { formatLiturgicalTitleDisplay } from "@/lib/liturgical-calendar";
import { getLiturgicalSeason } from "@/lib/liturgical-season";
import { fetchMassDay, fetchMonthCalendar } from "@/lib/mass-source";
import { pageMetadata } from "@/lib/site-metadata";
import { copyText, getSiteCopyMap } from "@/lib/site-copy";
import { usccbReadingsPageUrl } from "@/lib/usccb-rss";
import { breadcrumbNode } from "@/lib/structured-data";
import type { MassDaySummary, MonthCalendar } from "@/types/mass";
import type { Metadata } from "next";
import "@/styles/daily-mass.css";

export const metadata: Metadata = pageMetadata({
  title: "Today's Mass Readings for Kids",
  description:
    "Today's Mass readings and Gospel with kid-friendly questions and a Faith Journal. Read with your children or Sunday school class, then talk about it.",
  path: "/daily-mass",
});

export const dynamic = "force-dynamic";

const GUEST_JOURNAL: FaithJournalState = {
  signedIn: false,
  paid: false,
  total: 0,
  anchor: null,
  entries: [],
};

/** Dates only, when the liturgical month feed fails. No invented titles or readings. */
function structuralCalendar(year: number, month: number): MonthCalendar {
  const mid = new Date(Date.UTC(year, month - 1, 15));
  return {
    year,
    month,
    season: getLiturgicalSeason(mid),
    days: daysInMonth(year, month).map((day) => ({
      date: toDateKey(day),
      liturgicalTitle: "",
      rank: "ferial" as const,
    })),
    source: "",
  };
}

function summaryFrom(calendar: MonthCalendar | null, key: string): MassDaySummary | undefined {
  return calendar?.days.find((day) => day.date === key);
}

/** Evangelizo lists several saints with years; keep the first, without dates. */
function firstSaint(raw?: string): string | undefined {
  if (!raw) return undefined;
  const first = raw.split(/\)\s+(?=(?:St\.|Saint|Bl\.|Blessed|Our Lady)\s)/)[0] ?? raw;
  const clean = first.replace(/\s*\([^)]*\d{3,4}[^)]*\)?\s*$/, "").trim();
  return clean || undefined;
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
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth() + 1;

  const [calendarResult, day, copy, sections] = await Promise.all([
    fetchMonthCalendar(year, month).then(
      (calendar) => ({ calendar, error: false as const }),
      () => ({ calendar: structuralCalendar(year, month), error: true as const }),
    ),
    fetchMassDay(date).catch(() => null),
    getSiteCopyMap(),
    getPublishedHomeSections(),
  ]);

  const { groups } = buildHomePdfNav(sections, {
    gallery: "Gallery",
    curriculum: copyText(copy, "global.nav.curriculum", "Curriculum"),
    resources: copyText(copy, "home.hub.cta_resources", "Kids Resources"),
    play: copyText(copy, "global.nav.play_learn", "Play & Learn"),
  });

  const summary: MassDaySummary = day ?? summaryFrom(calendarResult.calendar, dateKey) ?? {
    date: dateKey,
    liturgicalTitle: "",
    rank: "ferial",
  };
  const season = getLiturgicalSeason(date);
  const readings = readingRefs(day?.readings ?? []);
  const familyTalk = familyTalkFor(dateKey);
  const gospelCitation = readings.find((reading) => reading.kind === "gospel")?.citation;
  const journalCitation = familyTalk?.gospel ?? gospelCitation;
  const passage = parseGospelCitation(journalCitation);
  const gospelReadHref = passage ? `/bible/read/${passage.bookSlug}/${passage.chapter}` : "/daily-mass";
  let journal = GUEST_JOURNAL;
  try {
    journal = await loadFaithJournal(journalCitation);
  } catch {
    journal = GUEST_JOURNAL;
  }

  return (
    <HomePdfShell
      groups={groups}
      dailyMassLabel={copyText(copy, "home.hub.cta_mass", "Daily Mass")}
    >
      <JsonLd nodes={[breadcrumbNode([{ name: "Daily Mass", path: "/daily-mass" }])]} />
      <SidebarPagePanel>
        <DailyMassView
          dateKey={dateKey}
          explicitDate={Boolean(requested)}
          displayDate={formatDisplayDate(date)}
          dayTitle={formatLiturgicalTitleDisplay(summary.liturgicalTitle)}
          seasonName={season.name}
          seasonColor={season.color}
          memorial={summary.rank === "ferial" ? firstSaint(summary.saint) : undefined}
          color={deriveVestmentColor({ ...summary, saint: firstSaint(summary.saint) }, season)}
          readings={readings}
          usccbUrl={day?.usccbPageUrl || usccbReadingsPageUrl(date)}
          familyTalk={familyTalk}
          gospelCitation={gospelCitation}
          gospelReadHref={gospelReadHref}
          journal={journal}
          calendar={calendarResult.calendar}
          calendarError={calendarResult.error}
        />
      </SidebarPagePanel>
    </HomePdfShell>
  );
}
