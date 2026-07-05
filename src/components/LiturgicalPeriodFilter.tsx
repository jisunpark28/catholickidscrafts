"use client";

import { textFromCopy, useSiteCopy } from "@/components/SiteCopyProvider";
import { LITURGICAL_PERIODS } from "@/lib/content-types";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useTransition } from "react";

export function LiturgicalPeriodFilter() {
  const copy = useSiteCopy();
  const t = (key: string, fallback = "") => textFromCopy(copy, key, fallback);
  const router = useRouter();
  const searchParams = useSearchParams();
  const [pending, startTransition] = useTransition();
  const currentPeriod = searchParams.get("period") ?? "all";

  const handleSelect = useCallback(
    (id: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (id === "all") params.delete("period");
      else params.set("period", id);
      const qs = params.toString();
      startTransition(() => {
        router.push(qs ? `/resources?${qs}` : "/resources");
      });
    },
    [router, searchParams],
  );

  return (
    <div
      className={`scrollbar-hide flex w-full snap-x snap-mandatory gap-3 overflow-x-auto pb-1 ${pending ? "opacity-70" : ""}`}
      role="tablist"
      aria-label="Liturgical season"
    >
      <button
        type="button"
        role="tab"
        aria-selected={currentPeriod === "all"}
        onClick={() => handleSelect("all")}
        className={periodPillClass(currentPeriod === "all")}
      >
        All
      </button>
      {LITURGICAL_PERIODS.map((period) => {
        const isActive = currentPeriod === period.id;
        const title = t(`taxonomy.liturgical.${period.id}.title`, period.title);
        return (
          <button
            key={period.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => handleSelect(period.id)}
            className={periodPillClass(isActive)}
          >
            {title}
          </button>
        );
      })}
    </div>
  );
}

function periodPillClass(isActive: boolean): string {
  const base =
    "snap-start shrink-0 whitespace-nowrap rounded-full px-5 py-2.5 text-sm font-semibold transition-all duration-200";
  if (isActive) {
    return `${base} scale-105 bg-[var(--color-accent)] text-white shadow-md shadow-[var(--color-accent)]/25`;
  }
  return `${base} bg-[var(--color-surface)] text-[var(--color-muted)] hover:bg-[var(--color-border)]/60 hover:text-[var(--color-ink)]`;
}
