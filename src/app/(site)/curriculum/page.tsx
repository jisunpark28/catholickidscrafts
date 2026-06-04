import { CurriculumCard } from "@/components/CurriculumCard";
import { PageHeader } from "@/components/PageHeader";
import { PageShell } from "@/components/PageShell";
import { getCurriculumTracks } from "@/lib/content";
export const dynamic = "force-dynamic";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Curriculum",
  description: "Structured catechism tracks for Sunday school and homeschool.",
};

export default async function CurriculumPage() {
  const tracks = await getCurriculumTracks();

  return (
    <PageShell wide>
      <PageHeader
        title="Curriculum"
        subtitle="When you are mapping a whole year—not just one Sunday at a time."
        programNote="Choose the age band closest to your group. Use alongside Daily Mass and Kids Resources; you do not have to follow every week in order."
      />

      <div className="grid gap-0 border border-[var(--color-border)] sm:grid-cols-2">
        {tracks.map((track, i) => (
          <div
            key={track.slug}
            className={`border-[var(--color-border)] ${i % 2 === 0 ? "sm:border-r" : ""} ${i < tracks.length - 2 ? "border-b sm:border-b" : ""}`}
          >
            <CurriculumCard track={track} />
          </div>
        ))}
      </div>
    </PageShell>
  );
}
