import Link from "next/link";
import { notFound } from "next/navigation";
import { PageShell } from "@/components/PageShell";
import { ResourceCard } from "@/components/ResourceCard";
import { getCurriculumTrack, getResourcesForCurriculumTrack } from "@/lib/content";
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
  };
}

export default async function CurriculumTrackPage({ params }: Props) {
  const { slug } = await params;
  const track = await getCurriculumTrack(slug);
  if (!track) notFound();

  const related = await getResourcesForCurriculumTrack(slug);

  return (
    <PageShell wide>
      <Link
        href="/curriculum"
        className="text-sm font-semibold text-[var(--color-link)] hover:underline"
      >
        ← Curriculum
      </Link>
      <header className="mt-6 border-b border-[var(--color-border)] pb-8">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--color-muted)]">
          {track.stage}
        </p>
        <h1 className="mt-2 text-3xl font-bold text-[var(--color-ink)] sm:text-4xl">
          {track.title}
        </h1>
        <p className="mt-4 max-w-3xl text-lg text-[var(--color-muted)]">
          {track.description}
        </p>
        <p className="mt-2 text-sm text-[var(--color-muted)]">
          {track.lessonCount} lessons planned in this track
        </p>
      </header>

      <section className="mt-12">
        <h2 className="mb-6 text-xl font-bold text-[var(--color-ink)]">
          Related kids resources
        </h2>
        {related.length > 0 ? (
          <div className="border border-[var(--color-border)]">
            {related.map((post) => (
              <ResourceCard key={post.slug} post={post} />
            ))}
          </div>
        ) : (
          <p className="text-[var(--color-muted)]">
            No resources are linked to this track yet. Assign the track title in{" "}
            <Link href="/resources" className="font-semibold text-[var(--color-link)]">
              Kids Resources
            </Link>{" "}
            (Title field), or browse all resources there.
          </p>
        )}
      </section>
    </PageShell>
  );
}
