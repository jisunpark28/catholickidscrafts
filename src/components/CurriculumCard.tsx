import Link from "next/link";
import type { CurriculumTrack } from "@/lib/content";

type Props = { track: CurriculumTrack };

export function CurriculumCard({ track }: Props) {
  return (
    <Link
      href={`/curriculum/${track.slug}`}
      className="group rounded-xl border border-gray-800 bg-[#1a1921] p-8 transition-all hover:border-[#dfb24f]"
    >
      <span className="text-sm font-semibold uppercase tracking-wider text-[#7c6a85]">
        {track.stage}
      </span>
      <h3 className="mt-2 text-2xl font-bold group-hover:text-[#dfb24f]">
        {track.title}
      </h3>
      <p className="mb-6 mt-4 text-gray-400">{track.description}</p>
      <p className="text-sm text-gray-500">{track.lessonCount} lessons planned</p>
      <span className="mt-4 inline-block text-sm font-bold text-[#dfb24f] group-hover:underline">
        View track →
      </span>
    </Link>
  );
}
