import Link from "next/link";
import type { CurriculumTrack } from "@/lib/content";

type Props = { track: CurriculumTrack };

export function CurriculumCard({ track }: Props) {
  return (
    <Link
      href={`/curriculum/${track.slug}`}
      className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-[#2563eb] hover:shadow-md"
    >
      <span className="text-xs font-bold uppercase tracking-wider text-[#2563eb]">
        {track.stage}
      </span>
      <h3 className="mt-2 text-xl font-extrabold text-slate-800 group-hover:text-[#2563eb]">
        {track.title}
      </h3>
      <p className="mt-3 text-sm text-slate-600">{track.description}</p>
      <span className="mt-4 inline-block text-sm font-bold text-[#2563eb] group-hover:underline">
        View track →
      </span>
    </Link>
  );
}
