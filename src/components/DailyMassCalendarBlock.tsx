import { LiturgicalSeasonBanner } from "@/components/LiturgicalSeasonBanner";
import { MassCalendar } from "@/components/MassCalendar";
import { parseDateParam } from "@/lib/dates";
import {
  goodNewsDailyMissaUrl,
  livingWithChristReadingUrl,
} from "@/lib/scripture-links";
import { usccbReadingsPageUrl } from "@/lib/usccb-rss";
import type { MonthCalendar } from "@/types/mass";

type ReadingLinkLabels = {
  usccb: string;
  lwc: string;
  goodnews: string;
};

const defaultReadingLabels: ReadingLinkLabels = {
  usccb: "Today's readings (USCCB)",
  lwc: "Today's readings (Living with Christ)",
  goodnews: "Today's readings (GoodNews)",
};

type Props = {
  calendar: MonthCalendar;
  selectedDate: string;
  todayDate: string;
  todayTitle?: string;
  calendarCelebration?: string;
  readingLinkLabels?: ReadingLinkLabels;
  readingLinkHint?: string;
  /** Home Daily Mass panel — wide layout with enlarged text. */
  large?: boolean;
};

function buildReadingLinks(
  todayDate: string,
  labels: ReadingLinkLabels,
): { href: string; label: string }[] {
  const date = parseDateParam(todayDate);
  if (!date) return [];

  return [
    { href: usccbReadingsPageUrl(date), label: labels.usccb },
    { href: livingWithChristReadingUrl(todayDate), label: labels.lwc },
    { href: goodNewsDailyMissaUrl(todayDate), label: labels.goodnews },
  ];
}

/** Liturgical season banner + month calendar (shared by /mass and home Daily Mass panel). */
export function DailyMassCalendarBlock({
  calendar,
  selectedDate,
  todayDate,
  todayTitle,
  calendarCelebration,
  readingLinkLabels = defaultReadingLabels,
  readingLinkHint,
  large = false,
}: Props) {
  const readingLinks = buildReadingLinks(todayDate, readingLinkLabels);

  return (
    <div className="space-y-8">
      <LiturgicalSeasonBanner
        season={calendar.season}
        todayTitle={todayTitle}
        calendarCelebration={calendarCelebration}
        readingLinks={readingLinks}
        readingLinkHint={readingLinkHint}
        large={large}
      />
      <MassCalendar
        initial={calendar}
        selectedDate={selectedDate}
        todayDate={todayDate}
        large={large}
      />
    </div>
  );
}
