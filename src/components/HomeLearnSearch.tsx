"use client";

import type { LearnSearchKind, LearnSearchResult } from "@/lib/learn-catalog";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

const KIND_LABEL: Record<LearnSearchKind, string> = {
  resource: "Resource",
  curriculum: "Curriculum",
  game: "Game",
  bible: "Bible",
  home: "Home",
};

export function HomeLearnSearch() {
  const [q, setQ] = useState("");
  const [results, setResults] = useState<LearnSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

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
    if (!open) return;
    const id = window.setTimeout(() => void runSearch(q), 280);
    return () => clearTimeout(id);
  }, [q, open, runSearch]);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  const showPanel = open && q.trim().length >= 2;

  return (
    <div ref={rootRef} className="relative mb-8">
      <label className="sr-only" htmlFor="home-learn-search">
        Search resources, curriculum, and games
      </label>
      <div className="relative">
        <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-muted)]">
          ⌕
        </span>
        <input
          id="home-learn-search"
          type="search"
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder="Search resources, curriculum, games, Bible…"
          className="w-full rounded-[2rem] border border-[var(--color-border)] bg-[#faf6f1] py-4 pl-11 pr-4 text-base text-[var(--color-ink)] shadow-sm outline-none focus:border-[var(--color-accent)]"
          autoComplete="off"
        />
      </div>

      {showPanel && (
        <div className="absolute z-20 mt-2 w-full overflow-hidden rounded-2xl border border-[var(--color-border)] bg-white shadow-lg">
          {loading && (
            <p className="px-4 py-3 text-sm text-[var(--color-muted)]">Searching…</p>
          )}
          {!loading && results.length === 0 && (
            <p className="px-4 py-3 text-sm text-[var(--color-muted)]">No matches. Try another word.</p>
          )}
          {!loading && results.length > 0 && (
            <ul className="max-h-80 overflow-y-auto">
              {results.map((item) => (
                <li key={item.id} className="border-b border-[var(--color-border)] last:border-b-0">
                  <Link
                    href={item.href}
                    onClick={() => setOpen(false)}
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
      )}
    </div>
  );
}
