import { PageHeader } from "@/components/PageHeader";
import { PageShell } from "@/components/PageShell";
import { copyText, getSiteCopyMap } from "@/lib/site-copy";
import { getPlayGamesFromCopy } from "@/lib/play-games-copy";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Play & Learn",
  description:
    "Interactive Catholic games: explore the church, gospel typing, hangman, and emoji photo fun.",
};

export default async function PlayHubPage() {
  const copy = await getSiteCopyMap();
  const games = getPlayGamesFromCopy(copy);

  return (
    <PageShell wide>
      <PageHeader
        title={copyText(copy, "play.hub.title", "Play & Learn")}
        subtitle={copyText(copy, "play.hub.subtitle", "")}
        programNote={copyText(copy, "play.hub.program_note", "")}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        {games.map((game) => (
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
              {copyText(copy, "play.hub.play_link", "Play →")}
            </Link>
          </article>
        ))}
      </div>

      <p className="mt-10 text-sm text-[var(--color-muted)]">
        {copyText(copy, "play.hub.typing_footer", "For typing practice, go to")}{" "}
        <Link href="/play/typing" className="font-semibold text-[var(--color-link)]">
          {copyText(copy, "play.hub.typing_link", "Typing Game")}
        </Link>
        .
      </p>
    </PageShell>
  );
}
