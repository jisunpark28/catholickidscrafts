"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Option = { value: string; label: string };

export type ResourceSearchState = {
  q: string;
  year: string; // "" = all
  season: string; // "" = all
  country: string;
  level: 1 | 2;
};

type Props = {
  state: ResourceSearchState;
  seasons: readonly { id: string; label: string }[];
  countries: Option[];
  countryCookie: string;
  /** True on the default "this Sunday" view (highlights the button). */
  thisSundayActive: boolean;
};

const pill =
  "inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-full border px-3.5 py-2 text-sm font-medium transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#d35400]";
const segWrap = "inline-flex overflow-hidden rounded-full border border-[#e7e3de] bg-white text-sm";
const segBtn = (on: boolean) =>
  `px-3 py-2 font-medium transition focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[#d35400] ${
    on ? "bg-[#f5ebe0] font-semibold text-[#1c1c1c]" : "text-[#4b5563] hover:bg-[#fffdfb]"
  }`;
const selectCls =
  "rounded-full border border-[#e7e3de] bg-white px-3 py-2 text-sm font-medium text-[#1c1c1c] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#d35400]";

function href(s: ResourceSearchState): string {
  const p = new URLSearchParams();
  if (s.q.trim()) p.set("q", s.q.trim());
  if (s.year) p.set("year", s.year);
  if (s.season) p.set("season", s.season);
  if (s.country) p.set("country", s.country);
  if (s.level === 2) p.set("level", "2");
  const qs = p.toString();
  return `/resource${qs ? `?${qs}` : ""}`;
}

/** Horizontal search + filter bar for /resource. Every change updates the URL (shareable, crawl-safe). */
export function ResourceSearchBar({ state, seasons, countries, countryCookie, thisSundayActive }: Props) {
  const router = useRouter();
  const [q, setQ] = useState(state.q);

  const go = (patch: Partial<ResourceSearchState>) => router.push(href({ ...state, q, ...patch }));

  return (
    <form
      role="search"
      className="flex flex-wrap items-center gap-2.5 rounded-2xl border border-[#e8e0d6] bg-[#fdfaf7] p-3"
      onSubmit={(e) => {
        e.preventDefault();
        go({});
      }}
    >
      <label className="flex min-w-[15rem] flex-1 items-center gap-2 rounded-full border border-[#e7e3de] bg-white px-4 py-2">
        <span aria-hidden>🔍</span>
        <span className="sr-only">Search sheets</span>
        <input
          type="search"
          name="q"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search topic, Gospel or keyword — e.g. 'Good Shepherd'"
          className="w-full bg-transparent text-sm text-[#1c1c1c] outline-none placeholder:text-[#6b7280]"
          maxLength={80}
        />
      </label>
      <button
        type="button"
        onClick={() => {
          setQ("");
          router.push(href({ q: "", year: "", season: "", country: state.country, level: state.level }));
        }}
        className={`${pill} ${
          thisSundayActive
            ? "border-[#d35400] bg-[#d35400] text-white shadow-[0_2px_6px_rgba(211,84,0,0.3)]"
            : "border-2 border-[#d35400] bg-white text-[#d35400] hover:bg-[#fff6ef]"
        }`}
      >
        ★ This Sunday
      </button>

      <div className={segWrap} role="group" aria-label="Liturgical year">
        {[
          ["", "All"],
          ["A", "Year A"],
          ["B", "Year B"],
          ["C", "Year C"],
        ].map(([v, label]) => (
          <button
            key={v}
            type="button"
            className={segBtn(state.year === v)}
            aria-pressed={state.year === v}
            onClick={() => go({ year: v })}
          >
            {label}
          </button>
        ))}
      </div>

      <label className="inline-flex">
        <span className="sr-only">Season</span>
        <select className={selectCls} value={state.season} onChange={(e) => go({ season: e.target.value })}>
          <option value="">Season: All</option>
          {seasons.map((s) => (
            <option key={s.id} value={s.id}>
              Season: {s.label}
            </option>
          ))}
        </select>
      </label>

      <label className="inline-flex">
        <span className="sr-only">Country calendar</span>
        <select
          className={selectCls}
          value={state.country}
          onChange={(e) => {
            const v = e.target.value;
            document.cookie = `${countryCookie}=${encodeURIComponent(v)}; path=/; max-age=31536000; samesite=lax`;
            go({ country: v });
          }}
        >
          {countries.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>
      </label>

      <div className={segWrap} role="group" aria-label="Level">
        {([1, 2] as const).map((n) => (
          <button
            key={n}
            type="button"
            className={segBtn(state.level === n)}
            aria-pressed={state.level === n}
            onClick={() => go({ level: n })}
          >
            Level {n}
          </button>
        ))}
      </div>
    </form>
  );
}
