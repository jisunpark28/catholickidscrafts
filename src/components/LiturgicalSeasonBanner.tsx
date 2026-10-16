import { MassReadingShortcutLinks } from "@/components/MassReadingShortcutLinks";
import { formatLiturgicalTitleDisplay } from "@/lib/liturgical-calendar";
import type { LiturgicalSeasonInfo } from "@/types/mass";

const accentBar: Record<LiturgicalSeasonInfo["color"], string> = {
  green: "bg-emerald-600",
  purple: "bg-violet-600",
  white: "bg-amber-500",
  red: "bg-red-600",
  rose: "bg-pink-500",
};

const homeAccentBar: Record<LiturgicalSeasonInfo["color"], string> = {
  green: "bg-[#009966]",
  purple: "bg-violet-600",
  white: "bg-amber-500",
  red: "bg-red-600",
  rose: "bg-pink-500",
};

type ReadingLink = { href: string; label: string };

type Props = {
  season: LiturgicalSeasonInfo;
  todayTitle?: string;
  /** Saints / feasts from the General Roman Calendar (Evangelizo). */
  calendarCelebration?: string;
  /** Official reading sites for today (below General Roman Calendar). */
  readingLinks?: ReadingLink[];
  /** Optional hint below reading shortcut buttons. */
  readingLinkHint?: string;
  /** Home Daily Mass panel — enlarged banner text. */
  large?: boolean;
  /** Homepage PDF banner: season name only, color bar on a light panel. */
  variant?: "default" | "home";
};

export function LiturgicalSeasonBanner({
  season,
  todayTitle,
  calendarCelebration,
  readingLinks,
  readingLinkHint,
  large = false,
  variant = "default",
}: Props) {
  if (variant === "home") {
    return (
      <div className="bg-[#f9f9f9]">
        <div className={`h-[3px] ${homeAccentBar[season.color]}`} />
        <div className="border-b border-[#e6e8eb] px-5 py-4 sm:px-6 sm:py-5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#9aa0a6]">
            Liturgical season
          </p>
          <h2 className="mt-1.5 text-[1.65rem] font-bold leading-tight tracking-tight text-[#1c1c1c] sm:text-3xl">
            {season.name}
          </h2>
        </div>
      </div>
    );
  }

  const labelClass = large
    ? "text-sm font-bold uppercase tracking-[0.2em] text-[var(--color-muted)]"
    : "text-xs font-bold uppercase tracking-[0.2em] text-[var(--color-muted)]";
  const titleClass = large
    ? "mt-2 text-3xl font-bold text-[var(--color-ink)] sm:text-4xl"
    : "mt-2 text-2xl font-bold text-[var(--color-ink)] sm:text-3xl";
  const descriptionClass = large
    ? "mt-2 max-w-3xl text-lg text-[var(--color-muted)]"
    : "mt-2 max-w-3xl text-[var(--color-muted)]";
  const todayClass = large
    ? "mt-5 border-t border-[var(--color-border)] pt-5 text-lg"
    : "mt-5 border-t border-[var(--color-border)] pt-5 text-sm";
  const celebrationClass = large ? "mt-4 text-lg leading-relaxed" : "mt-4 text-sm leading-relaxed";

  const formattedTodayTitle = todayTitle ? formatLiturgicalTitleDisplay(todayTitle) : undefined;

  return (
    <div className="border border-[var(--color-border)] bg-[var(--color-surface)]">
      <div className={`h-1 ${accentBar[season.color]}`} />
      <div className="px-6 py-6 sm:px-8 sm:py-8">
        <p className={labelClass}>Liturgical season</p>
        <h2 className={titleClass}>{season.name}</h2>
        {season.description ? <p className={descriptionClass}>{season.description}</p> : null}
        {formattedTodayTitle && (
          <p className={todayClass}>
            <span className="font-semibold text-[var(--color-ink)]">Today: </span>
            {formattedTodayTitle}
          </p>
        )}
        {calendarCelebration && (
          <p className={celebrationClass}>
            <span className="font-semibold text-[var(--color-ink)]">
              General Roman Calendar:{" "}
            </span>
            <span className="text-[var(--color-ink)]">{calendarCelebration}</span>
          </p>
        )}
        {readingLinks && readingLinks.length > 0 && (
          <div className={calendarCelebration || formattedTodayTitle ? "mt-4" : "mt-5"}>
            <MassReadingShortcutLinks links={readingLinks} />
            {readingLinkHint ? (
              <p className="mt-2.5 text-sm text-[var(--color-muted)]">{readingLinkHint}</p>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}
