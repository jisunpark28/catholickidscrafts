import Link from "next/link";
import { notFound } from "next/navigation";
import { MassReadingBlock } from "@/components/MassReadingBlock";
import { LiturgicalSeasonBanner } from "@/components/LiturgicalSeasonBanner";
import { formatDisplayDate, parseDateParam } from "@/lib/dates";
import { fetchMassDay } from "@/lib/evangelizo";
import { getLiturgicalSeason } from "@/lib/liturgical-season";
import { MASS_DATA_SOURCE } from "@/lib/evangelizo";
import type { Metadata } from "next";

type Props = { params: Promise<{ date: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { date: dateParam } = await params;
  const date = parseDateParam(dateParam);
  if (!date) return { title: "Mass not found" };

  try {
    const mass = await fetchMassDay(date);
    return {
      title: mass.liturgicalTitle,
      description: `Daily Mass readings for ${formatDisplayDate(date)}`,
    };
  } catch {
    return { title: "Daily Mass" };
  }
}

export default async function MassDayPage({ params }: Props) {
  const { date: dateParam } = await params;
  const date = parseDateParam(dateParam);
  if (!date) notFound();

  let mass;
  try {
    mass = await fetchMassDay(date);
  } catch {
    notFound();
  }

  const season = getLiturgicalSeason(date);
  const displayDate = formatDisplayDate(date);
  const dateKey = mass.date;

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <div className="mx-auto max-w-3xl px-4 py-8 md:px-6 md:py-12">
        <Link
          href="/"
          className="text-sm font-semibold text-[#2563eb] hover:underline"
        >
          ← Liturgical calendar
        </Link>

        <div className="mt-6">
          <LiturgicalSeasonBanner season={season} />
        </div>

        <header className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-semibold text-slate-500">{displayDate}</p>
          <h1 className="mt-2 text-3xl font-extrabold leading-tight text-slate-900">
            {mass.liturgicalTitle}
          </h1>
          {mass.feast && (
            <p className="mt-3 text-slate-700">
              <span className="font-semibold">Feast: </span>
              {mass.feast}
            </p>
          )}
          {mass.saint && (
            <p className="mt-2 text-slate-600">
              <span className="font-semibold">Saint: </span>
              {mass.saint}
            </p>
          )}
        </header>

        <div className="mt-8 space-y-6">
          {mass.readings.map((reading) => (
            <MassReadingBlock key={reading.kind} reading={reading} />
          ))}
        </div>

        <p className="mt-10 rounded-xl bg-slate-100 px-4 py-3 text-xs text-slate-600">
          Source: {MASS_DATA_SOURCE}. Texts via{" "}
          <a
            href="https://www.evangelizo.org/"
            className="font-semibold text-[#2563eb] hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            Evangelizo.org
          </a>{" "}
          (Roman calendar, American English). For the previous or next day, use
          the{" "}
          <Link href="/" className="font-semibold text-[#2563eb] hover:underline">
            calendar
          </Link>{" "}
          or open{" "}
          <Link
            href={`/mass/${dateKey}`}
            className="font-semibold text-[#2563eb] hover:underline"
          >
            /mass/YYYY-MM-DD
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
