import Link from "next/link";
import { notFound } from "next/navigation";
import { CurriculumRoadmap } from "@/components/CurriculumRoadmap";
import { PageShell } from "@/components/PageShell";
import { getCurriculumTrack, getResourcesForCurriculumTrack } from "@/lib/content";
import { buildCurriculumRoadmapSteps } from "@/lib/curriculum-roadmap";
import { canonicalForPath } from "@/lib/site-metadata";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const track = await getCurriculumTrack(slug);
  if (!track) return { title: "Not found" };
  return {
    title: track.title,
    description: track.description,
    ...canonicalForPath(`/curriculum/${slug}`),
  };
}

export default async function CurriculumTrackPage({ params }: Props) {
  const { slug } = await params;
  const track = await getCurriculumTrack(slug);
  if (!track) notFound();

  const related = await getResourcesForCurriculumTrack(slug);
  const steps = buildCurriculumRoadmapSteps(track, related);

  return (
    <PageShell wide>
      <Link
        href="/curriculum"
        className="text-sm font-semibold text-[var(--color-link)] hover:underline"
      >
        ← Curriculum
      </Link>
      <header className="mt-6 pb-8">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--color-muted)]">
          {track.stage}
        </p>
        <h1 className="mt-2 text-3xl font-bold text-[var(--color-ink)] sm:text-4xl">
          {track.title}
        </h1>
        <p className="mt-4 max-w-3xl text-lg text-[var(--color-muted)]">{track.description}</p>
        <p className="mt-2 text-sm text-[var(--color-muted)]">
          {track.lessonCount} lessons in this roadmap
        </p>
      </header>

      <section className="mt-4">
        <h2 className="mb-6 text-xl font-bold text-[var(--color-ink)]">Learning path</h2>
        <CurriculumRoadmap steps={steps} />
      </section>

      {related.length === 0 ? (
        <p className="mt-10 text-sm text-[var(--color-muted)]">
          Link resources to this track in{" "}
          <Link href="/resources" className="font-semibold text-[var(--color-link)]">
            Kids Resources
          </Link>{" "}
          (Title field = track title) or sort them in the admin curriculum editor.
        </p>
      ) : null}
    </PageShell>
  );
}
