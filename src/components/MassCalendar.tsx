"use client";

import { useCallback, useEffect, useState } from "react";
import { livingWithChristReadingUrl } from "@/lib/scripture-links";
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
};

export function MassCalendar({ initial, selectedDate, todayDate }: Props) {
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

  return (
    <section className="w-full border border-[var(--color-border)] bg-white">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[var(--color-border)] px-4 py-4 sm:px-6">
        <h2 className="text-lg font-bold text-[var(--color-ink)]">{monthLabel}</h2>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => shiftMonth(-1)}
            className="border border-[var(--color-border)] px-4 py-2 text-sm font-semibold text-[var(--color-ink)] hover:bg-[var(--color-surface)]"
            aria-label="Previous month"
          >
            Previous
          </button>
          <button
            type="button"
            onClick={() => shiftMonth(1)}
            className="border border-[var(--color-border)] px-4 py-2 text-sm font-semibold text-[var(--color-ink)] hover:bg-[var(--color-surface)]"
            aria-label="Next month"
          >
            Next
          </button>
          {loading && (
            <span className="text-sm text-[var(--color-muted)]">Loading…</span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-7 border-b border-[var(--color-border)] bg-[var(--color-surface)] text-center text-xs font-bold uppercase tracking-wide text-[var(--color-muted)]">
        {WEEKDAYS.map((d) => (
          <div key={d} className="border-r border-[var(--color-border)] py-3 last:border-r-0">
            {d}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7">
        {Array.from({ length: firstDow }).map((_, i) => (
          <div
            key={`pad-${i}`}
            className="min-h-[7rem] border-b border-r border-[var(--color-border)] bg-[var(--color-surface)]/50 sm:min-h-[8.5rem] lg:min-h-[9.5rem]"
          />
        ))}
        {calendar.days.map((day) => {
          const dayNum = Number(day.date.slice(8, 10));
          const isSelected = day.date === selectedDate;
          const isToday = day.date === todayDate;
          const lwcUrl = livingWithChristReadingUrl(day.date);
          const dayDate = parseDateParam(day.date);
          const usccbUrl = dayDate ? usccbReadingsPageUrl(dayDate) : null;
          return (
            <div
              key={day.date}
              className={`flex min-h-[7rem] flex-col border-b border-r border-[var(--color-border)] p-2 sm:min-h-[8.5rem] sm:p-3 lg:min-h-[9.5rem] ${rankStyles[day.rank]} ${
                isSelected ? "ring-2 ring-inset ring-[var(--color-accent)]" : ""
              }`}
            >
              <div className="flex flex-1 flex-col">
                <span
                  className={`text-sm font-bold sm:text-base ${
                    isToday ? "text-[var(--color-accent)]" : "text-[var(--color-ink)]"
                  }`}
                >
                  {dayNum}
                </span>
                <span className="mt-1 line-clamp-3 flex-1 text-[11px] leading-snug text-[var(--color-muted)] sm:line-clamp-4 sm:text-xs sm:leading-tight">
                  {day.liturgicalTitle}
                </span>
              </div>
              <div className="mt-2 flex flex-col gap-1">
                <a
                  href={lwcUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[10px] font-semibold text-[var(--color-link)] hover:underline"
                  title={`${day.liturgicalTitle} — Living with Christ`}
                >
                  Living with Christ ↗
                </a>
                {usccbUrl && (
                  <a
                    href={usccbUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[10px] font-semibold text-[var(--color-link)] hover:underline"
                    title={`${day.liturgicalTitle} — USCCB`}
                  >
                    USCCB ↗
                  </a>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <p className="px-4 py-3 text-xs text-[var(--color-muted)] sm:px-6">
        Each day: open <span className="font-semibold">Living with Christ ↗</span> or{" "}
        <span className="font-semibold">USCCB ↗</span> for that Sunday or weekday—use the link your
        parish already trusts.
      </p>
    </section>
  );
}
