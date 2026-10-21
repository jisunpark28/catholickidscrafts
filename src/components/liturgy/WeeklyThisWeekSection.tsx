import { LiturgyCardGrid } from "@/components/liturgy/LiturgyCardGrid";
import type { WeeklyThisWeek } from "@/lib/weekly-content";

export function WeeklyThisWeekSection({ week }: { week: WeeklyThisWeek }) {
  const meta = [week.sundayLabel, week.gospelRef, week.cycle ? `Year ${week.cycle}` : ""]
    .filter(Boolean)
    .join(" · ");

  return (
    <section aria-labelledby="this-week-heading" className="mx-auto w-full max-w-5xl pt-6 lg:pt-10">
      <div className="rounded-2xl border border-[#eadfce] bg-[#fbf7f1] p-5 sm:p-6">
        <p className="text-xs font-bold uppercase tracking-widest text-[var(--color-muted)]">
          This week
        </p>
        <h2 id="this-week-heading" className="mt-1 flex items-center gap-2 text-xl font-bold">
          <span
            aria-hidden
            className="inline-block h-3 w-3 shrink-0 rounded-full border border-black/10"
            style={{ backgroundColor: week.dotColor }}
          />
          {week.title}
        </h2>
        {meta && <p className="mt-1 text-sm text-[var(--color-muted)]">{meta}</p>}
        <LiturgyCardGrid cards={week.cards} compact />
      </div>
    </section>
  );
}