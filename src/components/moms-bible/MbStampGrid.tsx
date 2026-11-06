"use client";

import { MB_STAMP_INFO } from "@/lib/moms-bible/constants";
import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";
import "@/styles/moms-bible.css";

export type StampCell = {
  label: string;
  href: string;
  stamp: "mine" | "waiting" | "shared" | null;
  /** Set on testament-wide highlight cards so the book name can show under the stamp. */
  bookName?: string;
};

const FILTER_KEY = "ckc_mb_filter_marked";

/** Book index for Mom's Bible viewers: chapter tiles with stamps and a highlights-only toggle. */
export function MbStampGrid({
  bookName,
  testamentLabel,
  cells,
  highlightCells,
  viewer,
  roleLabel,
  toolbar,
  bookSelect,
}: {
  bookName: string;
  testamentLabel: string;
  cells: readonly StampCell[];
  highlightCells: readonly StampCell[];
  viewer: "parent" | "child";
  /** "Mom" / "Mom & Dad": whose highlights the toggle shows. */
  roleLabel: string;
  toolbar?: ReactNode;
  bookSelect?: ReactNode;
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
  const shown = only ? highlightCells : cells;
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
      <div className="mb-index__toolbar">
        <button type="button" role="switch" aria-checked={only} className="mb-toggle" onClick={toggle}>
          ✨ Show {roleLabel}&apos;s Highlights Only <span className="mb-switch" aria-hidden />
        </button>
        {toolbar}
      </div>
      {!only && (
        <div className="mb-index__head">
          <h1 className="mb-index__title">{bookName} — Chapters</h1>
          {bookSelect}
        </div>
      )}
      <div className="mb-index__bar">
        <p className="mb-legend">
          ⓘ <b>Stamps:</b>{" "}
          {keys.map((k) => (
            <span key={k} className="mr-3 inline-block">
              <span aria-hidden>{MB_STAMP_INFO[k].emoji}</span> {legend[k]}
            </span>
          ))}
        </p>
      </div>
      {shown.length === 0 ? (
        <p className="mt-6 text-center text-sm text-[#8a7d96]">
          Nothing marked in {only ? testamentLabel : bookName} yet.
        </p>
      ) : (
        <div className={`mb-index__grid${only ? " mb-index__grid--highlights" : ""}`}>
          {shown.map((c) => (
            <Link
              key={c.href}
              href={c.href}
              className={`mb-tile${c.stamp ? " mb-tile--on" : ""}${only && c.bookName ? " mb-tile--book" : ""}`}
              title={c.bookName ? `${c.bookName} ${c.label}` : `${bookName} ${c.label}`}
              aria-label={
                c.bookName
                  ? `${c.bookName} chapter ${c.label}${c.stamp ? `, ${MB_STAMP_INFO[c.stamp].label}` : ""}`
                  : `Chapter ${c.label}${c.stamp ? `, ${MB_STAMP_INFO[c.stamp].label}` : ""}`
              }
            >
              {only && c.bookName ? (
                <>
                  <span className="mb-tile__badge" aria-hidden>
                    <span className="mb-tile__stamp">{c.stamp ? MB_STAMP_INFO[c.stamp].emoji : ""}</span>
                    <b>{c.label}</b>
                  </span>
                  <span className="mb-tile__book">{c.bookName}</span>
                </>
              ) : (
                <>
                  <b>{c.label}</b>
                  <span className="mb-tile__stamp" aria-hidden>
                    {c.stamp ? MB_STAMP_INFO[c.stamp].emoji : ""}
                  </span>
                </>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
