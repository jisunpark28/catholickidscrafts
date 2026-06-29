"use client";

import { GospelPraiseSticker } from "@/components/gospel/GospelPraiseSticker";
import { toDateKey } from "@/lib/dates";
import { useCallback, useEffect, useState } from "react";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

type Props = {
  signedIn: boolean;
  initialCompleted: string[];
  todayDate: string;
  focusDate: string;
  onSelectDate?: (dateKey: string) => void;
};

export function GospelReadingCalendar({
  signedIn,
  initialCompleted,
  todayDate,
  focusDate,
  onSelectDate,
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
          {loading && <span className="text-xs text-[var(--color-muted)]">Loading…</span>}
        </div>
      </div>

      <div className="grid grid-cols-7 border-b border-[#e8e0d6] bg-[#f5ebe0]/50 text-center text-[10px] font-bold uppercase tracking-wide text-[var(--color-muted)] sm:text-xs">
        {WEEKDAYS.map((d) => (
          <div key={d} className="border-r border-[#e8e0d6] py-2 last:border-r-0">
            {d}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7">
        {Array.from({ length: firstDow }).map((_, i) => (
          <div
            key={`pad-${i}`}
            className="min-h-[4.5rem] border-b border-r border-[#e8e0d6] bg-[#faf8f5]/80 sm:min-h-[5.5rem]"
          />
        ))}
        {Array.from({ length: daysInMonth }, (_, i) => {
          const day = i + 1;
          const date = new Date(Date.UTC(year, month - 1, day));
          const dateKey = toDateKey(date);
          const isToday = dateKey === todayDate;
          const isSelected = dateKey === focusDate;
          const isDone = signedIn && completed.has(dateKey);
          const isFuture = dateKey > todayDate;

          return (
            <button
              key={dateKey}
              type="button"
              disabled={isFuture}
              onClick={() => onSelectDate?.(dateKey)}
              className={`flex min-h-[4.5rem] flex-col items-center border-b border-r border-[#e8e0d6] p-1 transition sm:min-h-[5.5rem] sm:p-2 ${
                isFuture ? "cursor-not-allowed bg-[#faf8f5]/60" : "hover:bg-[#fdfaf7]"
              } ${isToday ? "ring-2 ring-inset ring-[#dfc9b0]" : ""} ${
                isSelected && !isToday ? "ring-2 ring-inset ring-[var(--color-accent)]" : ""
              }`}
            >
              <span
                className={`text-xs font-bold sm:text-sm ${
                  isToday ? "text-[var(--color-accent)]" : "text-[var(--color-ink)]"
                }`}
              >
                {day}
              </span>
              <div className="mt-auto flex flex-1 items-end justify-center pb-0.5">
                {signedIn && !isFuture && (
                  <GospelPraiseSticker completed={isDone} size="sm" />
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
          to save praise stickers on your calendar (today&apos;s Gospel only).
        </p>
      )}
    </section>
  );
}
