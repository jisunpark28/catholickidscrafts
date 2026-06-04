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
        subtitle="Plug-and-play activities when you need something that works in the room."
        programNote="No student accounts. Open on one screen or let kids take turns. Pair with Daily Mass or a resource from the same season."
      />

      <div className="grid gap-4 sm:grid-cols-2">
        {PLAY_GAMES.map((game) => (
          <article
            key={game.slug}
            className="border border-[var(--color-border)] bg-white p-6 transition hover:border-[var(--color-accent)]"
          >
            <h2 className="text-lg font-bold text-[var(--color-ink)]">{game.title}</h2>
            {game.description ? (
              <p className="mt-2 text-sm text-[var(--color-muted)]">{game.description}</p>
            ) : null}
            <Link
              href={game.slug === "emoji" ? "/play/photo-booth" : `/play/${game.slug}`}
              className="mt-4 inline-block text-sm font-semibold text-[var(--color-link)]"
            >
              Play →
            </Link>
          </article>
        ))}
      </div>

      <p className="mt-10 text-sm text-[var(--color-muted)]">
        For typing practice (church words or today’s readings), go to{" "}
        <Link href="/play/typing" className="font-semibold text-[var(--color-link)]">
          Typing Game
        </Link>
        .
      </p>
    </PageShell>
  );
}
