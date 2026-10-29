"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export type ResourceSearchState = {
  q: string;
  season: string; // "" = all
  level: 1 | 2;
  /** "" = this Sunday, "all" = library, "custom" = saved sheets, "cards" = picture cards */
  view: "" | "all" | "custom" | "cards";
};

type Props = {
  state: ResourceSearchState;
  seasons: readonly { id: string; label: string }[];
  isPlus: boolean;
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
  if (s.view === "all" || s.view === "custom" || s.view === "cards") p.set("view", s.view);
  if (s.q.trim()) p.set("q", s.q.trim());
  if (s.season) p.set("season", s.season);
  if (s.level === 2) p.set("level", "2");
  const qs = p.toString();
  return `/resource${qs ? `?${qs}` : ""}`;
}

/** Horizontal search + filter bar for /resource. */
export function ResourceSearchBar({ state, seasons, isPlus }: Props) {
  const router = useRouter();
  const [q, setQ] = useState(state.q);

  const go = (patch: Partial<ResourceSearchState>) => router.push(href({ ...state, q, ...patch }));

  const thisSundayActive = state.view === "" && !state.q.trim() && !state.season;
  const cardsActive = state.view === "cards";
  const allActive = !cardsActive && (state.view === "all" || Boolean(state.q.trim() || state.season));
  const customActive = state.view === "custom";

  return (
    <form
      role="search"
      className="flex flex-wrap items-center gap-2.5 rounded-2xl border border-[#e8e0d6] bg-[#fdfaf7] p-3"
      onSubmit={(e) => {
        e.preventDefault();
        // Cards tab searches cards; everywhere else searches sheets.
        go({ view: state.view === "cards" ? "cards" : "all" });
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
          placeholder={
            cardsActive
              ? "Search cards — e.g. 'Rosary', 'Saint Joseph', 'Advent'"
              : "Search topic, Gospel or keyword — e.g. 'Good Shepherd'"
          }
          className="w-full bg-transparent text-sm text-[#1c1c1c] outline-none placeholder:text-[#6b7280]"
          maxLength={80}
        />
      </label>

      <button
        type="button"
        onClick={() => {
          setQ("");
          router.push(href({ q: "", season: "", level: state.level, view: "" }));
        }}
        className={`${pill} ${
          thisSundayActive
            ? "border-[#d35400] bg-[#d35400] text-white shadow-[0_2px_6px_rgba(211,84,0,0.3)]"
            : "border-2 border-[#d35400] bg-white text-[#d35400] hover:bg-[#fff6ef]"
        }`}
      >
        ★ This Sunday
      </button>

      <button
        type="button"
        onClick={() => {
          setQ("");
          go({ q: "", season: "", view: "all" });
        }}
        className={`${pill} ${
          allActive && !customActive
            ? "border-[#1c1c1c] bg-[#1c1c1c] text-white"
            : "border-[#e7e3de] bg-white text-[#1c1c1c] hover:bg-[#fffdfb]"
        }`}
      >
        All
      </button>

      {isPlus ? (
        <button
          type="button"
          onClick={() => {
            setQ("");
            go({ q: "", season: "", view: "custom" });
          }}
          className={`${pill} ${
            customActive
              ? "border-[#d35400] bg-[#fff6ef] text-[#d35400]"
              : "border-[#e7e3de] bg-white text-[#1c1c1c] hover:bg-[#fffdfb]"
          }`}
        >
          Custom
          <span className="rounded-md bg-[#d35400] px-1.5 py-0.5 text-[10px] font-bold text-white">PLUS</span>
        </button>
      ) : (
        <Link
          href="/subscribe"
          className={`${pill} border-[#e7e3de] bg-white text-[#1c1c1c] no-underline hover:bg-[#fffdfb]`}
          title="Save and reopen your edited sheets with Plus"
        >
          Custom
          <span className="rounded-md bg-[#d35400] px-1.5 py-0.5 text-[10px] font-bold text-white">PLUS</span>
        </Link>
      )}

      {(allActive || state.view === "all") && state.view !== "custom" && !cardsActive ? (
        <label className="inline-flex">
          <span className="sr-only">Season</span>
          <select
            className={selectCls}
            value={state.season}
            onChange={(e) => go({ season: e.target.value, view: "all" })}
          >
            <option value="">Season: All</option>
            {seasons.map((s) => (
              <option key={s.id} value={s.id}>
                Season: {s.label}
              </option>
            ))}
          </select>
        </label>
      ) : null}

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
