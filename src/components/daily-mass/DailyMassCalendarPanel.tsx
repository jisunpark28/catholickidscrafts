"use client";

import { textFromCopy, useSiteCopy } from "@/components/SiteCopyProvider";
import { GospelReadingCalendar } from "@/components/gospel/GospelReadingCalendar";
import type { ReadingRef } from "@/lib/daily-mass/reading-refs";
import { deriveVestmentColor, type VestmentColorId } from "@/lib/daily-mass/vestment-color";
import { getLiturgicalSeason } from "@/lib/liturgical-season";
import type { LiturgicalSeasonInfo, MassDaySummary, MonthCalendar } from "@/types/mass";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";

const FOCUS =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#d35400]";

const BADGE: Record<LiturgicalSeasonInfo["color"], string> = {
  green: "bg-[#e7f5ec] text-[#1b7a3a]",
  purple: "bg-[#f3e8ff] text-[#5b21b6]",
  white: "bg-[#f7eee3] text-[#92400e]",
  red: "bg-[#fee2e2] text-[#991b1b]",
  rose: "bg-[#fce7f3] text-[#9d174d]",
};

/**
 * Day-number colors on the white calendar cells (all at least 4.5:1 contrast on white).
 * White days use a warm gold so the number stays readable.
 */
const DAY_TEXT: Record<VestmentColorId, { label: string; textHex: string }> = {
  green: { label: "Green", textHex: "#15803d" },
  violet: { label: "Violet", textHex: "#6d28d9" },
  white: { label: "White", textHex: "#8f6d12" },
  red: { label: "Red", textHex: "#b91c1c" },
  rose: { label: "Rose", textHex: "#be185d" },
};

const MONTH_ERROR = "This month couldn't be loaded.";

type Props = {
  initial: MonthCalendar;
  calendarError: boolean;
  selectedDate: string;
  /** Device date; null until the browser has read it. */
  todayDate: string | null;
  signedIn: boolean;
  displayDate: string;
  /** Celebration title; hidden when empty. */
  dayTitle: string;
  seasonName: string;
  seasonColor: LiturgicalSeasonInfo["color"];
  memorial?: string;
  readings: ReadingRef[];
  usccbUrl: string;
  /** Collapse arrow, shown at the top-right of the month header. */
  headerEnd?: ReactNode;
  /** Bumped after a praise sticker is saved so the calendar reloads its stickers. */
  stickerVersion?: number;
};

function monthKey(year: number, month: number): string {
  return `${year}-${month}`;
}

function colorFor(summary: MassDaySummary | undefined, dateKey: string) {
  const [y, m, d] = dateKey.split("-").map(Number);
  const season = getLiturgicalSeason(new Date(Date.UTC(y!, m! - 1, d!)));
  const day = summary ?? { liturgicalTitle: "", rank: "ferial" as const };
  return deriveVestmentColor(day, season);
}

/** Daily Mass: Today's Gospel calendar with liturgical colors, then the picked day's readings. */
export function DailyMassCalendarPanel({
  initial,
  calendarError,
  selectedDate,
  todayDate,
  signedIn,
  displayDate,
  dayTitle,
  seasonName,
  seasonColor,
  memorial,
  readings,
  usccbUrl,
  headerEnd,
  stickerVersion = 0,
}: Props) {
  const copy = useSiteCopy();
  const t = (key: string, fallback: string) => textFromCopy(copy, key, fallback);
  const router = useRouter();
  const [months, setMonths] = useState<Record<string, MonthCalendar>>(() =>
    calendarError ? {} : { [monthKey(initial.year, initial.month)]: initial },
  );
  const [view, setView] = useState({ year: initial.year, month: initial.month });
  const [loading, setLoading] = useState(false);
  const [monthError, setMonthError] = useState(false);
  const [pendingDate, setPendingDate] = useState<string | null>(null);
  const completed = useMemo<string[]>(() => [], []);

  useEffect(() => {
    setPendingDate(null);
    setView({ year: Number(selectedDate.slice(0, 4)), month: Number(selectedDate.slice(5, 7)) });
  }, [selectedDate]);

  useEffect(() => {
    if (calendarError) return;
    setMonths((prev) => ({ ...prev, [monthKey(initial.year, initial.month)]: initial }));
  }, [calendarError, initial]);

  useEffect(() => {
    const key = monthKey(view.year, view.month);
    if (months[key]) {
      setMonthError(false);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setMonthError(false);
    fetch(`/api/mass/calendar/${view.year}/${view.month}`)
      .then(async (res) => {
        const data = (await res.json().catch(() => null)) as MonthCalendar | null;
        if (cancelled) return;
        if (!res.ok || !data || !Array.isArray(data.days) || data.year !== view.year || data.month !== view.month) {
          setMonthError(true);
          return;
        }
        setMonths((prev) => ({ ...prev, [key]: data }));
      })
      .catch(() => {
        if (!cancelled) setMonthError(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [months, view.month, view.year]);

  const summaries = useMemo(() => {
    const map = new Map<string, MassDaySummary>();
    for (const calendar of Object.values(months)) for (const day of calendar.days) map.set(day.date, day);
    return { map, loaded: new Set(Object.keys(months)) };
  }, [months]);

  const dayMark = useCallback(
    (dateKey: string) => {
      const key = monthKey(Number(dateKey.slice(0, 4)), Number(dateKey.slice(5, 7)));
      if (!summaries.loaded.has(key)) return undefined;
      const summary = summaries.map.get(dateKey);
      const color = DAY_TEXT[summary?.color ?? colorFor(summary, dateKey).id];
      return { textHex: color.textHex, label: `Liturgical color: ${color.label}` };
    },
    [summaries],
  );

  function openDate(date: string) {
    if (date === selectedDate) return;
    setPendingDate(date);
    router.push(`/daily-mass?date=${date}`, { scroll: false });
  }

  const shownDate = pendingDate ?? selectedDate;
  const today = todayDate ?? selectedDate;

  const todayButton = (
    <button
      type="button"
      onClick={() => openDate(today)}
      className="rounded-xl border border-[#e8e0d6] bg-white px-3 py-1.5 text-xs font-semibold hover:border-[#d9cfc3]"
    >
      {t("daily_mass.today.label", "Today")}
    </button>
  );

  return (
    <div className="dm-cal-wrap w-full">
      <GospelReadingCalendar
        key={stickerVersion}
        signedIn={signedIn}
        initialCompleted={completed}
        todayDate={today}
        selectedDate={shownDate}
        selectAnyDay
        onSelectDate={openDate}
        onMonthChange={(year, month) => setView({ year, month })}
        dayMark={dayMark}
        busy={loading}
        headerEnd={
          <>
            {todayButton}
            {headerEnd}
          </>
        }
      />

      {monthError ? (
        <p className="mt-2 px-1 text-xs text-[#9a3412]" aria-live="polite">
          {MONTH_ERROR}
        </p>
      ) : null}

      <div
        className="dm-card mt-4 rounded-2xl border border-[#e8e0d6] bg-white px-4 py-4 shadow-sm sm:px-6 sm:py-5"
        aria-busy={Boolean(pendingDate)}
      >
        <p className="dm-muted m-0 text-[0.95em] font-semibold text-[#4b5563]">{displayDate}</p>
        {dayTitle ? (
          <h2 className="dm-ink m-0 mt-1 text-[1.35em] font-bold leading-tight text-[#1c1c1c] sm:text-[1.5em]">{dayTitle}</h2>
        ) : null}
        {seasonName ? (
          <span className={`dm-badge mt-2 inline-flex items-center rounded-full px-2.5 py-0.5 text-[0.75em] font-semibold ${BADGE[seasonColor]}`}>
            {seasonName}
          </span>
        ) : null}
        {memorial ? (
          <p className="dm-muted mb-0 mt-2 text-[0.875em] text-[#4b5563]">
            {t("daily_mass.today.memorial", "Optional memorial")}: {memorial}
          </p>
        ) : null}

        {readings.length > 0 ? (
          <ul aria-label={t("daily_mass.readings.title", "Today's readings")} className="m-0 mt-4 list-none space-y-1.5 p-0">
            {readings.map((reading, index) => (
              <li key={`${reading.kind}-${reading.citation}-${index}`} className="flex flex-wrap gap-x-3 text-[0.95em] leading-snug">
                <span className="dm-muted text-[#4b5563]">{reading.label}</span>
                <span className="dm-ink font-medium text-[#1c1c1c]">{reading.citation}</span>
              </li>
            ))}
          </ul>
        ) : null}
        {pendingDate ? (
          <p className="dm-muted m-0 mt-3 text-[0.75em] text-[#9ca3af]" aria-live="polite">
            Loading readings…
          </p>
        ) : null}

        {usccbUrl ? (
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <a
              href={usccbUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={`dm-pill inline-flex items-center rounded-full border border-[#e7e3de] bg-white px-4 py-2 text-[0.875em] font-semibold text-[#1c1c1c] no-underline hover:bg-[#fffdfb] ${FOCUS}`}
            >
              {t("daily_mass.links.usccb", "Read on USCCB")}
              <span className="sr-only"> (opens in a new tab)</span>
            </a>
          </div>
        ) : null}
      </div>
    </div>
  );
}
