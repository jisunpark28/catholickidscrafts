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
  /** Focus the input on mount (mobile search expanded from the icon). */
  autoFocus?: boolean;
};

type SpeechRecognitionLike = {
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  onresult: ((e: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
  onend: (() => void) | null;
  onerror: (() => void) | null;
  start: () => void;
  stop: () => void;
};

/** Browser speech recognition if available (Chrome, Edge, Safari); otherwise null and the mic is hidden. */
function speechCtor(): (new () => SpeechRecognitionLike) | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as Record<string, unknown>;
  return ((w.SpeechRecognition ?? w.webkitSpeechRecognition) as (new () => SpeechRecognitionLike) | undefined) ?? null;
}

export function HomeLearnSearch({
  variant = "default",
  className = "",
  headerResultsSlotId,
  autoFocus = false,
}: Props) {
  const [q, setQ] = useState("");
  const [results, setResults] = useState<LearnSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [resultsSlot, setResultsSlot] = useState<HTMLElement | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const inputId = useId();
  const isHeader = variant === "header";
  const inputRef = useRef<HTMLInputElement>(null);
  const [canSpeak, setCanSpeak] = useState(false);
  const [listening, setListening] = useState(false);
  const recRef = useRef<SpeechRecognitionLike | null>(null);

  useEffect(() => {
    setCanSpeak(isHeader && speechCtor() !== null);
    if (autoFocus) inputRef.current?.focus();
  }, [isHeader, autoFocus]);

  useEffect(() => () => recRef.current?.stop(), []);

  function toggleVoice() {
    if (listening) {
      recRef.current?.stop();
      return;
    }
    const Ctor = speechCtor();
    if (!Ctor) return;
    const rec = new Ctor();
    rec.lang = "en-US";
    rec.interimResults = false;
    rec.maxAlternatives = 1;
    rec.onresult = (e) => {
      const text = e.results[0]?.[0]?.transcript ?? "";
      if (text) {
        setQ(text);
        setOpen(true);
      }
    };
    rec.onend = () => setListening(false);
    rec.onerror = () => setListening(false);
    recRef.current = rec;
    setListening(true);
    try {
      rec.start();
    } catch {
      setListening(false);
    }
  }

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
    ? "w-full min-w-0 rounded-full border border-[#e8dccf] bg-white/95 py-2.5 pl-12 pr-20 text-sm font-medium text-[var(--color-ink)] shadow-[0_4px_14px_-8px_rgba(120,84,48,0.35)] outline-none transition placeholder:text-[#8a7f74] focus:border-[#7f9a5a] focus:bg-white sm:min-h-[2.75rem] [&::-webkit-search-cancel-button]:appearance-none"
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
          {isHeader ? (
            <span
              className="pointer-events-none absolute left-1.5 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-[#7f9a5a] text-white"
              aria-hidden
            >
              <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="8.5" cy="8.5" r="5.25" />
                <path d="M12.5 12.5 17 17" strokeLinecap="round" />
              </svg>
            </span>
          ) : (
            <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#9aa0a6]" aria-hidden>
              ⌕
            </span>
          )}
          <input
            ref={inputRef}
            id={inputId}
            type="search"
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            placeholder={isHeader ? "Search for crafts, Bible stories..." : "Search resources, curriculum, games, Bible…"}
            className={inputClass}
            autoComplete="off"
            suppressHydrationWarning
          />
          {isHeader ? (
            <div className="absolute right-2 top-1/2 flex -translate-y-1/2 items-center gap-0.5">
              {q ? (
                <button
                  type="button"
                  onClick={() => {
                    setQ("");
                    setResults([]);
                    inputRef.current?.focus();
                  }}
                  aria-label="Clear search"
                  className="flex h-8 w-8 items-center justify-center rounded-full text-[#6b625a] hover:bg-[#f5ebe0] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#7f9a5a]"
                >
                  <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                    <path d="M5 5l10 10M15 5L5 15" strokeLinecap="round" />
                  </svg>
                </button>
              ) : null}
              {canSpeak ? (
                <button
                  type="button"
                  onClick={toggleVoice}
                  aria-label={listening ? "Stop voice search" : "Search by voice"}
                  aria-pressed={listening}
                  className={`flex h-8 w-8 items-center justify-center rounded-full hover:bg-[#f5ebe0] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#7f9a5a] ${
                    listening ? "text-[#d35400]" : "text-[#6b625a]"
                  }`}
                >
                  <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
                    <rect x="7" y="2.5" width="6" height="10" rx="3" />
                    <path d="M4.5 9.5a5.5 5.5 0 0 0 11 0M10 15v2.5" strokeLinecap="round" />
                  </svg>
                </button>
              ) : null}
            </div>
          ) : null}
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
