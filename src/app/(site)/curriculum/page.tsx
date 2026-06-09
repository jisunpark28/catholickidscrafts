import { CurriculumCard } from "@/components/CurriculumCard";
import { PageHeader } from "@/components/PageHeader";
import { PageShell } from "@/components/PageShell";
import { getCurriculumTracks } from "@/lib/content";
import { copyText, getSiteCopyMap } from "@/lib/site-copy";
import { canonicalForPath } from "@/lib/site-metadata";
export const dynamic = "force-dynamic";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Curriculum",
  description: "Structured catechism tracks for Sunday school and homeschool.",
  ...canonicalForPath("/curriculum"),
};

export default async function CurriculumPage() {
  const tracks = await getCurriculumTracks();
  const copy = await getSiteCopyMap();

  return (
    <PageShell wide>
      <PageHeader
        title={copyText(copy, "curriculum.page.title", "Curriculum")}
        subtitle={copyText(copy, "curriculum.page.subtitle", "")}
        programNote={copyText(copy, "curriculum.page.program_note", "")}
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
