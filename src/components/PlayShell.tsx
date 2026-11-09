"use client";

import { HomePdfShell } from "@/components/home/HomePdfShell";
import { SidebarPagePanel } from "@/components/SidebarPagePanel";
import type { HomePdfGroup } from "@/lib/home-pdf-nav";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

/** Hub uses the shared cream panel on white; game frames keep their own bordered shell. */
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
      contentClassName={isHub ? "min-h-dvh" : undefined}
    >
      {isHub ? (
        <div data-play-content="hub">
          <SidebarPagePanel>{children}</SidebarPagePanel>
        </div>
      ) : (
        <div
          data-play-content="game"
          className="mx-auto w-full max-w-6xl rounded-3xl border border-[#e8e0d6] bg-[#fdfaf7] p-4 sm:p-6 lg:p-8"
        >
          {children}
        </div>
      )}
    </HomePdfShell>
  );
}
