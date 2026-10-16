"use client";

import { GospelPraiseSticker } from "@/components/gospel/GospelPraiseSticker";
import { toDateKey } from "@/lib/dates";
import { useCallback, useEffect, useState, type ReactNode } from "react";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

type Props = {
  signedIn: boolean;
  initialCompleted: string[];
  todayDate: string;
  onSelectDate?: (dateKey: string) => void;
  /** Collapse control, shown at the top-right of the month header. */
  headerEnd?: ReactNode;
};

export function GospelReadingCalendar({
  signedIn,
  initialCompleted,
  todayDate,
  onSelectDate,
  headerEnd,
}: Props) {
  const today = new Date(`${todayDate}T12:00:00Z`);
  const [year, setYear] = useState(today.getUTCFullYear());
  const [month, setMonth] = useState(today.getUTCMonth() + 1);
  const [completed, setCompleted] = useState<Set<string>>(() => new Set(initialCompleted));
  const [loading, setLoading] = useState(false);

  const monthLabel = new Intl.DateTimeFormat("en-US", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(year, month - 1, 1)));

  const loadMonth = useCallback(async (y: number, m: number) => {
    if (!signedIn) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/gospel/progress?year=${y}&month=${m}`);
      if (res.ok) {
        const data = (await res.json()) as { completedDates?: string[] };
        setCompleted(new Set(data.completedDates ?? []));
      }
    } finally {
      setLoading(false);
    }
  }, [signedIn]);

  useEffect(() => {
    void loadMonth(year, month);
  }, [year, month, loadMonth]);

  useEffect(() => {
    setCompleted(new Set(initialCompleted));
  }, [initialCompleted]);

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
    setYear(y);
    setMonth(m);
  }

  const firstDow = new Date(Date.UTC(year, month - 1, 1)).getUTCDay();
  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();

  return (
    <section className="w-full overflow-hidden rounded-2xl border border-[#e8e0d6] bg-white shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#e8e0d6] bg-[#fdfaf7] px-4 py-3 sm:px-5">
        <h3 className="text-base font-semibold text-[var(--color-ink)]">{monthLabel}</h3>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => shiftMonth(-1)}
            className="rounded-xl border border-[#e8e0d6] bg-white px-3 py-1.5 text-xs font-semibold hover:border-[#d9cfc3]"
          >
            Previous
          </button>
          <button
            type="button"
            onClick={() => shiftMonth(1)}
            className="rounded-xl border border-[#e8e0d6] bg-white px-3 py-1.5 text-xs font-semibold hover:border-[#d9cfc3]"
          >
            Next
          </button>
          {headerEnd}
          {loading && <span className="text-xs text-[var(--color-muted)]">Loading…</span>}
        </div>
      </div>

      <div className="grid grid-cols-7 border-b border-[#e8e0d6] bg-[#f7f3ee] text-center text-[10px] font-bold uppercase tracking-wide text-[#9aa0a6] sm:text-[11px]">
        {WEEKDAYS.map((d) => (
          <div key={d} className="border-r border-[#ece7e1] py-1.5 last:border-r-0">
            {d}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7">
        {Array.from({ length: firstDow }).map((_, i) => (
          <div
            key={`pad-${i}`}
            className="min-h-[3.15rem] border-b border-r border-[#ece7e1] bg-[#fbfaf8] sm:min-h-[3.6rem]"
          />
        ))}
        {Array.from({ length: daysInMonth }, (_, i) => {
          const day = i + 1;
          const date = new Date(Date.UTC(year, month - 1, day));
          const dateKey = toDateKey(date);
          const isToday = dateKey === todayDate;
          const isDone = signedIn && completed.has(dateKey);
          const isFuture = dateKey > todayDate;
          const isPast = dateKey < todayDate;
          const canSelect = isToday;

          return (
            <button
              key={dateKey}
              type="button"
              disabled={!canSelect}
              onClick={() => canSelect && onSelectDate?.(dateKey)}
              className={`flex min-h-[3.15rem] flex-col items-center border-b border-r border-[#ece7e1] px-1 py-1 transition sm:min-h-[3.6rem] ${
                !canSelect ? "cursor-default bg-[#fbfaf8]" : "bg-white hover:bg-[#fdfaf7]"
              } ${isToday ? "ring-2 ring-inset ring-[#d35400]" : ""}`}
            >
              <span
                className={`text-[11px] font-semibold leading-none sm:text-xs ${
                  isToday
                    ? "text-[#d35400]"
                    : isFuture || isPast
                      ? "text-[#b0b4b8]"
                      : "text-[#1c1c1c]"
                }`}
              >
                {day}
              </span>
              <div className="mt-1 flex flex-1 items-start justify-center">
                {signedIn && !isFuture ? (
                  <GospelPraiseSticker completed={isDone} size="sm" />
                ) : (
                  <span
                    className="inline-block h-4 w-4 rounded-full border border-[#e6e0d8] bg-[#f4f0ea]"
                    aria-hidden
                  />
                )}
              </div>
            </button>
          );
        })}
      </div>
      {!signedIn && (
        <p className="border-t border-[#e8e0d6] px-4 py-3 text-sm text-[var(--color-muted)]">
          <a href="/account/login" className="font-semibold text-[var(--color-link)]">
            Sign in
          </a>{" "}
          or{" "}
          <a href="/reader/login" className="font-semibold text-[var(--color-link)]">
            Access ID
          </a>{" "}
          to save praise stickers on your calendar.
        </p>
      )}
    </section>
  );
}
