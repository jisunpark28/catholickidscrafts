"use client";

import { MB_STAMP_INFO } from "@/lib/moms-bible/constants";
import Link from "next/link";
import { useEffect, useState } from "react";
import "@/styles/moms-bible.css";

export type StampCell = {
  label: string;
  href: string;
  stamp: "waiting" | "shared" | "highlights" | null;
  read: boolean;
};

const FILTER_KEY = "ckc_mb_filter_marked";

/** Book index for Mom's Bible viewers: chapter tiles with stamps and a "marked only" filter. */
export function MbStampGrid({
  bookName,
  cells,
  filterLabel,
  waitingLabel,
}: {
  bookName: string;
  cells: readonly StampCell[];
  filterLabel: string;
  waitingLabel: string;
}) {
  const [only, setOnly] = useState(false);
  useEffect(() => {
    try {
      setOnly(window.localStorage.getItem(FILTER_KEY) === "1");
    } catch {
      /* ignore */
    }
  }, []);
  const toggle = () => {
    const next = !only;
    setOnly(next);
    try {
      window.localStorage.setItem(FILTER_KEY, next ? "1" : "0");
    } catch {
      /* ignore */
    }
  };
  const marked = cells.filter((c) => c.stamp);
  const shown = only ? marked : cells;
  const legend = { ...MB_STAMP_INFO, waiting: { ...MB_STAMP_INFO.waiting, label: waitingLabel } };

  return (
    <div className="mb-index mt-8 w-full">
      <div className="mb-index__bar">
        <button type="button" className={`mb-chip${only ? " mb-chip--on" : ""}`} aria-pressed={only} onClick={toggle}>
          ✨ {filterLabel}
        </button>
        <span className="text-xs text-[var(--color-muted)]">
          Showing {shown.length} of {cells.length}
        </span>
      </div>
      <ul className="mb-index__legend">
        {(Object.keys(legend) as (keyof typeof legend)[]).map((k) => (
          <li key={k}>
            <span aria-hidden>{legend[k].emoji}</span> {legend[k].label}
          </li>
        ))}
      </ul>
      {shown.length === 0 ? (
        <p className="mt-6 text-center text-sm text-[var(--color-muted)]">Nothing marked in {bookName} yet.</p>
      ) : (
        <div className="mb-index__grid">
          {shown.map((c) => (
            <Link
              key={c.label}
              href={c.href}
              className={`mb-tile${c.stamp ? ` mb-tile--${c.stamp}` : ""}${c.read ? " mb-tile--read" : ""}`}
              title={`${bookName} ${c.label}`}
              aria-label={`Chapter ${c.label}${c.stamp ? `, ${legend[c.stamp].label}` : ""}${c.read ? ", read" : ""}`}
            >
              <span className="mb-tile__num">{c.label}</span>
              {c.stamp && (
                <span className="mb-tile__stamp" aria-hidden>
                  {legend[c.stamp].emoji}
                </span>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
