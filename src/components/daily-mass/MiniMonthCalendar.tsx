"use client";

import { textFromCopy, useSiteCopy } from "@/components/SiteCopyProvider";
import type { MonthCalendar } from "@/types/mass";
import Link from "next/link";
import { useCallback, useState } from "react";

type Props = {
  initial: MonthCalendar;
  selectedDate: string;
  todayDate: string;
};

const WEEKDAYS = ["S", "M", "T", "W", "T", "F", "S"];
const WEEKDAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const navBtn =
  "dm-pill inline-flex h-7 w-7 items-center justify-center rounded-md border border-[#e7e3de] bg-white text-sm text-[#374151] hover:bg-[#fffdfb] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#d35400]";

/** Compact month grid for /daily-mass. Same data as MassCalendar (/api/mass/calendar). */
export function MiniMonthCalendar({ initial, selectedDate, todayDate }: Props) {
  const copy = useSiteCopy();
  const t = (key: string, fallback: string) => textFromCopy(copy, key, fallback);
  const [calendar, setCalendar] = useState(initial);
  const [open, setOpen] = useState(true);
  const [loading, setLoading] = useState(false);

  const loadMonth = useCallback(async (y: number, m: number) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/mass/calendar/${y}/${m}`);
      if (!res.ok) return;
      setCalendar((await res.json()) as MonthCalendar);
    } finally {
      setLoading(false);
    }
  }, []);

  function shift(delta: number) {
    let m = calendar.month + delta;
    let y = calendar.year;
    if (m < 1) {
      m = 12;
      y -= 1;
    } else if (m > 12) {
      m = 1;
      y += 1;
    }
    void loadMonth(y, m);
  }

  const first = new Date(Date.UTC(calendar.year, calendar.month - 1, 1));
  const firstDow = first.getUTCDay();
  const monthLabel = new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric", timeZone: "UTC" }).format(first);

  return (
    <section className="dm-card rounded-2xl border border-[#e7e3de] bg-white p-5" aria-label={monthLabel}>
      <div className="mb-2.5 flex items-center justify-between gap-2">
        <h2 className="dm-muted m-0 text-[0.6875em] font-semibold uppercase tracking-[0.12em] text-[#6b7280]">
          {monthLabel} · {calendar.season.name}
        </h2>
        <div className="flex items-center gap-1">
          {loading && <span className="text-xs text-[#9ca3af]">…</span>}
          <button type="button" className={navBtn} onClick={() => shift(-1)} aria-label="Previous month">
            ‹
          </button>
          <button type="button" className={navBtn} onClick={() => shift(1)} aria-label="Next month">
            ›
          </button>
          <button
            type="button"
            className={navBtn}
            onClick={() => setOpen(!open)}
            aria-expanded={open}
            aria-label={open ? t("daily_mass.calendar.hide", "Hide calendar") : t("daily_mass.calendar.show", "Show calendar")}
          >
            <span aria-hidden className={`transition ${open ? "" : "-rotate-90"}`}>▾</span>
          </button>
        </div>
      </div>
      {open && (
        <>
          <div className="grid grid-cols-7 gap-[3px] text-center">
            {WEEKDAYS.map((d, i) => (
              <div key={i} className="dm-muted text-[0.6875em] font-semibold text-[#9ca3af]" aria-hidden>
                {d}
              </div>
            ))}
            {Array.from({ length: firstDow }).map((_, i) => (
              <div key={`pad-${i}`} />
            ))}
            {calendar.days.map((day) => {
              const n = Number(day.date.slice(8, 10));
              const dow = new Date(`${day.date}T12:00:00Z`).getUTCDay();
              const isToday = day.date === todayDate;
              const isSelected = day.date === selectedDate;
              const isSunday = dow === 0;
              const isFeast = day.rank === "feast" || day.rank === "solemnity" || day.rank === "memorial";
              const cls = isToday
                ? "bg-[#d35400] font-bold text-white"
                : isSunday
                  ? "bg-[#effaf3] font-semibold text-[#047857]"
                  : "dm-ink text-[#1c1c1c] hover:bg-[#fdfaf7]";
              return (
                <Link
                  key={day.date}
                  href={`/daily-mass?date=${day.date}`}
                  scroll={false}
                  aria-label={`${WEEKDAY_NAMES[dow]} ${monthLabel.split(" ")[0]} ${n}: ${day.liturgicalTitle}`}
                  aria-current={isSelected ? "date" : undefined}
                  className={`flex h-[1.9em] items-center justify-center rounded-lg text-[0.8125em] no-underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#d35400] ${cls} ${
                    isSelected && !isToday ? "shadow-[inset_0_0_0_2px_#d35400]" : isFeast && !isToday ? "shadow-[inset_0_0_0_1px_#1e40af]" : ""
                  }`}
                >
                  {n}
                </Link>
              );
            })}
          </div>
          <p className="dm-muted mb-0 mt-2.5 text-[0.75em] text-[#6b7280]">
            {t("daily_mass.calendar.hint", "Tap a day for its readings.")}{" "}
            <span className="text-[#047857]" aria-hidden>■</span> {t("daily_mass.calendar.sunday", "Sunday")}{" "}
            <span className="text-[#d35400]" aria-hidden>■</span> {t("daily_mass.calendar.today", "Today")}
          </p>
        </>
      )}
    </section>
  );
}
