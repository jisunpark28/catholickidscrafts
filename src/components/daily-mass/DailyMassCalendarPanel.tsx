"use client";

import { textFromCopy, useSiteCopy } from "@/components/SiteCopyProvider";
import { deviceDateKey } from "@/lib/daily-mass/device-date";
import {
  daysInUtcMonth,
  monthGrid,
  shiftCalendarMonth,
  type MonthGridCell,
} from "@/lib/daily-mass/month-grid";
import type { ReadingRef } from "@/lib/daily-mass/reading-refs";
import type { LiturgicalSeasonInfo, MonthCalendar } from "@/types/mass";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useId, useRef, useState } from "react";

const WEEKDAYS = [
  { short: "Sun", long: "Sunday" },
  { short: "Mon", long: "Monday" },
  { short: "Tue", long: "Tuesday" },
  { short: "Wed", long: "Wednesday" },
  { short: "Thu", long: "Thursday" },
  { short: "Fri", long: "Friday" },
  { short: "Sat", long: "Saturday" },
] as const;

const FOCUS =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#d35400]";

const BADGE: Record<LiturgicalSeasonInfo["color"], string> = {
  green: "bg-[#e7f5ec] text-[#1b7a3a]",
  purple: "bg-[#f3e8ff] text-[#5b21b6]",
  white: "bg-[#f7eee3] text-[#92400e]",
  red: "bg-[#fee2e2] text-[#991b1b]",
  rose: "bg-[#fce7f3] text-[#9d174d]",
};

const MONTH_ERROR = "This month couldn't be loaded. The calendar stays on the last month that did load.";
const TITLE_ERROR = "Liturgical titles for this month couldn't be loaded. Dates are still available.";

type Props = {
  initial: MonthCalendar;
  calendarError: boolean;
  selectedDate: string;
  displayDate: string;
  dayTitle: string;
  seasonName: string;
  seasonColor: LiturgicalSeasonInfo["color"];
  memorial?: string;
  readings: ReadingRef[];
  usccbUrl: string;
};

function monthName(year: number, month: number): string {
  return new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric", timeZone: "UTC" }).format(
    new Date(Date.UTC(year, month - 1, 1)),
  );
}

function rowsOf(cells: Array<MonthGridCell | null>): Array<Array<MonthGridCell | null>> {
  const rows: Array<Array<MonthGridCell | null>> = [];
  for (let i = 0; i < cells.length; i += 7) rows.push(cells.slice(i, i + 7));
  return rows;
}

export function DailyMassCalendarPanel({
  initial,
  calendarError,
  selectedDate,
  displayDate,
  dayTitle,
  seasonName,
  seasonColor,
  memorial,
  readings,
  usccbUrl,
}: Props) {
  const copy = useSiteCopy();
  const t = (key: string, fallback: string) => textFromCopy(copy, key, fallback);
  const router = useRouter();
  const gridId = useId();
  const monthLabelId = useId();
  const dayTitleId = useId();
  const gridRef = useRef<HTMLDivElement>(null);
  const requestId = useRef(0);
  const clickedDate = useRef<string | null>(null);
  const pendingFocus = useRef<string | null>(null);
  const focusDayAfterLoad = useRef<number | null>(null);
  const lastSync = useRef<string | null>(null);
  const [calendar, setCalendar] = useState(initial);
  const [loading, setLoading] = useState(false);
  const [monthError, setMonthError] = useState<string | null>(calendarError ? TITLE_ERROR : null);
  const [tabDate, setTabDate] = useState(selectedDate);
  const [pendingDate, setPendingDate] = useState<string | null>(null);

  const loadMonth = useCallback(async (year: number, month: number) => {
    const id = ++requestId.current;
    setLoading(true);
    setMonthError(null);
    try {
      const res = await fetch(`/api/mass/calendar/${year}/${month}`);
      const data = (await res.json().catch(() => null)) as MonthCalendar | { error?: string } | null;
      if (id !== requestId.current) return;
      if (!res.ok || !data || !("days" in data) || !Array.isArray(data.days) || data.year !== year || data.month !== month) {
        setMonthError(MONTH_ERROR);
        return;
      }
      setCalendar(data);
    } catch {
      if (id !== requestId.current) return;
      setMonthError(MONTH_ERROR);
    } finally {
      if (id === requestId.current) setLoading(false);
    }
  }, []);

  const syncKey = `${initial.year}-${initial.month}|${selectedDate}|${calendarError}`;
  useEffect(() => {
    if (lastSync.current === syncKey) return;
    lastSync.current = syncKey;
    setCalendar(initial);
    setMonthError(calendarError ? TITLE_ERROR : null);
    setTabDate(selectedDate);
    setPendingDate(null);
    if (clickedDate.current === selectedDate) pendingFocus.current = selectedDate;
    clickedDate.current = null;
  }, [calendarError, initial, selectedDate, syncKey]);

  useEffect(() => {
    const target = pendingFocus.current;
    if (!target || !monthGrid(calendar.year, calendar.month).some((cell) => cell?.date === target)) return;
    pendingFocus.current = null;
    const frame = requestAnimationFrame(() => {
      gridRef.current?.querySelector<HTMLElement>(`[data-date="${target}"]`)?.focus();
    });
    return () => cancelAnimationFrame(frame);
  }, [calendar, selectedDate]);

  useEffect(() => {
    const day = focusDayAfterLoad.current;
    if (day == null || loading) return;
    focusDayAfterLoad.current = null;
    const clamped = Math.min(day, daysInUtcMonth(calendar.year, calendar.month));
    const date = `${calendar.year}-${String(calendar.month).padStart(2, "0")}-${String(clamped).padStart(2, "0")}`;
    setTabDate(date);
    const frame = requestAnimationFrame(() => {
      gridRef.current?.querySelector<HTMLElement>(`[data-date="${date}"]`)?.focus();
    });
    return () => cancelAnimationFrame(frame);
  }, [calendar.month, calendar.year, loading]);

  useEffect(() => {
    if (!pendingDate || pendingDate === selectedDate) return undefined;
    const timer = window.setTimeout(() => setPendingDate(null), 15000);
    return () => window.clearTimeout(timer);
  }, [pendingDate, selectedDate]);

  function shift(delta: number, focusDay?: number) {
    const next = shiftCalendarMonth(calendar.year, calendar.month, delta);
    if (!next) return;
    if (focusDay) focusDayAfterLoad.current = focusDay;
    void loadMonth(next.year, next.month);
  }

  function openDate(date: string) {
    if (date === selectedDate) {
      const year = Number(date.slice(0, 4));
      const month = Number(date.slice(5, 7));
      if (calendar.year !== year || calendar.month !== month) {
        focusDayAfterLoad.current = Number(date.slice(8, 10));
        void loadMonth(year, month);
      } else {
        gridRef.current?.querySelector<HTMLElement>(`[data-date="${date}"]`)?.focus();
      }
      return;
    }
    clickedDate.current = date;
    setPendingDate(date);
    router.push(`/daily-mass?date=${date}`, { scroll: false });
  }

  const cells = monthGrid(calendar.year, calendar.month);
  const rows = rowsOf(cells);
  const label = monthName(calendar.year, calendar.month);
  const dates = cells.flatMap((cell) => (cell ? [cell.date] : []));
  const tabStop = dates.includes(tabDate) ? tabDate : dates.includes(selectedDate) ? selectedDate : dates[0];
  const prev = shiftCalendarMonth(calendar.year, calendar.month, -1);
  const next = shiftCalendarMonth(calendar.year, calendar.month, 1);
  const titles = new Map(calendar.days.map((day) => [day.date, day.liturgicalTitle]));
  const navBtn = `dm-pill inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[#e7e3de] bg-white text-[#374151] hover:bg-[#fffdfb] disabled:cursor-not-allowed disabled:opacity-40 ${FOCUS}`;

  function onGridKey(event: React.KeyboardEvent<HTMLDivElement>) {
    const current = (event.target as HTMLElement).dataset.date;
    if (!current) return;
    const index = cells.findIndex((cell) => cell?.date === current);
    if (index < 0) return;

    if (event.key === "PageUp" || event.key === "PageDown") {
      event.preventDefault();
      shift(event.key === "PageUp" ? -1 : 1, Number(current.slice(8, 10)));
      return;
    }

    let destination = -1;
    if (event.key === "Home") destination = cells.findIndex((cell) => cell);
    else if (event.key === "End") {
      for (let cursor = cells.length - 1; cursor >= 0; cursor -= 1) {
        if (cells[cursor]) {
          destination = cursor;
          break;
        }
      }
    }
    else if (event.key === "ArrowLeft") destination = index - 1;
    else if (event.key === "ArrowRight") destination = index + 1;
    else if (event.key === "ArrowUp") destination = index - 7;
    else if (event.key === "ArrowDown") destination = index + 7;
    else return;

    event.preventDefault();
    const step = destination < index ? -1 : 1;
    while (destination >= 0 && destination < cells.length && !cells[destination]) destination += step;
    const cell = cells[destination];
    if (!cell) return;
    setTabDate(cell.date);
    gridRef.current?.querySelector<HTMLElement>(`[data-date="${cell.date}"]`)?.focus();
  }

  return (
    <section className="dm-card dm-cal rounded-3xl border border-[#eadfce] bg-white px-3 py-4 sm:px-8 sm:py-7" aria-labelledby={monthLabelId}>
      <div className="grid grid-cols-[2.25rem_minmax(0,1fr)_auto] items-center gap-2">
        <button type="button" className={navBtn} onClick={() => shift(-1)} disabled={!prev} aria-label="Previous month">
          <span aria-hidden>‹</span>
        </button>
        <p id={monthLabelId} className="dm-ink m-0 truncate text-center text-[1.15em] font-bold text-[#1c1c1c]">
          {label}
        </p>
        <div className="flex items-center gap-2">
          <button type="button" className={navBtn} onClick={() => shift(1)} disabled={!next} aria-label="Next month">
            <span aria-hidden>›</span>
          </button>
          <button
            type="button"
            className={`dm-pill inline-flex h-9 shrink-0 items-center rounded-lg border border-[#e7e3de] bg-white px-3 text-[0.875em] font-semibold text-[#1c1c1c] hover:bg-[#fffdfb] ${FOCUS}`}
            onClick={() => openDate(deviceDateKey())}
          >
            {t("daily_mass.today.label", "Today")}
          </button>
        </div>
      </div>

      <p
        className={`dm-muted m-0 text-center text-[0.75em] text-[#6b7280] ${loading || monthError ? "mt-2" : "sr-only"}`}
        aria-live="polite"
      >
        {loading ? "Loading calendar…" : monthError ?? ""}
      </p>

      <div
        ref={gridRef}
        id={gridId}
        role="grid"
        aria-labelledby={monthLabelId}
        aria-busy={loading}
        onKeyDown={onGridKey}
        className={`mt-1 ${loading ? "opacity-60" : ""}`}
      >
        <p className="sr-only">
          Use arrow keys to move between days. Home and End move to the first and last day. Page Up and Page Down change month. Enter opens a day.
        </p>
        <div role="row" className="grid grid-cols-7">
          {WEEKDAYS.map((day) => (
            <div key={day.long} role="columnheader" className="pb-2 text-center text-[0.75em] font-medium text-[#9ca3af]">
              <abbr title={day.long} className="no-underline">
                {day.short}
              </abbr>
            </div>
          ))}
        </div>
        {rows.map((row, rowIndex) => (
          <div key={rowIndex} role="row" className="grid grid-cols-7">
            {row.map((cell, column) => (
              <div
                key={cell?.date ?? `empty-${rowIndex}-${column}`}
                role="gridcell"
                aria-selected={cell ? cell.date === selectedDate : undefined}
                className="flex items-center justify-center py-[0.2em]"
              >
                {cell ? (
                  <Link
                    href={`/daily-mass?date=${cell.date}`}
                    scroll={false}
                    prefetch={false}
                    data-date={cell.date}
                    tabIndex={cell.date === tabStop ? 0 : -1}
                    aria-current={cell.date === selectedDate ? "date" : undefined}
                    aria-label={dayLabel(cell, label, titles.get(cell.date), cell.date === selectedDate)}
                    onClick={(event) => {
                      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;
                      clickedDate.current = cell.date;
                      if (cell.date !== selectedDate) setPendingDate(cell.date);
                    }}
                    className={dayClass(cell, selectedDate)}
                  >
                    {cell.day}
                  </Link>
                ) : (
                  <span className="h-9 w-9" />
                )}
              </div>
            ))}
          </div>
        ))}
      </div>

      <div className="dm-rule mt-4 border-t border-[#efe8df] pt-4" aria-busy={Boolean(pendingDate && pendingDate !== selectedDate)}>
        <p className="dm-muted m-0 text-[0.875em] text-[#6b7280]">{displayDate}</p>
        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-2">
          <h2 id={dayTitleId} className="dm-ink m-0 text-[1.35em] font-bold leading-tight text-[#1c1c1c] sm:text-[1.5em]">
            {dayTitle}
          </h2>
          {seasonName ? (
            <span className={`dm-badge inline-flex items-center rounded-full px-2.5 py-0.5 text-[0.75em] font-semibold ${BADGE[seasonColor]}`}>
              {seasonName}
            </span>
          ) : null}
        </div>
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
        ) : (
          <p className="dm-muted mb-0 mt-4 text-[0.875em] text-[#4b5563]">
            {t("daily_mass.readings.missing", "Reading citations aren't available for this date yet.")}
          </p>
        )}
        {pendingDate && pendingDate !== selectedDate ? (
          <p className="dm-muted m-0 mt-3 text-[0.75em] text-[#9ca3af]" aria-live="polite">
            Loading readings…
          </p>
        ) : null}

        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <a
            href={usccbUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={`dm-pill inline-flex items-center rounded-full border border-[#e7e3de] bg-white px-4 py-2 text-[0.875em] font-semibold text-[#1c1c1c] no-underline hover:bg-[#fffdfb] ${FOCUS}`}
          >
            {t("daily_mass.links.usccb", "Read on USCCB")}
            <span className="sr-only"> (opens in a new tab)</span>
          </a>
          <Link
            href="/gospel"
            className={`inline-flex items-center rounded-full bg-[#d35400] px-4 py-2 text-[0.875em] font-semibold text-white no-underline hover:bg-[#b8470a] ${FOCUS}`}
          >
            {t("daily_mass.readings.type_gospel", "Type today's Gospel")}
          </Link>
        </div>
      </div>
    </section>
  );
}

function dayLabel(cell: MonthGridCell, monthLabelText: string, title: string | undefined, selected: boolean): string {
  const year = cell.date.slice(0, 4);
  const month = monthLabelText.endsWith(year) ? monthLabelText.slice(0, -year.length).trim() : monthLabelText;
  const bits = [`${WEEKDAYS[cell.weekday].long}, ${month} ${cell.day}, ${year}`];
  if (title?.trim()) bits.push(title.trim());
  if (selected) bits.push("selected");
  return bits.join(", ");
}

function dayClass(cell: MonthGridCell, selectedDate: string): string {
  const selected = cell.date === selectedDate;
  const sunday = cell.weekday === 0;
  const tone = selected
    ? "bg-[#d35400] font-bold text-white"
    : sunday
      ? "dm-sun font-semibold text-[#2e7d32] hover:bg-[#f3faf5]"
      : "dm-day font-semibold text-[#1c1c1c] hover:bg-[#f6f1ea]";
  return `inline-flex h-9 w-9 items-center justify-center rounded-lg text-[0.95em] no-underline sm:h-10 sm:w-10 ${tone} ${FOCUS}`;
}
