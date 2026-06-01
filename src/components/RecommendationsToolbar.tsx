"use client";

import { RECOMMENDATION_KINDS } from "@/lib/recommendation-types";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState, useTransition } from "react";

export function RecommendationsToolbar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [pending, startTransition] = useTransition();
  const [q, setQ] = useState(searchParams.get("q") ?? "");

  const activeKind = searchParams.get("kind") ?? "all";

  const apply = useCallback(
    (next: { q?: string; kind?: string }) => {
      const params = new URLSearchParams();
      const query = next.q !== undefined ? next.q : searchParams.get("q") ?? "";
      const kind = next.kind !== undefined ? next.kind : searchParams.get("kind") ?? "all";
      if (query.trim()) params.set("q", query.trim());
      if (kind && kind !== "all") params.set("kind", kind);
      const qs = params.toString();
      startTransition(() => {
        router.push(qs ? `/recommendations?${qs}` : "/recommendations");
      });
    },
    [router, searchParams],
  );

  return (
    <div className="space-y-4 border border-[var(--color-border)] bg-white p-4 sm:p-6">
      <form
        className="flex flex-col gap-3 sm:flex-row"
        onSubmit={(e) => {
          e.preventDefault();
          apply({ q });
        }}
      >
        <label className="sr-only" htmlFor="rec-search">
          Search recommendations
        </label>
        <input
          id="rec-search"
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search title, author, tags…"
          className="min-w-0 flex-1 border border-[var(--color-border)] px-3 py-2 text-sm"
        />
        <button
          type="submit"
          disabled={pending}
          className="bg-[var(--color-accent)] px-5 py-2 text-sm font-bold text-white disabled:opacity-60"
        >
          {pending ? "Searching…" : "Search"}
        </button>
        {(searchParams.get("q") || searchParams.get("kind")) && (
          <button
            type="button"
            onClick={() => {
              setQ("");
              apply({ q: "", kind: "all" });
            }}
            className="border border-[var(--color-border)] px-4 py-2 text-sm font-semibold"
          >
            Clear
          </button>
        )}
      </form>

      <div className="flex flex-wrap gap-2">
        {RECOMMENDATION_KINDS.map((k) => {
          const id = k.id === "ALL" ? "all" : k.id.toLowerCase();
          const active = activeKind === id;
          return (
            <button
              key={id}
              type="button"
              disabled={pending}
              onClick={() => apply({ kind: id })}
              className={`px-3 py-1.5 text-sm font-semibold ${
                active
                  ? "bg-[var(--color-accent)] text-white"
                  : "border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-ink)] hover:border-[var(--color-accent)]"
              }`}
            >
              {k.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
