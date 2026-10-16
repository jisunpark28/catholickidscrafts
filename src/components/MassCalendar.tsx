"use client";

import { useCallback, useEffect, useState } from "react";
import {
  formatLiturgicalTitleDisplay,
  isOrdinaryTimeWeekdayTitle,
  ordinaryTimeSundayLabel,
} from "@/lib/liturgical-calendar";
import { parseDateParam } from "@/lib/dates";
import {
  goodNewsDailyMissaUrl,
  livingWithChristReadingUrl,
} from "@/lib/scripture-links";
import { usccbReadingsPageUrl } from "@/lib/usccb-rss";
import type { MassDaySummary, MonthCalendar } from "@/types/mass";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

/** Minimum column width when the month grid scrolls horizontally on narrow screens. */
const MOBILE_GRID_MIN_WIDTH = "min-w-[34rem]";

const rankStyles: Record<MassDaySummary["rank"], string> = {
  solemnity: "border-l-4 border-l-amber-500 bg-amber-50/80",
  feast: "border-l-4 border-l-sky-500 bg-sky-50/50",
  memorial: "border-l-4 border-l-violet-400 bg-violet-50/40",
  sunday: "border-l-4 border-l-emerald-600 bg-emerald-50/60 font-semibold",
  ferial: "bg-white hover:bg-[var(--color-surface)]",
};

/** Homepage PDF calendar — lighter rank colors, green Sundays, purple memorials. */
const homeRankStyles: Record<MassDaySummary["rank"], string> = {
  solemnity: "border-l-[3px] border-l-amber-500 bg-amber-50/50",
  feast: "border-l-[3px] border-l-[#1f51a2] bg-[#f4f8fc]",
  memorial: "border-l-[3px] border-l-[#af90ff] bg-[#fbfaff]",
  sunday: "border-l-[3px] border-l-[#009966] bg-[#f3fef9]",
  ferial: "bg-white",
};

type TodayReadingLink = {
  href: string;
  label: string;
};

type Props = {
  initial: MonthCalendar;
  selectedDate: string;
  todayDate: string;
  /** Home Daily Mass panel — enlarged calendar text (between compact and 2×). */
  large?: boolean;
  /** Homepage composition from the design PDF. Other pages keep the default grid. */
  variant?: "default" | "home";
  /** Shown inside today's cell on the homepage calendar. */
  todayReading?: TodayReadingLink;
};

function MassCalendarMobileReadings({ dateKey }: { dateKey: string }) {
  const date = parseDateParam(dateKey);
  if (!date) return null;

  const usccbUrl = usccbReadingsPageUrl(date);
  const lwcUrl = livingWithChristReadingUrl(dateKey);
  const goodNewsUrl = goodNewsDailyMissaUrl(dateKey);
  const linkClass =
    "text-sm font-semibold text-[var(--color-link)] hover:underline";

  return (
    <div className="border-t border-[var(--color-border)] px-4 py-3 md:hidden">
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[var(--color-muted)]">
        Readings
      </p>
      <div className="flex flex-wrap gap-x-4 gap-y-2">
        <a href={usccbUrl} target="_blank" rel="noopener noreferrer" className={linkClass}>
          USCCB ↗
        </a>
        <a href={lwcUrl} target="_blank" rel="noopener noreferrer" className={linkClass}>
          Living with Christ ↗
        </a>
        <a href={goodNewsUrl} target="_blank" rel="noopener noreferrer" className={linkClass}>
          GoodNews ↗
        </a>
      </div>
    </div>
  );
}

export function MassCalendar({
  initial,
  selectedDate,
  todayDate,
  large = false,
  variant = "default",
  todayReading,
}: Props) {
  const home = variant === "home";
  const [calendar, setCalendar] = useState(initial);
  const [year, setYear] = useState(initial.year);
  const [month, setMonth] = useState(initial.month);
  const [loading, setLoading] = useState(false);

  const loadMonth = useCallback(async (y: number, m: number) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/mass/calendar/${y}/${m}`);
      if (!res.ok) throw new Error("Failed to load");
      const data = (await res.json()) as MonthCalendar;
      setCalendar(data);
      setYear(data.year);
      setMonth(data.month);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (year === initial.year && month === initial.month) {
      setCalendar(initial);
    }
  }, [initial, year, month]);

  const firstDow = new Date(Date.UTC(year, month - 1, 1)).getUTCDay();
  const monthLabel = new Intl.DateTimeFormat("en-US", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(year, month - 1, 1)));

  function shiftMonth(delta: number) {
    let m = month + delta;
    let y = year;
    if (m < 1) {
      m = 12;
      y -= 1;
    } else if (m > 12) {
      m = 1;
      y += 1;
    }
    void loadMonth(y, m);
  }

  const headerMonthClass = home
    ? "text-base font-semibold text-[#1c1c1c] sm:text-lg"
    : large
      ? "text-2xl font-bold text-[var(--color-ink)] sm:text-3xl"
      : "text-lg font-bold text-[var(--color-ink)]";
  const navBtnClass = home
    ? "rounded-md border border-[#e5e7eb] bg-white px-2.5 py-1 text-xs font-medium text-[#374151] hover:bg-[#f9fafb] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#d35400] sm:px-3 sm:text-sm"
    : large
      ? "border border-[var(--color-border)] px-4 py-2 text-base font-semibold text-[var(--color-ink)] hover:bg-[var(--color-surface)] sm:px-5 sm:py-2.5 sm:text-lg"
      : "border border-[var(--color-border)] px-4 py-2 text-sm font-semibold text-[var(--color-ink)] hover:bg-[var(--color-surface)]";
  const loadingClass = large ? "text-base text-[var(--color-muted)] sm:text-lg" : "text-sm text-[var(--color-muted)]";
  const weekdayRowClass = home
    ? "grid grid-cols-7 border-b border-[#eceff3] bg-[#fafafa] text-center text-[10px] font-semibold uppercase tracking-[0.08em] text-[#9aa0a6] sm:text-xs"
    : large
      ? "grid grid-cols-7 border-b border-[var(--color-border)] bg-[var(--color-surface)] text-center text-xs font-bold uppercase tracking-wide text-[var(--color-muted)] sm:text-lg"
      : "grid grid-cols-7 border-b border-[var(--color-border)] bg-[var(--color-surface)] text-center text-[10px] font-bold uppercase tracking-wide text-[var(--color-muted)] sm:text-xs";
  const weekdayCellClass = home
    ? "border-r border-[#eceff3] py-2 last:border-r-0 sm:py-2.5"
    : large
      ? "border-r border-[var(--color-border)] py-2 last:border-r-0 sm:py-4"
      : "border-r border-[var(--color-border)] py-2 last:border-r-0 sm:py-3";
  const padCellClass = home
    ? "min-h-[3.25rem] border-b border-r border-[#eceff3] bg-white last:border-r-0 sm:min-h-[6.5rem] lg:min-h-[7.25rem]"
    : large
      ? "min-h-[4.5rem] border-b border-r border-[var(--color-border)] bg-[var(--color-surface)]/50 sm:min-h-[7rem] md:min-h-[10rem] lg:min-h-[11rem]"
      : "min-h-[4.5rem] border-b border-r border-[var(--color-border)] bg-[var(--color-surface)]/50 sm:min-h-[6rem] md:min-h-[7rem] lg:min-h-[8rem]";
  const dayCellBase = home
    ? "flex min-h-[3.25rem] min-w-0 flex-col border-b border-r border-[#eceff3] p-1 sm:min-h-[6.5rem] sm:p-2 lg:min-h-[7.25rem] lg:p-2.5"
    : large
      ? "flex min-h-[4.5rem] min-w-0 flex-col border-b border-r border-[var(--color-border)] p-1.5 sm:min-h-[7rem] sm:p-3 md:min-h-[9rem] md:p-4 lg:min-h-[11rem]"
      : "flex min-h-[4.5rem] min-w-0 flex-col border-b border-r border-[var(--color-border)] p-1.5 sm:min-h-[6rem] sm:p-2 md:min-h-[7rem] md:p-3 lg:min-h-[8rem]";
  const dayNumClass = home
    ? "shrink-0 text-[11px] font-semibold text-[#1c1c1c] sm:text-sm"
    : large
      ? "shrink-0 text-sm font-bold sm:text-lg md:text-xl"
      : "shrink-0 text-xs font-bold sm:text-sm md:text-base";
  const dayWeekClass = home
    ? "mt-0.5 w-full truncate text-[9px] font-medium leading-tight text-[#0b7a4b] sm:text-[11px]"
    : large
      ? "mt-0.5 w-full truncate text-[10px] font-semibold leading-tight text-[var(--color-ink)] sm:text-xs md:text-sm"
      : "mt-0.5 w-full truncate text-[9px] font-semibold leading-tight text-[var(--color-ink)] sm:text-[10px] md:text-xs";
  const dayTitleClass = home
    ? "mt-0.5 w-full truncate text-[9px] leading-tight text-[#6b7280] sm:text-[11px]"
    : large
      ? "mt-0.5 w-full truncate text-[10px] leading-tight text-[var(--color-muted)] sm:mt-1 sm:text-xs md:text-sm"
      : "mt-0.5 w-full truncate text-[9px] leading-tight text-[var(--color-muted)] sm:text-[10px] md:text-xs";
  const stylesForRank = home ? homeRankStyles : rankStyles;

  return (
    <section className={home ? "w-full bg-white" : "w-full border border-[var(--color-border)] bg-white"}>
      <div
        className={
          home
            ? "flex items-center justify-between gap-3 border-b border-[#eceff3] bg-white px-3 py-3 sm:px-4"
            : "flex flex-wrap items-center justify-between gap-4 border-b border-[var(--color-border)] px-4 py-4 sm:px-6"
        }
      >
        {home ? (
          <h3 className={headerMonthClass}>{monthLabel}</h3>
        ) : (
          <h2 className={headerMonthClass}>{monthLabel}</h2>
        )}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => shiftMonth(-1)}
            className={navBtnClass}
            aria-label="Previous month"
          >
            Previous
          </button>
          <button
            type="button"
            onClick={() => shiftMonth(1)}
            className={navBtnClass}
            aria-label="Next month"
          >
            Next
          </button>
          {loading && <span className={loadingClass}>Loading…</span>}
        </div>
      </div>

      <div className={home ? "w-full" : "overflow-x-auto overscroll-x-contain md:overflow-visible"}>
        <div className={home ? "min-w-0" : `${MOBILE_GRID_MIN_WIDTH} md:min-w-0`}>
          <div className={weekdayRowClass}>
            {WEEKDAYS.map((d) => (
              <div key={d} className={weekdayCellClass}>
                {d}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7">
            {Array.from({ length: firstDow }).map((_, i) => (
              <div key={`pad-${i}`} className={padCellClass} />
            ))}
            {calendar.days.map((day) => {
              const dayNum = Number(day.date.slice(8, 10));
              const isSelected = day.date === selectedDate;
              const isToday = day.date === todayDate;
              const isSunday = new Date(`${day.date}T12:00:00Z`).getUTCDay() === 0;
              const displayTitle = formatLiturgicalTitleDisplay(day.liturgicalTitle);
              const sundayLabel =
                isSunday ? ordinaryTimeSundayLabel(day.liturgicalTitle) : undefined;
              const showTitle =
                displayTitle.length > 0 &&
                !(sundayLabel && /Sunday in Ordinary Time$/i.test(displayTitle)) &&
                !isOrdinaryTimeWeekdayTitle(day.liturgicalTitle);
              return (
                <div
                  key={day.date}
                  className={`${dayCellBase} ${stylesForRank[day.rank]} ${
                    home && isToday
                      ? "shadow-[inset_0_0_0_2px_#d35400]"
                      : !home && isSelected
                        ? "ring-2 ring-inset ring-[var(--color-accent)]"
                        : ""
                  }`}
                >
                  <span
                    className={`${dayNumClass} ${
                      !home && isToday ? "text-[var(--color-accent)]" : home ? "" : "text-[var(--color-ink)]"
                    }`}
                  >
                    {dayNum}
                  </span>
                  {sundayLabel && (
                    <p className={dayWeekClass} title={sundayLabel}>
                      {sundayLabel}
                    </p>
                  )}
                  {showTitle && (
                    <p className={dayTitleClass} title={displayTitle}>
                      {displayTitle}
                    </p>
                  )}
                  {home && isToday && todayReading && (
                    <a
                      href={todayReading.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-auto inline-block max-w-full truncate rounded border border-[#e5e7eb] bg-white px-1 py-0.5 text-center text-[10px] font-medium leading-tight text-[#6b7280] hover:text-[#d35400] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#d35400]"
                    >
                      {todayReading.label}
                    </a>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {!home && <MassCalendarMobileReadings dateKey={selectedDate} />}
    </section>
  );
}
