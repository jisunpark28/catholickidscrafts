import Link from "next/link";
import { notFound } from "next/navigation";
import { MassReadingBlock } from "@/components/MassReadingBlock";
import { LiturgicalSeasonBanner } from "@/components/LiturgicalSeasonBanner";
import { PageShell } from "@/components/PageShell";
import { formatDisplayDate, parseDateParam } from "@/lib/dates";
import { fetchMassDay, MASS_DATA_SOURCE } from "@/lib/evangelizo";
import { getLiturgicalSeason } from "@/lib/liturgical-season";
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

  return (
    <PageShell wide>
      <Link
        href="/mass"
        className="text-sm font-semibold text-[var(--color-link)] hover:underline"
      >
        ← Daily Mass calendar
      </Link>

      <div className="mt-8">
        <LiturgicalSeasonBanner season={season} />
      </div>

      <header className="mt-10 border-b border-[var(--color-border)] pb-8">
        <p className="text-sm font-semibold text-[var(--color-muted)]">{displayDate}</p>
        <h1 className="mt-2 text-3xl font-bold leading-tight text-[var(--color-ink)] sm:text-4xl">
          {mass.liturgicalTitle}
        </h1>
        {mass.feast && (
          <p className="mt-4 text-[var(--color-muted)]">
            <span className="font-semibold text-[var(--color-ink)]">Feast: </span>
            {mass.feast}
          </p>
        )}
        {mass.saint && (
          <p className="mt-2 text-[var(--color-muted)]">
            <span className="font-semibold text-[var(--color-ink)]">Saint: </span>
            {mass.saint}
          </p>
        )}
      </header>

      <div className="mt-8 space-y-0 divide-y divide-[var(--color-border)] border border-[var(--color-border)]">
        {mass.readings.map((reading) => (
          <MassReadingBlock key={reading.kind} reading={reading} />
        ))}
      </div>

      <p className="mt-10 text-xs leading-relaxed text-[var(--color-muted)]">
        Source: {MASS_DATA_SOURCE}. Texts via{" "}
        <a
          href="https://www.evangelizo.org/"
          className="font-semibold text-[var(--color-link)]"
          target="_blank"
          rel="noopener noreferrer"
        >
          Evangelizo.org
        </a>
        .
      </p>
    </PageShell>
  );
}
