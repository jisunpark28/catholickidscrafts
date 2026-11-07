"use client";

import { HomePdfShell } from "@/components/home/HomePdfShell";
import type { HomePdfGroup } from "@/lib/home-pdf-nav";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

/** Only the hub gets a full-width canvas; game frames and other site pages stay unchanged. */
export function PlayShell({ groups, dailyMassLabel, children }: {
  groups: HomePdfGroup[];
  dailyMassLabel: string;
  children: ReactNode;
}) {
  const isHub = usePathname() === "/play";

  return (
    <HomePdfShell
      groups={groups}
      dailyMassLabel={dailyMassLabel}
      contentClassName={isHub ? "min-h-dvh bg-[#fdfaf7]" : undefined}
    >
      <div
        data-play-content={isHub ? "hub" : "game"}
        className={isHub
          ? "w-full min-w-0"
          : "mx-auto w-full max-w-6xl rounded-3xl border border-[#e8e0d6] bg-[#fdfaf7] p-4 sm:p-6 lg:p-8"}
      >
        {children}
      </div>
    </HomePdfShell>
  );
}