"use client";

import { useCallback, useEffect, useState } from "react";
import { ordinaryTimeWeekLabel } from "@/lib/liturgical-calendar";
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

type Props = {
  initial: MonthCalendar;
  selectedDate: string;
  todayDate: string;
  /** Home Daily Mass panel — enlarged calendar text (between compact and 2×). */
  large?: boolean;
};

export function MassCalendar({ initial, selectedDate, todayDate, large = false }: Props) {
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

  const headerMonthClass = large
    ? "text-2xl font-bold text-[var(--color-ink)] sm:text-3xl"
    : "text-lg font-bold text-[var(--color-ink)]";
  const navBtnClass = large
    ? "border border-[var(--color-border)] px-4 py-2 text-base font-semibold text-[var(--color-ink)] hover:bg-[var(--color-surface)] sm:px-5 sm:py-2.5 sm:text-lg"
    : "border border-[var(--color-border)] px-4 py-2 text-sm font-semibold text-[var(--color-ink)] hover:bg-[var(--color-surface)]";
  const loadingClass = large ? "text-base text-[var(--color-muted)] sm:text-lg" : "text-sm text-[var(--color-muted)]";
  const weekdayRowClass = large
    ? "grid grid-cols-7 border-b border-[var(--color-border)] bg-[var(--color-surface)] text-center text-xs font-bold uppercase tracking-wide text-[var(--color-muted)] sm:text-lg"
    : "grid grid-cols-7 border-b border-[var(--color-border)] bg-[var(--color-surface)] text-center text-[10px] font-bold uppercase tracking-wide text-[var(--color-muted)] sm:text-xs";
  const weekdayCellClass = large
    ? "border-r border-[var(--color-border)] py-2 last:border-r-0 sm:py-4"
    : "border-r border-[var(--color-border)] py-2 last:border-r-0 sm:py-3";
  const padCellClass = large
    ? "min-h-[4.5rem] border-b border-r border-[var(--color-border)] bg-[var(--color-surface)]/50 sm:min-h-[7rem] md:min-h-[10rem] lg:min-h-[11rem]"
    : "min-h-[4.5rem] border-b border-r border-[var(--color-border)] bg-[var(--color-surface)]/50 sm:min-h-[6rem] md:min-h-[7rem] lg:min-h-[8rem]";
  const dayCellBase = large
    ? "flex min-h-[4.5rem] min-w-0 flex-col border-b border-r border-[var(--color-border)] p-1.5 sm:min-h-[7rem] sm:p-3 md:min-h-[9rem] md:p-4 lg:min-h-[11rem]"
    : "flex min-h-[4.5rem] min-w-0 flex-col border-b border-r border-[var(--color-border)] p-1.5 sm:min-h-[6rem] sm:p-2 md:min-h-[7rem] md:p-3 lg:min-h-[8rem]";
  const dayNumClass = large
    ? "shrink-0 text-sm font-bold sm:text-lg md:text-xl"
    : "shrink-0 text-xs font-bold sm:text-sm md:text-base";
  const dayWeekClass = large
    ? "mt-0.5 w-full truncate text-[10px] font-semibold leading-tight text-[var(--color-ink)] sm:text-xs md:text-sm"
    : "mt-0.5 w-full truncate text-[9px] font-semibold leading-tight text-[var(--color-ink)] sm:text-[10px] md:text-xs";
  const dayTitleClass = large
    ? "mt-0.5 w-full truncate text-[10px] leading-tight text-[var(--color-muted)] sm:mt-1 sm:text-xs md:text-sm"
    : "mt-0.5 w-full truncate text-[9px] leading-tight text-[var(--color-muted)] sm:text-[10px] md:text-xs";

  return (
    <section className="w-full border border-[var(--color-border)] bg-white">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[var(--color-border)] px-4 py-4 sm:px-6">
        <h2 className={headerMonthClass}>{monthLabel}</h2>
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

      <div className="overflow-x-auto overscroll-x-contain md:overflow-visible">
        <div className={`${MOBILE_GRID_MIN_WIDTH} md:min-w-0`}>
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
              const weekLabel = ordinaryTimeWeekLabel(day.liturgicalTitle);
              return (
                <div
                  key={day.date}
                  className={`${dayCellBase} ${rankStyles[day.rank]} ${
                    isSelected ? "ring-2 ring-inset ring-[var(--color-accent)]" : ""
                  }`}
                >
                  <span
                    className={`${dayNumClass} ${
                      isToday ? "text-[var(--color-accent)]" : "text-[var(--color-ink)]"
                    }`}
                  >
                    {dayNum}
                  </span>
                  {weekLabel && (
                    <p className={dayWeekClass} title={weekLabel}>
                      {weekLabel}
                    </p>
                  )}
                  <p className={dayTitleClass} title={day.liturgicalTitle}>
                    {day.liturgicalTitle}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
