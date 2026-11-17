"use client";

import { monthGrid, shiftCalendarMonth } from "@/lib/daily-mass/month-grid";
import { SUNDAY_SEASON_JUMPS, type SundayCalendarEntry } from "@/lib/resource/sunday-season-jumps";
import Link from "next/link";
import { useMemo, useState } from "react";

type Props = {
  sundays: SundayCalendarEntry[];
  thisSundayDate: string;
  selectedDate: string;
  level: 1 | 2;
};

function monthLabel(year: number, month: number): string {
  return new Date(Date.UTC(year, month - 1, 1)).toLocaleDateString("en-US", {
    timeZone: "UTC",
    month: "long",
    year: "numeric",
  });
}

function hrefFor(date: string, level: 1 | 2): string {
  const p = new URLSearchParams();
  p.set("sunday", date);
  if (level === 2) p.set("level", "2");
  return `/resource?${p.toString()}`;
}

/** Middle finder: named season jumps + month calendar (Sundays only). No ordinal button walls. */
export function PrintablesSundaysFinder({ sundays, thisSundayDate, selectedDate, level }: Props) {
  const byDate = useMemo(() => new Map(sundays.map((s) => [s.date, s])), [sundays]);
  const selected = byDate.get(selectedDate) ?? byDate.get(thisSundayDate) ?? sundays[0] ?? null;
  const seed = selected?.date ?? thisSundayDate;
  const [y, m] = seed.split("-").map(Number);
  const [cursor, setCursor] = useState({ year: y!, month: m! });

  const cells = monthGrid(cursor.year, cursor.month);
  const thisWeek = byDate.get(thisSundayDate);

  const jumpToSeason = (jump: (typeof SUNDAY_SEASON_JUMPS)[number]) => {
    const hit = sundays.find((s) => {
      if (jump.keySuffix) return s.key.endsWith(`_${jump.keySuffix}`) || s.key === jump.keySuffix;
      return jump.season ? s.season === jump.season : false;
    });
    if (!hit) return;
    const [jy, jm] = hit.date.split("-").map(Number);
    setCursor({ year: jy!, month: jm! });
  };

  return (
    <div className="flex flex-col gap-4">
      <div>
        <p className="m-0 text-[11px] font-bold uppercase tracking-wide text-[#c9773a]">Pick a Sunday</p>
        <p className="mb-0 mt-1 text-sm text-[#6b5c50]">
          Jump by season, then choose a Sunday on the calendar.
        </p>
      </div>

      {thisWeek ? (
        <Link
          href={hrefFor(thisWeek.date, level)}
          className={`rounded-xl border px-3 py-2.5 no-underline transition ${
            selectedDate === thisWeek.date
              ? "border-[#c9773a] bg-[#fff2e8] text-[#9d451d]"
              : "border-[#e8d9cd] bg-[#fffdfa] text-[#493a30] hover:border-[#c8906c]"
          }`}
        >
          <span className="block text-[11px] font-bold uppercase tracking-wide text-[#c9773a]">This week</span>
          <span className="mt-0.5 block text-sm font-semibold leading-snug">{thisWeek.liturgicalName}</span>
        </Link>
      ) : null}

      <div>
        <p className="m-0 mb-2 text-[11px] font-bold uppercase tracking-wide text-[#806454]">Seasons</p>
        <ul className="m-0 flex list-none flex-wrap gap-1.5 p-0">
          {SUNDAY_SEASON_JUMPS.map((jump) => (
            <li key={jump.id}>
              <button
                type="button"
                onClick={() => jumpToSeason(jump)}
                className="rounded-md border border-transparent px-2 py-1 text-xs font-medium text-[#335599] hover:bg-[#fff2e8] hover:text-[#9d451d] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#c9773a]"
              >
                {jump.label}
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between gap-2">
          <button
            type="button"
            aria-label="Previous month"
            className="inline-flex h-8 w-8 items-center justify-center rounded-md text-[#806454] hover:bg-[#fff2e8] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#c9773a]"
            onClick={() => {
              const next = shiftCalendarMonth(cursor.year, cursor.month, -1);
              if (next) setCursor(next);
            }}
          >
            ‹
          </button>
          <p className="m-0 text-sm font-semibold text-[#1c1c1c]">{monthLabel(cursor.year, cursor.month)}</p>
          <button
            type="button"
            aria-label="Next month"
            className="inline-flex h-8 w-8 items-center justify-center rounded-md text-[#806454] hover:bg-[#fff2e8] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#c9773a]"
            onClick={() => {
              const next = shiftCalendarMonth(cursor.year, cursor.month, 1);
              if (next) setCursor(next);
            }}
          >
            ›
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-semibold uppercase tracking-wide text-[#806454]">
          {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
            <span key={`${d}-${i}`}>{d}</span>
          ))}
        </div>
        <div className="mt-1 grid grid-cols-7 gap-1">
          {cells.map((cell, i) => {
            if (!cell) return <span key={`e-${i}`} className="aspect-square" />;
            const entry = byDate.get(cell.date);
            const isSunday = cell.weekday === 0;
            const isSelected = entry && entry.date === selectedDate;
            const isThis = entry && entry.date === thisSundayDate;
            if (!isSunday || !entry) {
              return (
                <span
                  key={cell.date}
                  className={`flex aspect-square items-center justify-center rounded-md text-xs ${
                    isSunday ? "text-[#c9b8a8]" : "text-[#d7cdc3]"
                  }`}
                >
                  {cell.day}
                </span>
              );
            }
            return (
              <Link
                key={cell.date}
                href={hrefFor(entry.date, level)}
                title={entry.liturgicalName}
                aria-current={isSelected ? "date" : undefined}
                className={`flex aspect-square items-center justify-center rounded-md text-xs font-semibold no-underline transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#c9773a] ${
                  isSelected
                    ? "bg-[#c9773a] text-white"
                    : isThis
                      ? "bg-[#fff2e8] text-[#9d451d] ring-1 ring-[#c9773a]"
                      : "bg-[#fffdfa] text-[#493a30] hover:bg-[#fff2e8]"
                }`}
              >
                {cell.day}
              </Link>
            );
          })}
        </div>
        {selected ? (
          <p className="mb-0 mt-3 text-xs leading-snug text-[#6b5c50]">
            <span className="font-semibold text-[#1c1c1c]">{selected.liturgicalName}</span>
            <span aria-hidden> · </span>
            {selected.seasonLabel}
          </p>
        ) : null}
      </div>
    </div>
  );
}
