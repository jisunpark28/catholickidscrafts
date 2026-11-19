"use client";

import { monthGrid, shiftCalendarMonth } from "@/lib/daily-mass/month-grid";
import { SAINT_REPORT_SLUG, activityPath } from "@/lib/resource/activities";
import type { ResourceSeason } from "@/lib/resource/sheets";
import { SUNDAY_SEASON_JUMPS, type SundayCalendarEntry } from "@/lib/resource/sunday-season-jumps";
import type { WorksheetFilter } from "@/lib/resource/worksheet-browse";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

type Props = {
  sundays: SundayCalendarEntry[];
  thisSundayDate: string;
  selectedDate: string;
  level: 1 | 2;
  initialQ?: string;
  filter?: WorksheetFilter;
  season?: ResourceSeason | "";
  /** Seeds the visible calendar month (season jump or this Sunday). */
  monthDate?: string;
};

function monthLabel(year: number, month: number): string {
  return new Date(Date.UTC(year, month - 1, 1)).toLocaleDateString("en-US", {
    timeZone: "UTC",
    month: "long",
    year: "numeric",
  });
}

export function worksheetsHref({
  q,
  sunday,
  level,
  season,
  filter,
}: {
  q?: string;
  sunday?: string;
  level: 1 | 2;
  season?: string;
  filter?: string;
}): string {
  const p = new URLSearchParams();
  p.set("view", "sundays");
  if (q?.trim()) p.set("q", q.trim());
  if (sunday) p.set("sunday", sunday);
  if (level === 2) p.set("level", "2");
  if (season) p.set("season", season);
  if (filter) p.set("filter", filter);
  return `/resource?${p.toString()}`;
}

/** Middle finder for Worksheets mode: search first, then calendar, then Try this prompts. */
export function PrintablesSundaysFinder({
  sundays,
  thisSundayDate,
  selectedDate,
  level,
  initialQ = "",
  filter = "",
  season = "",
  monthDate,
}: Props) {
  const router = useRouter();
  const [q, setQ] = useState(initialQ);
  const byDate = useMemo(() => new Map(sundays.map((s) => [s.date, s])), [sundays]);
  const selected = byDate.get(selectedDate) ?? byDate.get(thisSundayDate) ?? sundays[0] ?? null;
  const seed = monthDate || selected?.date || thisSundayDate;
  const [y, m] = seed.split("-").map(Number);
  const [cursor, setCursor] = useState({ year: y!, month: m! });

  const cells = monthGrid(cursor.year, cursor.month);
  const browsing = Boolean(initialQ.trim() || filter || season);

  const prompts: { label: string; href: string; current?: boolean }[] = [
    {
      label: "This week free worksheet",
      href: worksheetsHref({ level, filter: "free-week" }),
      current: filter === "free-week" && !initialQ.trim(),
    },
    ...SUNDAY_SEASON_JUMPS.map((jump) => {
      const href = jump.keySuffix
        ? worksheetsHref({ level, filter: "christ-the-king" })
        : worksheetsHref({ level, season: jump.season });
      const current = jump.keySuffix
        ? filter === "christ-the-king" && !initialQ.trim()
        : season === jump.season && !filter && !initialQ.trim();
      return { label: jump.label, href, current };
    }),
    {
      label: "Mass worksheets",
      href: worksheetsHref({ level, filter: "mass" }),
      current: filter === "mass" && !initialQ.trim(),
    },
    {
      label: "Virtue worksheets",
      href: worksheetsHref({ level, filter: "virtue" }),
      current: filter === "virtue" && !initialQ.trim(),
    },
    { label: "Saint Report Worksheet", href: activityPath(SAINT_REPORT_SLUG) },
    {
      label: "All",
      href: worksheetsHref({ level }),
      current: !browsing,
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      <p className="m-0 text-[11px] font-bold uppercase tracking-wide text-[#c9773a]">Worksheets</p>

      <form
        role="search"
        className="flex flex-col gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          router.push(worksheetsHref({ q, level }));
        }}
      >
        <label className="flex items-center gap-2 rounded-full border border-[#e8d9cd] bg-[#fffdfa] px-3 py-2">
          <span aria-hidden className="text-[#806454]">
            ⌕
          </span>
          <span className="sr-only">Search worksheets</span>
          <input
            type="search"
            name="q"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search worksheets…"
            maxLength={80}
            className="w-full bg-transparent text-sm text-[#1c1c1c] outline-none placeholder:text-[#9a8b7e]"
          />
        </label>
        <button
          type="submit"
          className="rounded-full bg-[#c9773a] px-3 py-2 text-sm font-semibold text-white hover:bg-[#b8470a] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#c9773a]"
        >
          Search
        </button>
      </form>

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
            const isSelected = cell.date === selectedDate;
            const isThis = cell.date === thisSundayDate;
            // Non-Sundays stay inert. Every Sunday is selectable (past + future);
            // server maps the date → Year A/B/C worksheet via romcal.
            if (!isSunday) {
              return (
                <span
                  key={cell.date}
                  className="flex aspect-square items-center justify-center rounded-md text-xs text-[#d7cdc3]"
                >
                  {cell.day}
                </span>
              );
            }
            if (!entry) {
              // Outside precomputed window or no catalog sheet — still link; page resolves or falls back.
              return (
                <Link
                  key={cell.date}
                  href={worksheetsHref({ sunday: cell.date, level })}
                  aria-current={isSelected ? "date" : undefined}
                  className={`flex aspect-square items-center justify-center rounded-md text-xs font-semibold no-underline transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#c9773a] ${
                    isSelected
                      ? "bg-[#c9773a] text-white"
                      : "bg-[#fffdfa] text-[#806454] hover:bg-[#fff2e8]"
                  }`}
                >
                  {cell.day}
                </Link>
              );
            }
            return (
              <Link
                key={cell.date}
                href={worksheetsHref({ sunday: entry.date, level })}
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
            {/^([ABC])_/.test(selected.key) ? (
              <>
                <span aria-hidden> · </span>
                Year {selected.key[0]}
              </>
            ) : null}
          </p>
        ) : null}
      </div>

      <div>
        <p className="m-0 mb-2 text-[11px] font-bold uppercase tracking-wide text-[#806454]">Try this</p>
        <ul className="m-0 flex list-none flex-col gap-1.5 p-0">
          {prompts.map((p) => (
            <li key={p.href + p.label}>
              <Link
                href={p.href}
                aria-current={p.current ? "true" : undefined}
                className="block rounded-lg px-2 py-1.5 text-sm text-[#335599] no-underline hover:bg-[#fff2e8] hover:text-[#9d451d] aria-[current=true]:bg-[#fff2e8] aria-[current=true]:font-semibold"
              >
                {p.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
