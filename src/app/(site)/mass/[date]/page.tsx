import Link from "next/link";
import { notFound } from "next/navigation";
import { MassReadingBlock } from "@/components/MassReadingBlock";
import { LiturgicalSeasonBanner } from "@/components/LiturgicalSeasonBanner";
import { PageShell } from "@/components/PageShell";
import { livingWithChristReadingUrl } from "@/lib/scripture-links";
import { formatDisplayDate, parseDateParam } from "@/lib/dates";
import {
  fetchMassDay,
  MASS_DATA_SOURCE,
  USCCB_COPYRIGHT_NOTICE,
} from "@/lib/mass-source";
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
  const usccbUrl = mass.usccbPageUrl ?? "https://bible.usccb.org/bible/readings/";
  const lwcUrl = livingWithChristReadingUrl(dateParam);

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
        <div className="mt-4 flex flex-wrap gap-3">
          <a
            href={lwcUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-[var(--color-accent)] px-4 py-2 text-sm font-bold text-white hover:bg-[var(--color-accent-hover)]"
          >
            Readings on Living with Christ (Canada) ↗
          </a>
          <a
            href={usccbUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block border border-[var(--color-border)] bg-white px-4 py-2 text-sm font-bold text-[var(--color-ink)] hover:bg-[var(--color-surface)]"
          >
            USCCB Daily Readings (USA) ↗
          </a>
        </div>
        {!mass.readingsOnSite && (
          <p className="mt-4 rounded border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
            Full reading text for this date is on the official sites above (copyright). Citations
            below help you find the right passage on CKC.
          </p>
        )}
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
          <MassReadingBlock
            key={reading.kind}
            reading={reading}
            usccbPageUrl={mass.usccbPageUrl}
          />
        ))}
      </div>

      {mass.readingsOnSite && (
        <p className="mt-8 text-xs leading-relaxed text-[var(--color-muted)]">{USCCB_COPYRIGHT_NOTICE}</p>
      )}

      <p className="mt-8 text-sm text-[var(--color-muted)]">
        Practice typing in{" "}
        <Link href="/play/typing" className="font-semibold text-[var(--color-link)]">
          Play → Typing Game
        </Link>{" "}
        (Word mode or Today&apos;s Bible when on-site text is available).
      </p>

      <p className="mt-4 text-sm text-[var(--color-muted)]">
        More games:{" "}
        <Link href="/play" className="font-semibold text-[var(--color-link)]">
          Play &amp; learn
        </Link>{" "}
        (church tour, hangman, emoji photos).
      </p>

      <p className="mt-10 text-xs leading-relaxed text-[var(--color-muted)]">
        {MASS_DATA_SOURCE}. Calendar titles may use{" "}
        <a
          href="https://www.evangelizo.org/"
          className="font-semibold text-[var(--color-link)]"
          target="_blank"
          rel="noopener noreferrer"
        >
          Evangelizo.org
        </a>
        . Reading text, when shown here, comes from the{" "}
        <a
          href="https://bible.usccb.org/bible/readings/"
          className="font-semibold text-[var(--color-link)]"
          target="_blank"
          rel="noopener noreferrer"
        >
          USCCB Daily Readings
        </a>{" "}
        RSS where available. This site is not affiliated with the USCCB or your local parish.
      </p>
    </PageShell>
  );
}
