import { PageHeader } from "@/components/PageHeader";
import { PageShell } from "@/components/PageShell";
import { PLAY_GAMES } from "@/lib/play-games";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Play & Learn",
  description:
    "Interactive Catholic games: explore the church, gospel typing, hangman, and emoji photo fun.",
};

export default function PlayHubPage() {
  return (
    <PageShell wide>
      <PageHeader
        title="Play & Learn"
        subtitle="Short games that reinforce Mass readings, church vocabulary, and creativity—no account needed."
      />

      <div className="grid gap-4 sm:grid-cols-2">
        {PLAY_GAMES.map((game) => (
          <article
            key={game.slug}
            className="border border-[var(--color-border)] bg-white p-6 transition hover:border-[var(--color-accent)]"
          >
            <h2 className="text-lg font-bold text-[var(--color-ink)]">{game.title}</h2>
            <p className="mt-2 text-sm text-[var(--color-muted)]">{game.description}</p>
            <Link
              href={game.massLink ? "/mass" : `/play/${game.slug}`}
              className="mt-4 inline-block text-sm font-semibold text-[var(--color-link)]"
            >
              {game.massLink ? "Open Daily Mass →" : "Play →"}
            </Link>
          </article>
        ))}
      </div>

      <p className="mt-10 text-sm text-[var(--color-muted)]">
        Gospel typing appears on each{" "}
        <Link href="/mass" className="font-semibold text-[var(--color-link)]">
          Daily Mass
        </Link>{" "}
        date page, below the readings.
      </p>
    </PageShell>
  );
}
