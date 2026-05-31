import Link from "next/link";
import { CurriculumCard } from "@/components/CurriculumCard";
import { LiturgicalSeasonBanner } from "@/components/LiturgicalSeasonBanner";
import { MassCalendar } from "@/components/MassCalendar";
import { todayUtc, toDateKey } from "@/lib/dates";
import { fetchMassDaySummary, fetchMonthCalendar } from "@/lib/evangelizo";
import { getCurriculumTracks } from "@/lib/content";

export default async function HomePage() {
  const today = todayUtc();
  const dateKey = toDateKey(today);
  const year = today.getUTCFullYear();
  const month = today.getUTCMonth() + 1;

  const [calendar, todaySummary] = await Promise.all([
    fetchMonthCalendar(year, month),
    fetchMassDaySummary(today).catch(() => null),
  ]);

  const tracks = getCurriculumTracks();

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <div className="mx-auto max-w-5xl px-4 py-8 md:px-6 md:py-12">
        <LiturgicalSeasonBanner
          season={calendar.season}
          todayTitle={todaySummary?.liturgicalTitle}
        />

        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href={`/mass/${dateKey}`}
            className="rounded-xl bg-[#2563eb] px-6 py-3 text-sm font-bold text-white shadow-md transition hover:bg-[#1d4ed8]"
          >
            Today&apos;s Mass →
          </Link>
          <Link
            href="/resources"
            className="rounded-xl border border-slate-200 bg-white px-6 py-3 text-sm font-bold text-slate-700 shadow-sm transition hover:border-[#2563eb] hover:text-[#2563eb]"
          >
            Kids craft resources
          </Link>
        </div>

        <div className="mt-8">
          <MassCalendar initial={calendar} selectedDate={dateKey} />
        </div>

        <section id="curriculum" className="mt-16">
          <h2 className="mb-2 text-2xl font-extrabold text-slate-800">
            Catechism curriculum
          </h2>
          <p className="mb-6 text-slate-600">
            Lesson tracks for Sunday school—alongside your daily Mass routine.
          </p>
          <div className="grid gap-4 md:grid-cols-2">
            {tracks.map((track) => (
              <CurriculumCard key={track.slug} track={track} />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
