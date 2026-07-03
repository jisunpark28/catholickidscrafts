import { CurriculumCard } from "@/components/CurriculumCard";
import { LessonKitCard } from "@/components/lesson/LessonKitCard";
import { PageHeader } from "@/components/PageHeader";
import { PageShell } from "@/components/PageShell";
import { getCurriculumTracks } from "@/lib/content";
import { listGlobalTemplates } from "@/lib/lesson-kit/db";
import { copyText, getSiteCopyMap } from "@/lib/site-copy";
import { canonicalForPath } from "@/lib/site-metadata";
import "@/styles/lesson-kit.css";
export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Curriculum",
  description: "Structured catechism tracks for Sunday school and homeschool.",
  ...canonicalForPath("/curriculum"),
};

export default async function CurriculumPage() {
  const [tracks, copy, lessonTemplates] = await Promise.all([
    getCurriculumTracks(),
    getSiteCopyMap(),
    listGlobalTemplates(),
  ]);

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

      {lessonTemplates.length > 0 ? (
        <section className="mt-12">
          <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="text-2xl font-bold text-[var(--color-ink)]">Ready-made lesson kits</h2>
              <p className="mt-1 text-sm text-[var(--color-muted)]">
                One classroom link—games, Gospel typing, crafts. Copy and edit for your class.
              </p>
            </div>
            <Link href="/program" className="text-sm font-semibold text-[var(--color-link)]">
              All class lessons →
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {lessonTemplates.map((kit) => (
              <LessonKitCard
                key={kit.id}
                title={kit.title}
                description={kit.description}
                stepCount={kit.stepCount}
                estMinutes={kit.estMinutes}
                runHref={`/lesson/${kit.shareSlug}`}
                secondaryHref="/program"
                secondaryLabel="Browse"
              />
            ))}
          </div>
        </section>
      ) : null}
    </PageShell>
  );
}

