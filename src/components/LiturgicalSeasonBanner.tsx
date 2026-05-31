import type { LiturgicalSeasonInfo } from "@/types/mass";

const accentBar: Record<LiturgicalSeasonInfo["color"], string> = {
  green: "bg-emerald-600",
  purple: "bg-violet-600",
  white: "bg-amber-500",
  red: "bg-red-600",
  rose: "bg-pink-500",
};

type Props = {
  season: LiturgicalSeasonInfo;
  todayTitle?: string;
};

export function LiturgicalSeasonBanner({ season, todayTitle }: Props) {
  return (
    <div className="border border-[var(--color-border)] bg-[var(--color-surface)]">
      <div className={`h-1 ${accentBar[season.color]}`} />
      <div className="px-6 py-6 sm:px-8 sm:py-8">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--color-muted)]">
          Liturgical season
        </p>
        <h2 className="mt-2 text-2xl font-bold text-[var(--color-ink)] sm:text-3xl">
          {season.name}
        </h2>
        <p className="mt-2 max-w-3xl text-[var(--color-muted)]">{season.description}</p>
        {todayTitle && (
          <p className="mt-5 border-t border-[var(--color-border)] pt-5 text-sm">
            <span className="font-semibold text-[var(--color-ink)]">Today: </span>
            {todayTitle}
          </p>
        )}
      </div>
    </div>
  );
}
