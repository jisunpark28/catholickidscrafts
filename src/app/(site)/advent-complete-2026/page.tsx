import { AdventCompletePackView } from "@/components/advent/AdventCompletePackView";
import { PageShell } from "@/components/PageShell";
import { ADVENT_PACK_PATH } from "@/lib/advent-complete-2026";
import { resolveResourceViewer } from "@/lib/resource/resolve-access";
import { pageMetadata } from "@/lib/site-metadata";
import type { Metadata } from "next";
import Link from "next/link";

export const dynamic = "force-dynamic";

export const metadata: Metadata = pageMetadata({
  title: "Advent Complete 2026 Pack",
  description: "Advent Complete 2026: Year B Sunday sheets, Dec 8 bonus, and Advent crafts for Plus members.",
  path: ADVENT_PACK_PATH,
});

export default async function AdventComplete2026Page() {
  const viewer = await resolveResourceViewer();

  return (
    <PageShell>
      <Link href="/" className="text-sm font-semibold text-[var(--color-link)]">
        ← Home
      </Link>
      <div className="mt-4">
        <AdventCompletePackView isPlus={viewer.isPlus} />
      </div>
    </PageShell>
  );
}
