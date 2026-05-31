import Link from "next/link";
import type { CurriculumTrack } from "@/lib/content";

type Props = { track: CurriculumTrack };

export function CurriculumCard({ track }: Props) {
  return (
    <Link
      href={`/curriculum/${track.slug}`}
      className="group block h-full bg-white p-8 transition hover:bg-[var(--color-surface)]"
    >
      <p className="text-xs font-bold uppercase tracking-[0.15em] text-[var(--color-muted)]">
        {track.stage}
      </p>
      <h3 className="mt-3 text-xl font-bold text-[var(--color-ink)] group-hover:text-[var(--color-accent)]">
        {track.title}
      </h3>
      <p className="mt-3 text-[var(--color-muted)] leading-relaxed">{track.description}</p>
      <p className="mt-6 text-sm font-semibold text-[var(--color-link)] group-hover:underline">
        View {track.lessonCount} lessons →
      </p>
    </Link>
  );
}
