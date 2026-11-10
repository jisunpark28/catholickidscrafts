import type { MemberStats as MemberStatsData } from "@/lib/admin-member-stats";

type Props = { stats: MemberStatsData | null };

function Num({ value }: { value: number | undefined }) {
  return <p className="text-3xl font-bold text-[var(--color-ink)]">{value ?? "-"}</p>;
}

export function MemberStats({ stats }: Props) {
  return (
    <section className="mt-10">
      <h2 className="text-lg font-bold text-[var(--color-ink)]">Members</h2>
      <p className="mt-1 text-sm text-[var(--color-muted)]">
        Family accounts. Paid = Plus pass running now or a subscription that grants Plus.
      </p>
      {!stats && <p className="mt-2 text-sm text-[var(--color-muted)]">Could not load member counts.</p>}
      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <div className="border border-[var(--color-border)] bg-white p-6">
          <p className="text-xs font-bold uppercase tracking-wide text-[var(--color-muted)]">Signups</p>
          <div className="mt-4 grid grid-cols-2 gap-4">
            <div>
              <Num value={stats?.totalSignups} />
              <p className="mt-1 text-sm text-[var(--color-muted)]">Total</p>
            </div>
            <div>
              <Num value={stats?.newSignups7Days} />
              <p className="mt-1 text-sm text-[var(--color-muted)]">Last 7 days</p>
            </div>
          </div>
        </div>
        <div className="border border-[var(--color-border)] bg-white p-6">
          <p className="text-xs font-bold uppercase tracking-wide text-[var(--color-muted)]">Paid members</p>
          <div className="mt-4">
            <Num value={stats?.paidMembers} />
            <p className="mt-1 text-sm text-[var(--color-muted)]">Paying now</p>
          </div>
        </div>
      </div>
    </section>
  );
}
