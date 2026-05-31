import Link from "next/link";
import { CurriculumCard } from "@/components/CurriculumCard";
import { ResourceCard } from "@/components/ResourceCard";
import { getAllResources, getCurriculumTracks } from "@/lib/content";

export default function HomePage() {
  const tracks = getCurriculumTracks();
  const latestResources = getAllResources().slice(0, 3);

  return (
    <div className="min-h-screen bg-[#131217] text-[#fcfaf2]">
      <header className="mx-auto max-w-5xl px-6 py-24 text-center">
        <p className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-[#7c6a85]">
          Open curriculum for Catholic educators
        </p>
        <h1 className="text-5xl font-extrabold tracking-tight md:text-6xl">
          Your guide to
          <br />
          <span className="text-[#dfb24f]">Catholic Kids Catechism</span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-gray-400">
          Structured lesson plans, crafts, and worksheets—inspired by clean
          learning paths like The Odin Project, with the warmth of the Church’s
          liturgical tradition. Free to browse; premium packs coming soon.
        </p>
        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <Link
            href="#curriculum"
            className="rounded-md bg-[#dfb24f] px-8 py-3 text-lg font-bold text-[#131217] transition hover:bg-[#ebd07f] hover:shadow-lg hover:shadow-[#dfb24f]/20"
          >
            Explore curriculum
          </Link>
          <Link
            href="/resources"
            className="rounded-md border border-gray-700 px-8 py-3 text-lg font-bold text-[#fcfaf2] transition hover:border-[#dfb24f] hover:text-[#dfb24f]"
          >
            Latest resources
          </Link>
        </div>
      </header>

      <main id="curriculum" className="mx-auto max-w-5xl px-6 pb-16">
        <h2 className="mb-8 border-b border-gray-800 pb-2 text-2xl font-bold text-gray-400">
          Choose your stage
        </h2>
        <div className="grid gap-6 md:grid-cols-2">
          {tracks.map((track) => (
            <CurriculumCard key={track.slug} track={track} />
          ))}
        </div>
      </main>

      {latestResources.length > 0 && (
        <section className="mx-auto max-w-5xl border-t border-gray-800 px-6 py-16">
          <div className="mb-8 flex items-end justify-between">
            <h2 className="text-2xl font-bold text-gray-400">Latest resources</h2>
            <Link
              href="/resources"
              className="text-sm font-bold text-[#dfb24f] hover:underline"
            >
              View all →
            </Link>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {latestResources.map((post) => (
              <ResourceCard key={post.slug} post={post} />
            ))}
          </div>
        </section>
      )}

      <section className="mx-auto max-w-5xl px-6 pb-24">
        <div className="rounded-xl border border-[#dfb24f]/30 bg-[#1a1921] p-8 md:p-12">
          <h2 className="text-2xl font-bold text-[#dfb24f]">How this site works</h2>
          <ul className="mt-6 grid gap-4 text-gray-400 md:grid-cols-3">
            <li>
              <span className="font-bold text-[#fcfaf2]">1. Pick a track</span>
              <p className="mt-1 text-sm">
                Grade-level paths from Pre-K through upper elementary and
                liturgical seasons.
              </p>
            </li>
            <li>
              <span className="font-bold text-[#fcfaf2]">2. Download & teach</span>
              <p className="mt-1 text-sm">
                Each resource includes objectives, activities, and printable
                ideas you can adapt.
              </p>
            </li>
            <li>
              <span className="font-bold text-[#fcfaf2]">3. Share & grow</span>
              <p className="mt-1 text-sm">
                Built for GitHub + Vercel—push new Markdown posts and your site
                updates automatically.
              </p>
            </li>
          </ul>
        </div>
      </section>
    </div>
  );
}
