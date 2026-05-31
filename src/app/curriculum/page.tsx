import { CurriculumCard } from "@/components/CurriculumCard";
import { PageHeader } from "@/components/PageHeader";
import { PageShell } from "@/components/PageShell";
import { getCurriculumTracks } from "@/lib/content";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Curriculum",
  description: "Structured catechism tracks for Sunday school and homeschool.",
};

export default function CurriculumPage() {
  const tracks = getCurriculumTracks();

  return (
    <PageShell wide>
      <PageHeader
        title="Curriculum"
        subtitle="Grade-based lesson paths for catechists and parents. Separate from the daily Mass calendar—pick a track and build your year."
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
