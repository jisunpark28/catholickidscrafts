"use client";

import { LiturgicalPeriodFilter } from "@/components/LiturgicalPeriodFilter";
import {
  RESOURCE_SORT_OPTIONS,
  type ResourceSortId,
} from "@/lib/resource-sort";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState, useTransition } from "react";

export function ResourcesToolbar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [pending, startTransition] = useTransition();
  const [q, setQ] = useState(searchParams.get("q") ?? "");

  const activeSort = (searchParams.get("sort") ?? "recent") as ResourceSortId;
  const hasFilter = Boolean(searchParams.get("q")?.trim() || searchParams.get("period"));

  const apply = useCallback(
    (next: { q?: string; period?: string; sort?: string }) => {
      const params = new URLSearchParams(searchParams.toString());
      const query = next.q !== undefined ? next.q : searchParams.get("q") ?? "";
      const period =
        next.period !== undefined ? next.period : searchParams.get("period") ?? "all";
      const sort =
        next.sort !== undefined ? next.sort : searchParams.get("sort") ?? "recent";
      if (query.trim()) params.set("q", query.trim());
      else params.delete("q");
      if (period && period !== "all") params.set("period", period);
      else params.delete("period");
      if (sort && sort !== "recent") params.set("sort", sort);
      else params.delete("sort");
      const qs = params.toString();
      startTransition(() => {
        router.push(qs ? `/resources?${qs}` : "/resources");
      });
    },
    [router, searchParams],
  );

  return (
    <div className="mb-8 space-y-5">
      <form
        className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-end"
        onSubmit={(e) => {
          e.preventDefault();
          apply({ q });
        }}
      >
        <label className="flex-1 text-sm font-semibold">
          Search
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="e.g. Advent wreath"
            className="mt-1 w-full rounded-lg border border-[var(--color-border)] bg-white px-3 py-2"
          />
        </label>
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-[var(--color-accent)] px-5 py-2 text-sm font-bold text-white disabled:opacity-60"
        >
          {pending ? "Searching…" : "Search"}
        </button>
        {hasFilter && (
          <button
            type="button"
            onClick={() => {
              setQ("");
              apply({ q: "", period: "all" });
            }}
            className="text-sm font-semibold text-[var(--color-link)]"
          >
            Clear filters
          </button>
        )}
      </form>

      <div>
        <p className="mb-2 text-xs font-bold uppercase tracking-wide text-[var(--color-muted)]">
          Liturgical season
        </p>
        <LiturgicalPeriodFilter />
      </div>

      <div>
        <p className="mb-2 text-xs font-bold uppercase tracking-wide text-[var(--color-muted)]">
          Sort
        </p>
        <div className="flex flex-wrap gap-2">
          {RESOURCE_SORT_OPTIONS.map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => apply({ sort: option.id })}
              className={`rounded-full px-4 py-2 text-xs font-bold transition-all ${
                activeSort === option.id
                  ? "bg-[var(--color-accent)] text-white shadow-sm"
                  : "bg-[var(--color-surface)] text-[var(--color-muted)] hover:text-[var(--color-ink)]"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
