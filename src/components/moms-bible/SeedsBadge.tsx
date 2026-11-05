"use client";

import { formatSeedsLabel } from "@/lib/moms-bible/constants";

/** Child header badge: chapters turned Shared Together. */
export function SeedsBadge({ seeds }: { seeds: number }) {
  return (
    <span className="mb-seeds" title="Chapters you and your parent both shared">
      <span aria-hidden>🌱</span> {formatSeedsLabel(seeds)}
    </span>
  );
}
