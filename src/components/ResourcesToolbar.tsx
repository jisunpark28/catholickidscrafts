"use client";

import { textFromCopy, useSiteCopy } from "@/components/SiteCopyProvider";
import { LITURGICAL_PERIODS } from "@/lib/content-types";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState, useTransition } from "react";

export function ResourcesToolbar() {
  const copy = useSiteCopy();
  const t = (key: string, fallback = "") => textFromCopy(copy, key, fallback);
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
    <form
      className="mb-8 flex flex-col gap-4 border border-[var(--color-border)] bg-white p-4 sm:flex-row sm:flex-wrap sm:items-end"
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
          className="mt-1 w-full border border-[var(--color-border)] px-3 py-2"
        />
      </label>
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
          className="text-sm font-semibold text-[var(--color-link)]"
        >
          Clear filters
        </button>
      )}

      <div className="w-full border-t border-[var(--color-border)] pt-4">
        <p className="mb-2 text-xs font-bold uppercase tracking-wide text-[var(--color-muted)]">
          Liturgical season
        </p>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => apply({ period: "all" })}
            className={`border px-3 py-1.5 text-xs font-bold ${
              activePeriod === "all"
                ? "border-[var(--color-accent)] bg-[var(--color-accent)] text-white"
                : "border-[var(--color-border)] bg-[var(--color-surface)]"
            }`}
          >
            All
          </button>
          {LITURGICAL_PERIODS.map((period) => {
            const title = t(`taxonomy.liturgical.${period.id}.title`, period.title);
            return (
              <button
                key={period.id}
                type="button"
                onClick={() => apply({ period: period.id })}
                className={`border px-3 py-1.5 text-xs font-bold ${
                  activePeriod === period.id
                    ? "border-[var(--color-accent)] bg-[var(--color-accent)] text-white"
                    : "border-[var(--color-border)] bg-[var(--color-surface)]"
                }`}
              >
                {title}
              </button>
            );
          })}
        </div>
      </div>
    </form>
  );
}
