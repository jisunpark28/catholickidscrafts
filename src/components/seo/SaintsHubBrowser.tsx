"use client";

import Image from "next/image";
import Link from "next/link";
import { useId, useMemo, useState } from "react";

export type SaintsHubCard = {
  id: string;
  title: string;
  href: string;
  thumb: string;
  when?: string;
  /** Feast month 1-12 from the card's month-day, when known. */
  month: number | null;
};

export type SaintsHubGroup = { set: string; cards: SaintsHubCard[] };

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

function fold(value: string): string {
  return value.toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "").trim();
}

/** Name search + feast-month filter over the set-grouped saint list. All saints render on first load. */
export function SaintsHubBrowser({ groups }: { groups: SaintsHubGroup[] }) {
  const [query, setQuery] = useState("");
  const [month, setMonth] = useState("");
  const searchId = useId();
  const monthId = useId();
  const total = useMemo(() => groups.reduce((sum, g) => sum + g.cards.length, 0), [groups]);

  const visible = useMemo(() => {
    const q = fold(query);
    const m = month ? Number(month) : null;
    return groups
      .map((g) => ({
        set: g.set,
        cards: g.cards.filter((c) => (!q || fold(c.title).includes(q)) && (m === null || c.month === m)),
      }))
      .filter((g) => g.cards.length > 0);
  }, [groups, query, month]);
  const shown = visible.reduce((sum, g) => sum + g.cards.length, 0);
  const filtered = Boolean(query.trim() || month);

  return (
    <div className="mt-6">
      <div className="flex flex-col gap-3 rounded-2xl border border-[#f0d9b8] bg-white/90 p-3 sm:flex-row sm:items-end sm:p-4">
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <label htmlFor={searchId} className="text-sm font-semibold text-[#1f2937]">
            Search by name
          </label>
          <input
            id={searchId}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="e.g. Thérèse, Patrick, Joseph"
            autoComplete="off"
            className="w-full rounded-full border border-[#e3c9a6] bg-white px-4 py-2 text-base text-[#1f2937] focus:border-[#c9773a] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#c9773a]/40"
          />
        </div>
        <div className="flex flex-col gap-1 sm:w-52">
          <label htmlFor={monthId} className="text-sm font-semibold text-[#1f2937]">
            Feast month
          </label>
          <select
            id={monthId}
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="w-full rounded-full border border-[#e3c9a6] bg-white px-4 py-2 text-base text-[#1f2937] focus:border-[#c9773a] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#c9773a]/40"
          >
            <option value="">All months</option>
            {MONTHS.map((name, i) => (
              <option key={name} value={String(i + 1)}>
                {name}
              </option>
            ))}
          </select>
        </div>
        {filtered ? (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setMonth("");
            }}
            className="self-start rounded-full border border-[#c9773a] bg-white px-4 py-2 text-sm font-semibold text-[#9a4f1c] hover:bg-[#fff8f0] sm:self-end"
          >
            Clear
          </button>
        ) : null}
      </div>
      <p className="mb-0 mt-2 text-sm text-[#6b7280]" aria-live="polite">
        {filtered ? `Showing ${shown} of ${total} saints` : `${total} saints`}
      </p>

      {visible.length === 0 ? (
        <p className="mt-6 text-base text-[#374151]">No saints match. Try another name or month.</p>
      ) : null}

      <div className="mt-6 space-y-10">
        {visible.map((g) => (
          <section key={g.set} aria-labelledby={`set-${g.set}`}>
            <h2 id={`set-${g.set}`} className="font-[Georgia,serif] text-xl font-bold text-[#1f2937]">
              {g.set}
            </h2>
            <ul className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
              {g.cards.map((c) => (
                <li key={c.id}>
                  <Link
                    href={c.href}
                    className="group flex h-full flex-col rounded-2xl border border-[#f0d9b8] bg-white/90 p-2 text-sm no-underline hover:border-[#c9773a]"
                  >
                    <span className="block overflow-hidden rounded-lg bg-[#fbf7f1]">
                      <Image
                        src={c.thumb}
                        alt={`${c.title} saint card`}
                        width={432}
                        height={540}
                        unoptimized
                        loading="lazy"
                        className="block h-auto w-full transition-transform group-hover:scale-[1.02]"
                      />
                    </span>
                    <span className="mt-2 block px-1 font-bold leading-snug text-[#1f2937]">{c.title}</span>
                    {c.when ? <span className="mt-0.5 block px-1 text-xs text-[#6b7280]">{c.when}</span> : null}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
