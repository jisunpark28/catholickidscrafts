"use client";

import { LITURGICAL_PERIODS } from "@/lib/content-types";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState, useTransition } from "react";

export function ResourcesToolbar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [pending, startTransition] = useTransition();
  const [q, setQ] = useState(searchParams.get("q") ?? "");

  const activePeriod = searchParams.get("period") ?? "all";
  const hasFilter = Boolean(searchParams.get("q")?.trim() || searchParams.get("period"));

  const apply = useCallback(
    (next: { q?: string; period?: string }) => {
      const params = new URLSearchParams();
      const query = next.q !== undefined ? next.q : searchParams.get("q") ?? "";
      const period =
        next.period !== undefined ? next.period : searchParams.get("period") ?? "all";
      if (query.trim()) params.set("q", query.trim());
      if (period && period !== "all") params.set("period", period);
      const qs = params.toString();
      startTransition(() => {
        router.push(qs ? `/resources?${qs}` : "/resources");
      });
    },
    [router, searchParams],
  );

  return (
    <div className="mb-10 space-y-4 border border-[var(--color-border)] bg-white p-4 sm:p-6">
      <form
        className="flex flex-col gap-3 sm:flex-row"
        onSubmit={(e) => {
          e.preventDefault();
          apply({ q });
        }}
      >
        <label className="sr-only" htmlFor="resources-search">
          Search kids resources
        </label>
        <input
          id="resources-search"
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search title, topic, grade, description…"
          className="min-w-0 flex-1 border border-[var(--color-border)] px-3 py-2 text-sm"
        />
        <button
          type="submit"
          disabled={pending}
          className="bg-[var(--color-accent)] px-5 py-2 text-sm font-bold text-white disabled:opacity-60"
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
            className="border border-[var(--color-border)] px-4 py-2 text-sm font-semibold"
          >
            Clear
          </button>
        )}
      </form>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          disabled={pending}
          onClick={() => apply({ period: "all" })}
          className={`px-3 py-1.5 text-sm font-semibold ${
            activePeriod === "all"
              ? "bg-[var(--color-accent)] text-white"
              : "border border-[var(--color-border)] bg-[var(--color-surface)] hover:border-[var(--color-accent)]"
          }`}
        >
          All seasons
        </button>
        {LITURGICAL_PERIODS.map((period) => {
          const active = activePeriod === period.id;
          return (
            <button
              key={period.id}
              type="button"
              disabled={pending}
              onClick={() => apply({ period: period.id })}
              className={`px-3 py-1.5 text-sm font-semibold ${
                active
                  ? "bg-[var(--color-accent)] text-white"
                  : "border border-[var(--color-border)] bg-[var(--color-surface)] hover:border-[var(--color-accent)]"
              }`}
            >
              {period.title}
            </button>
          );
        })}
      </div>
    </div>
  );
}
