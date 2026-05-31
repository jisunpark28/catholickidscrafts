import Link from "next/link";
import { notFound } from "next/navigation";
import { ResourceCard } from "@/components/ResourceCard";
import {
  getAllResources,
  getCurriculumTrack,
  getCurriculumTracks,
} from "@/lib/content";
import type { Metadata } from "next";

type Props = { params: Promise<{ slug: string }> };

const gradeByTrack: Record<string, string[]> = {
  "pre-k-kindergarten": ["Pre-K", "Kindergarten"],
  "first-holy-communion": ["Grade 1-2"],
  "grades-3-5": ["Grade 3-5"],
  "liturgical-year": [],
};

export async function generateStaticParams() {
  return getCurriculumTracks().map((t) => ({ slug: t.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const track = getCurriculumTrack(slug);
  if (!track) return { title: "Not found" };
  return {
    title: track.title,
    description: track.description,
  };
}

export default async function CurriculumTrackPage({ params }: Props) {
  const { slug } = await params;
  const track = getCurriculumTrack(slug);
  if (!track) notFound();

  const grades = gradeByTrack[slug] ?? [];
  const related = getAllResources().filter(
    (r) => grades.length === 0 || grades.includes(r.grade),
  );

  return (
    <div className="min-h-screen bg-[#131217] px-6 py-16">
      <div className="mx-auto max-w-5xl">
        <Link
          href="/#curriculum"
          className="text-sm font-medium text-[#dfb24f] hover:underline"
        >
          ← Curriculum
        </Link>
        <p className="mt-6 text-sm font-semibold uppercase tracking-wider text-[#7c6a85]">
          {track.stage}
        </p>
        <h1 className="mt-2 text-4xl font-extrabold tracking-tight">
          {track.title}
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-gray-400">{track.description}</p>
        <p className="mt-2 text-sm text-gray-500">
          {track.lessonCount} lessons in this track (more coming soon)
        </p>

        <section className="mt-16">
          <h2 className="mb-6 border-b border-gray-800 pb-2 text-xl font-bold text-gray-400">
            Resources in this track
          </h2>
          {related.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2">
              {related.map((post) => (
                <ResourceCard key={post.slug} post={post} />
              ))}
            </div>
          ) : (
            <p className="text-gray-500">
              Seasonal and general resources are listed under{" "}
              <Link href="/resources" className="text-[#dfb24f] hover:underline">
                all resources
              </Link>
              .
            </p>
          )}
        </section>
      </div>
    </div>
  );
}
