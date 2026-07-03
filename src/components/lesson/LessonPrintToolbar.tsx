"use client";

import Link from "next/link";

type Props = {
  kitId: string;
};

export function LessonPrintToolbar({ kitId }: Props) {
  return (
    <div className="sticky top-0 z-10 flex flex-wrap items-center justify-between gap-3 border-b border-[var(--color-border)] bg-white px-4 py-3 print:hidden">
      <Link href={`/program/kit/${kitId}`} className="text-sm font-semibold text-[var(--color-link)]">
        ← Back to editor
      </Link>
      <button
        type="button"
        onClick={() => window.print()}
        className="lesson-big-button !min-h-0 !w-auto !px-4 !py-2 !text-sm"
      >
        Print / Save PDF
      </button>
    </div>
  );
}
