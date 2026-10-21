import Link from "next/link";
import type { FamilyTalkCoverage } from "@/lib/daily-mass/family-talk-coverage";
import { formatDateKey, nextDateKey, sundayCycleFor } from "@/lib/daily-mass/family-talk-coverage";

const FILE = "src/lib/daily-mass/family-talk.ts";

function daysText(daysLeft: number): string {
  if (daysLeft < 0) return `Ran out ${-daysLeft} day${daysLeft === -1 ? "" : "s"} ago`;
  if (daysLeft === 0) return "Last day is today";
  return `${daysLeft} day${daysLeft === 1 ? "" : "s"} left`;
}

/** Full notice for the Admin notices page. */
export function FamilyTalkNotice({ coverage }: { coverage: FamilyTalkCoverage }) {
  const { lastDate, daysLeft, warn } = coverage;
  const tone = warn
    ? "border-amber-400 bg-amber-50"
    : "border-[var(--color-border)] bg-white";
  return (
    <section
      aria-labelledby="ft-notice-title"
      className={`border-l-4 ${tone} border p-6`}
      role={warn ? "alert" : undefined}
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 id="ft-notice-title" className="text-lg font-bold text-[var(--color-ink)]">
          {warn ? "⚠️ " : ""}Faith Journal daily questions
        </h2>
        {daysLeft !== null ? (
          <span
            className={`rounded-full px-3 py-1 text-sm font-bold ${
              warn ? "bg-amber-200 text-amber-900" : "bg-green-100 text-green-800"
            }`}
          >
            {daysText(daysLeft)}
          </span>
        ) : null}
      </div>
      {lastDate ? (
        <>
          <p className="mt-3 text-[var(--color-ink)]">
            The questions run out after <strong>{formatDateKey(lastDate)}</strong>. Add questions
            for the new liturgical year (Year {sundayCycleFor(nextDateKey(lastDate))}, Advent onward, from{" "}
            <strong>{formatDateKey(nextDateKey(lastDate))}</strong>) before then.
          </p>
          <p className="mt-2 text-sm text-[var(--color-muted)]">
            After that date the Faith Journal banner on /daily-mass has no question to show.
          </p>
        </>
      ) : (
        <p className="mt-3 text-[var(--color-ink)]">No Faith Journal questions are set up.</p>
      )}
      <p className="mt-3 text-sm text-[var(--color-muted)]">
        File: <code className="rounded bg-black/5 px-1.5 py-0.5 text-[var(--color-ink)]">{FILE}</code>{" "}
        (one entry per date: Gospel reference, 3 questions, and a &ldquo;look for&rdquo; tip).
      </p>
    </section>
  );
}

/** Small reminder card for the dashboard home; renders nothing unless warning. */
export function FamilyTalkReminderCard({ coverage }: { coverage: FamilyTalkCoverage }) {
  if (!coverage.warn) return null;
  const { lastDate, daysLeft } = coverage;
  return (
    <div className="mt-6 border border-l-4 border-amber-400 bg-amber-50 p-4" role="status">
      <p className="font-bold text-[var(--color-ink)]">
        ⚠️ Faith Journal questions {daysLeft !== null ? daysText(daysLeft).toLowerCase() : "missing"}
      </p>
      {lastDate ? (
        <p className="mt-1 text-sm text-[var(--color-ink)]">
          Covered through {formatDateKey(lastDate)}. Add the new liturgical year before then.
        </p>
      ) : null}
      <Link href="/admin/notices" className="mt-2 inline-block text-sm font-semibold text-[var(--color-link)]">
        See admin notices →
      </Link>
    </div>
  );
}
