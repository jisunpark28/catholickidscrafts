"use client";

import { MB_STAMP_INFO } from "@/lib/moms-bible/constants";
import Link from "next/link";
import { useEffect, useState } from "react";
import "@/styles/moms-bible.css";

export type StampCell = {
  label: string;
  href: string;
  stamp: "mine" | "waiting" | "shared" | null;
};

const FILTER_KEY = "ckc_mb_filter_marked";

/** Book index for Mom's Bible viewers (mockups 3 / 3b): chapter tiles with stamps and a highlights-only toggle. */
export function MbStampGrid({
  bookName,
  cells,
  viewer,
  roleLabel,
}: {
  bookName: string;
  cells: readonly StampCell[];
  viewer: "parent" | "child";
  /** "Mom" / "Mom & Dad": whose highlights the toggle shows. */
  roleLabel: string;
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
  const shown = only ? cells.filter((c) => c.stamp) : cells;
  const legend =
    viewer === "parent"
      ? {
          mine: `${MB_STAMP_INFO.mine.label} (I wrote, not read yet)`,
          waiting: `${MB_STAMP_INFO.waiting.label} (new reply to read)`,
          shared: `${MB_STAMP_INFO.shared.label} (both replied)`,
        }
      : {
          mine: `Marked for You (highlights)`,
          waiting: `${MB_STAMP_INFO.waiting.label} (new note to read)`,
          shared: `${MB_STAMP_INFO.shared.label} (both replied)`,
        };
  const keys = ["mine", "waiting", "shared"] as const;

  return (
    <div className="mb-index w-full">
      <h1 className="mb-index__title">{bookName} — Chapters</h1>
      <div className="mb-index__bar">
        <p className="mb-legend">
          ⓘ <b>Stamps:</b>{" "}
          {keys.map((k) => (
            <span key={k} className="mr-3 inline-block">
              <span aria-hidden>{MB_STAMP_INFO[k].emoji}</span> {legend[k]}
            </span>
          ))}
        </p>
        <button type="button" role="switch" aria-checked={only} className="mb-toggle" onClick={toggle}>
          ✨ Show {roleLabel}&apos;s Highlights Only <span className="mb-switch" aria-hidden />
        </button>
      </div>
      {shown.length === 0 ? (
        <p className="mt-6 text-center text-sm text-[#8a7d96]">Nothing marked in {bookName} yet.</p>
      ) : (
        <div className="mb-index__grid">
          {shown.map((c) => (
            <Link
              key={c.label}
              href={c.href}
              className={`mb-tile${c.stamp ? " mb-tile--on" : ""}`}
              title={`${bookName} ${c.label}`}
              aria-label={`Chapter ${c.label}${c.stamp ? `, ${MB_STAMP_INFO[c.stamp].label}` : ""}`}
            >
              <b>{c.label}</b>
              <span className="mb-tile__stamp" aria-hidden>
                {c.stamp ? MB_STAMP_INFO[c.stamp].emoji : ""}
              </span>
            </Link>
          ))}
        </div>
      )}
      {only && (
        <p className="mb-index__count">
          Showing {shown.length} of {cells.length} · turn off to see all
        </p>
      )}
    </div>
  );
}
