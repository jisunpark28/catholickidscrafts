import type { TrafficSummary } from "@/lib/analytics";

type Props = { stats: TrafficSummary };

function StatBlock({
  label,
  pageViews,
  uniqueVisitors,
}: {
  label: string;
  pageViews: number;
  uniqueVisitors: number;
}) {
  return (
    <div className="border border-[var(--color-border)] bg-white p-6">
      <p className="text-xs font-bold uppercase tracking-wide text-[var(--color-muted)]">
        {label}
      </p>
      <div className="mt-4 grid grid-cols-2 gap-4">
        <div>
          <p className="text-3xl font-bold text-[var(--color-ink)]">{uniqueVisitors}</p>
          <p className="mt-1 text-sm text-[var(--color-muted)]">Unique visitors</p>
        </div>
        <div>
          <p className="text-3xl font-bold text-[var(--color-ink)]">{pageViews}</p>
          <p className="mt-1 text-sm text-[var(--color-muted)]">Page views</p>
        </div>
      </div>
    </div>
  );
}

export function TrafficStats({ stats }: Props) {
  return (
    <section className="mt-10">
      <h2 className="text-lg font-bold text-[var(--color-ink)]">Site traffic</h2>
      <p className="mt-1 text-sm text-[var(--color-muted)]">
        Public pages only. Not shown on the live site — operators only.
      </p>
      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <StatBlock label="Today (UTC)" {...stats.today} />
        <StatBlock label="Last 7 days" {...stats.last7Days} />
        <StatBlock label="All time" {...stats.allTime} />
      </div>
    </section>
  );
}
