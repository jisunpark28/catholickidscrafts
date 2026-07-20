"use client";

import { useCallback, useEffect, useState } from "react";
import {
  goodNewsDailyMissaUrl,
  livingWithChristReadingUrl,
} from "@/lib/scripture-links";
import { usccbReadingsPageUrl } from "@/lib/usccb-rss";
import { parseDateParam } from "@/lib/dates";
import type { MassDaySummary, MonthCalendar } from "@/types/mass";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

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
  /** Home Daily Mass panel — 2× calendar text. */
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
    ? "text-4xl font-bold text-[var(--color-ink)]"
    : "text-lg font-bold text-[var(--color-ink)]";
  const navBtnClass = large
    ? "border border-[var(--color-border)] px-6 py-3 text-2xl font-semibold text-[var(--color-ink)] hover:bg-[var(--color-surface)]"
    : "border border-[var(--color-border)] px-4 py-2 text-sm font-semibold text-[var(--color-ink)] hover:bg-[var(--color-surface)]";
  const loadingClass = large ? "text-2xl text-[var(--color-muted)]" : "text-sm text-[var(--color-muted)]";
  const weekdayRowClass = large
    ? "grid grid-cols-7 border-b border-[var(--color-border)] bg-[var(--color-surface)] text-center text-2xl font-bold uppercase tracking-wide text-[var(--color-muted)]"
    : "grid grid-cols-7 border-b border-[var(--color-border)] bg-[var(--color-surface)] text-center text-xs font-bold uppercase tracking-wide text-[var(--color-muted)]";
  const weekdayCellClass = large
    ? "border-r border-[var(--color-border)] py-6 last:border-r-0"
    : "border-r border-[var(--color-border)] py-3 last:border-r-0";
  const padCellClass = large
    ? "min-h-[18rem] border-b border-r border-[var(--color-border)] bg-[var(--color-surface)]/50 sm:min-h-[22rem] lg:min-h-[24rem]"
    : "min-h-[9rem] border-b border-r border-[var(--color-border)] bg-[var(--color-surface)]/50 sm:min-h-[11rem] lg:min-h-[12rem]";
  const dayCellBase = large
    ? "flex min-h-[18rem] flex-col border-b border-r border-[var(--color-border)] p-4 sm:min-h-[22rem] sm:p-6 lg:min-h-[24rem]"
    : "flex min-h-[9rem] flex-col border-b border-r border-[var(--color-border)] p-2 sm:min-h-[11rem] sm:p-3 lg:min-h-[12rem]";
  const dayNumClass = large ? "text-2xl font-bold sm:text-[2rem]" : "text-sm font-bold sm:text-base";
  const dayTitleClass = large
    ? "mt-2 flex-1 text-[20px] leading-snug text-[var(--color-muted)] sm:text-[22px] sm:leading-tight"
    : "mt-1 flex-1 text-[10px] leading-snug text-[var(--color-muted)] sm:text-[11px] sm:leading-tight";
  const linkClass = large
    ? "text-[20px] font-semibold text-[var(--color-link)] hover:underline"
    : "text-[10px] font-semibold text-[var(--color-link)] hover:underline";
  const linksWrapClass = large ? "mt-4 flex flex-col gap-2" : "mt-2 flex flex-col gap-1";

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
          const lwcUrl = livingWithChristReadingUrl(day.date);
          const goodNewsUrl = goodNewsDailyMissaUrl(day.date);
          const dayDate = parseDateParam(day.date);
          const usccbUrl = dayDate ? usccbReadingsPageUrl(dayDate) : null;
          return (
            <div
              key={day.date}
              className={`${dayCellBase} ${rankStyles[day.rank]} ${
                isSelected ? "ring-2 ring-inset ring-[var(--color-accent)]" : ""
              }`}
            >
              <div className="flex flex-1 flex-col">
                <span
                  className={`${dayNumClass} ${
                    isToday ? "text-[var(--color-accent)]" : "text-[var(--color-ink)]"
                  }`}
                >
                  {dayNum}
                </span>
                <span className={dayTitleClass}>{day.liturgicalTitle}</span>
              </div>
              <div className={linksWrapClass}>
                {usccbUrl && (
                  <a
                    href={usccbUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={linkClass}
                    title={`${day.liturgicalTitle} — USCCB`}
                  >
                    USCCB ↗
                  </a>
                )}
                <a
                  href={lwcUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={linkClass}
                  title={`${day.liturgicalTitle} — Living with Christ`}
                >
                  Living with Christ ↗
                </a>
                <a
                  href={goodNewsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={linkClass}
                  title={`${day.liturgicalTitle} — GoodNews`}
                >
                  GoodNews ↗
                </a>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
