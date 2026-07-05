import type { CurriculumRoadmapStep } from "@/lib/curriculum-roadmap-types";
import Link from "next/link";

type Props = {
  steps: CurriculumRoadmapStep[];
};

function StepMarker({ status }: { status: CurriculumRoadmapStep["status"] }) {
  const base =
    "absolute -left-[11px] top-1 flex h-5 w-5 items-center justify-center rounded-full ring-4 ring-white";
  if (status === "completed") {
    return (
      <div className={`${base} bg-emerald-600`} aria-hidden>
        <svg className="h-3 w-3 text-white" viewBox="0 0 12 12" fill="none" aria-hidden>
          <path
            d="M2.5 6l2.5 2.5 4.5-5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    );
  }
  if (status === "current") {
    return (
      <div
        className={`${base} bg-[var(--color-accent)] ring-[var(--color-accent)]/20`}
        aria-hidden
      />
    );
  }
  if (status === "locked") {
    return <div className={`${base} bg-[var(--color-border)]`} aria-hidden />;
  }
  return <div className={`${base} bg-[var(--color-surface)] ring-[var(--color-border)]`} aria-hidden />;
}

export function CurriculumRoadmap({ steps }: Props) {
  if (steps.length === 0) {
    return (
      <p className="text-[var(--color-muted)]">
        Lesson roadmap coming soon. Link resources to this track in the admin curriculum editor.
      </p>
    );
  }

  return (
    <div className="relative ml-4 space-y-8 border-l-2 border-[var(--color-border)] py-4">
      {steps.map((step) => {
        const locked = step.status === "locked";
        const current = step.status === "current";
        const cardClass = locked
          ? "rounded-2xl bg-[var(--color-surface)]/80 p-5 opacity-60 grayscale"
          : "rounded-2xl bg-white p-5 shadow-sm ring-1 ring-[var(--color-border)]/80";

        const inner = (
          <>
            <h4
              className={`text-lg font-bold ${locked ? "text-[var(--color-muted)]" : "text-[var(--color-ink)]"}`}
            >
              {step.title}
            </h4>
            <p className="mt-1 text-sm text-[var(--color-muted)]">{step.description}</p>
            {current && step.href ? (
              <Link
                href={step.href}
                className="mt-4 inline-block rounded-full bg-[var(--color-accent)]/10 px-4 py-2 text-sm font-semibold text-[var(--color-accent)] hover:bg-[var(--color-accent)] hover:text-white"
              >
                Start this lesson →
              </Link>
            ) : null}
            {!current && !locked && step.href ? (
              <Link
                href={step.href}
                className="mt-4 inline-block text-sm font-semibold text-[var(--color-link)] hover:underline"
              >
                Open resource →
              </Link>
            ) : null}
          </>
        );

        return (
          <div key={step.id} className="relative pl-8">
            <StepMarker status={step.status} />
            <div className={cardClass}>{inner}</div>
          </div>
        );
      })}
    </div>
  );
}
