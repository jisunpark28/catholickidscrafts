"use client";

import type { LearnSearchKind, LearnSearchResult } from "@/lib/learn-catalog";
import Link from "next/link";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";

const KIND_LABEL: Record<LearnSearchKind, string> = {
  resource: "Resource",
  curriculum: "Curriculum",
  game: "Game",
  bible: "Bible",
  home: "Home",
  prayer: "Prayer",
};

type PanelProps = {
  loading: boolean;
  results: LearnSearchResult[];
  onPick: () => void;
  listClassName?: string;
};

function SearchResultsPanel({
  loading,
  results,
  onPick,
  listClassName = "max-h-80",
}: PanelProps) {
  return (
    <div className="overflow-hidden rounded-2xl border border-[#e8e0d6] bg-white shadow-md">
      {loading && <p className="px-4 py-3 text-sm text-[var(--color-muted)]">Searching…</p>}
      {!loading && results.length === 0 && (
        <p className="px-4 py-3 text-sm text-[var(--color-muted)]">No matches. Try another word.</p>
      )}
      {!loading && results.length > 0 && (
        <ul className={`overflow-y-auto ${listClassName}`}>
          {results.map((item) => (
            <li key={item.id} className="border-b border-[var(--color-border)] last:border-b-0">
              <Link
                href={item.href}
                onClick={onPick}
                className="block px-4 py-3 hover:bg-[var(--color-surface)]"
              >
                <div className="flex items-start justify-between gap-3">
                  <span className="font-semibold text-[var(--color-ink)]">{item.title}</span>
                  <span className="shrink-0 text-[10px] font-bold uppercase tracking-wide text-[var(--color-muted)]">
                    {KIND_LABEL[item.kind]}
                  </span>
                </div>
                {item.excerpt && (
                  <p className="mt-1 line-clamp-2 text-sm text-[var(--color-muted)]">{item.excerpt}</p>
                )}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

type Props = {
  /** Compact pill for the home hub header bar */
  variant?: "default" | "header";
  className?: string;
  /** Header-only: render results in this element (in document flow, full header width) */
  headerResultsSlotId?: string;
};

export function HomeLearnSearch({
  variant = "default",
  className = "",
  headerResultsSlotId,
}: Props) {
  const [q, setQ] = useState("");
  const [results, setResults] = useState<LearnSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [resultsSlot, setResultsSlot] = useState<HTMLElement | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const inputId = useId();
  const isHeader = variant === "header";

  const runSearch = useCallback(async (query: string) => {
    const trimmed = query.trim();
    if (trimmed.length < 2) {
      setResults([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/learn/search?q=${encodeURIComponent(trimmed)}`);
      const data = (await res.json()) as { results?: LearnSearchResult[] };
      setResults(data.results ?? []);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!headerResultsSlotId) return;
    setResultsSlot(document.getElementById(headerResultsSlotId));
  }, [headerResultsSlotId]);

  useEffect(() => {
    if (!open) return;
    const id = window.setTimeout(() => void runSearch(q), 280);
    return () => clearTimeout(id);
  }, [q, open, runSearch]);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) {
        const inSlot = resultsSlot?.contains(e.target as Node);
        if (!inSlot) setOpen(false);
      }
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [resultsSlot]);

  useEffect(() => {
    if (!open) return;
    function onScroll() {
      setOpen(false);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [open]);

  const showPanel = open && q.trim().length >= 2;
  const closePanel = () => setOpen(false);

  const inputClass = isHeader
    ? "w-full min-w-0 rounded-2xl border border-[#e8e0d6] bg-[#fdfaf7] py-2.5 pl-9 pr-3 text-sm font-medium text-[var(--color-ink)] shadow-sm outline-none transition placeholder:text-[var(--color-muted)] focus:border-[#d4b896] focus:bg-white sm:min-h-[3rem] sm:py-3 sm:pl-10"
    : "w-full rounded-2xl border border-[#e8e0d6] bg-[#fdfaf7] py-3.5 pl-10 pr-4 text-base font-medium text-[var(--color-ink)] shadow-sm outline-none transition focus:border-[#d4b896] focus:bg-white";

  const headerPanel =
    showPanel && isHeader && resultsSlot
      ? createPortal(
          <div className="mt-2 w-full">
            <SearchResultsPanel
              loading={loading}
              results={results}
              onPick={closePanel}
              listClassName="max-h-[min(16rem,50vh)]"
            />
          </div>,
          resultsSlot,
        )
      : null;

  return (
    <>
      <div ref={rootRef} className={`relative ${className}`}>
        <label className="sr-only" htmlFor={inputId}>
          Search resources, curriculum, and games
        </label>
        <div className="relative">
          <span
            className={`pointer-events-none absolute top-1/2 -translate-y-1/2 text-[var(--color-muted)] ${
              isHeader ? "left-3 text-sm sm:left-3.5" : "left-4"
            }`}
            aria-hidden
          >
            ⌕
          </span>
          <input
            id={inputId}
            type="search"
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            placeholder={isHeader ? "Search…" : "Search resources, curriculum, games, Bible…"}
            className={inputClass}
            autoComplete="off"
            suppressHydrationWarning
          />
        </div>

        {showPanel && !isHeader && (
          <div className="absolute z-30 mt-2 w-full">
            <SearchResultsPanel loading={loading} results={results} onPick={closePanel} />
          </div>
        )}
      </div>
      {headerPanel}
    </>
  );
}
