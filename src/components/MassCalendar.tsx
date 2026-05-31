"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import type { MassDaySummary, MonthCalendar } from "@/types/mass";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const rankStyles: Record<MassDaySummary["rank"], string> = {
  solemnity: "ring-2 ring-amber-400 bg-amber-50 font-semibold",
  feast: "bg-sky-50 font-semibold text-sky-900",
  memorial: "bg-violet-50 text-violet-900",
  sunday: "bg-emerald-50 font-semibold text-emerald-900",
  ferial: "bg-white text-slate-700 hover:bg-slate-50",
};

type Props = {
  initial: MonthCalendar;
  selectedDate: string;
};

export function MassCalendar({ initial, selectedDate }: Props) {
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

  const dayMap = new Map(calendar.days.map((d) => [d.date, d]));

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:p-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-bold text-slate-800">Daily Mass Calendar</h2>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => shiftMonth(-1)}
            className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-semibold text-slate-600 hover:bg-slate-50"
            aria-label="Previous month"
          >
            ←
          </button>
          <span className="min-w-[10rem] text-center text-sm font-bold text-slate-800">
            {monthLabel}
            {loading && " …"}
          </span>
          <button
            type="button"
            onClick={() => shiftMonth(1)}
            className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-semibold text-slate-600 hover:bg-slate-50"
            aria-label="Next month"
          >
            →
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold text-slate-500">
        {WEEKDAYS.map((d) => (
          <div key={d} className="py-2">
            {d}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: firstDow }).map((_, i) => (
          <div key={`pad-${i}`} className="min-h-[4.5rem]" />
        ))}
        {calendar.days.map((day) => {
          const dayNum = Number(day.date.slice(8, 10));
          const isSelected = day.date === selectedDate;
          return (
            <Link
              key={day.date}
              href={`/mass/${day.date}`}
              className={`flex min-h-[4.5rem] flex-col rounded-lg border border-slate-100 p-1.5 text-left transition ${rankStyles[day.rank]} ${isSelected ? "ring-2 ring-[#2563eb]" : ""}`}
              title={day.liturgicalTitle}
            >
              <span className="text-sm font-bold">{dayNum}</span>
              <span className="mt-0.5 line-clamp-3 text-[10px] leading-tight opacity-90">
                {day.liturgicalTitle}
              </span>
            </Link>
          );
        })}
      </div>

      <p className="mt-4 text-xs text-slate-500">
        Tap a date for full readings. Data: {calendar.source}
      </p>
    </section>
  );
}
