import type { LiturgicalSeasonInfo } from "@/types/mass";

const colorStyles: Record<LiturgicalSeasonInfo["color"], string> = {
  green: "from-emerald-50 to-teal-50 border-emerald-200 text-emerald-900",
  purple: "from-violet-50 to-purple-50 border-violet-200 text-violet-900",
  white: "from-amber-50 to-orange-50 border-amber-200 text-amber-950",
  red: "from-rose-50 to-red-50 border-rose-200 text-rose-900",
  rose: "from-pink-50 to-rose-50 border-pink-200 text-pink-900",
};

const dotStyles: Record<LiturgicalSeasonInfo["color"], string> = {
  green: "bg-emerald-500",
  purple: "bg-violet-500",
  white: "bg-amber-500",
  red: "bg-rose-500",
  rose: "bg-pink-500",
};

type Props = {
  season: LiturgicalSeasonInfo;
  todayTitle?: string;
};

export function LiturgicalSeasonBanner({ season, todayTitle }: Props) {
  return (
    <section
      className={`rounded-2xl border bg-gradient-to-br p-6 shadow-sm md:p-8 ${colorStyles[season.color]}`}
    >
      <div className="flex items-start gap-3">
        <span
          className={`mt-1.5 h-3 w-3 shrink-0 rounded-full ${dotStyles[season.color]}`}
          aria-hidden
        />
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider opacity-80">
            Liturgical Season · {season.periodLabel}
          </p>
          <h1 className="mt-1 text-3xl font-extrabold tracking-tight md:text-4xl">
            {season.name}
          </h1>
          <p className="mt-3 max-w-2xl text-base leading-relaxed opacity-90">
            {season.description}
          </p>
          {todayTitle && (
            <p className="mt-4 rounded-xl bg-white/70 px-4 py-3 text-sm font-medium shadow-sm">
              Today: <span className="font-bold">{todayTitle}</span>
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
