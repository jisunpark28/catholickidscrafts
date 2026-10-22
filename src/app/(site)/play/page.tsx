import { PageHeader } from "@/components/PageHeader";
import { PageShell } from "@/components/PageShell";
import { copyText, getSiteCopyMap } from "@/lib/site-copy";
import { getPlayGamesFromCopy } from "@/lib/play-games-copy";
import { pageMetadata } from "@/lib/site-metadata";
import type { Metadata } from "next";
import Link from "next/link";
import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbNode, itemListNode } from "@/lib/structured-data";

const gamePath = (slug: string) => (slug === "emoji" ? "/play/photo-booth" : `/play/${slug}`);

export const metadata: Metadata = pageMetadata({
  title: "Free Catholic Faith Games for Kids",
  description:
    "Free Catholic games for children: dress the priest in Mass vestments, explore the church in Come to Mass!, hangman and more for class and home.",
  path: "/play",
});

export default async function PlayHubPage() {
  const copy = await getSiteCopyMap();
  const games = getPlayGamesFromCopy(copy);

  return (
    <PageShell wide>
      <JsonLd
        nodes={[
          breadcrumbNode([{ name: "Play & Learn", path: "/play" }]),
          itemListNode(
            "Catholic games for kids",
            games.map((g) => ({ name: g.title, path: gamePath(g.slug) })),
          ),
        ]}
      />
      <PageHeader title={copyText(copy, "play.hub.title", "Play & Learn")} />

      <div className="grid gap-4 sm:grid-cols-2">
        {games.map((game) => (
          <article
            key={game.slug}
            className="flex flex-col border border-[var(--color-border)] bg-white p-6 transition hover:border-[var(--color-accent)]"
          >
            <div className="flex-1">
              <h2 className="text-lg font-bold text-[var(--color-ink)]">{game.title}</h2>
              <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-[10px] font-bold uppercase tracking-wider text-[var(--color-muted)]">
                {game.duration && <span>{game.duration}</span>}
                {game.supervision && <span className="text-[var(--color-accent)]">Adult Supervision</span>}
              </div>
              {game.description ? (
                <p className="mt-3 text-sm text-[var(--color-muted)]">{game.description}</p>
              ) : null}
            </div>

            <div className="mt-6 flex items-center justify-between gap-4">
              <Link
                href={gamePath(game.slug)}
                className="text-sm font-semibold text-[var(--color-link)]"
              >
                {copyText(copy, "play.hub.play_link", "Play →")}
              </Link>

              {(game.slug === "face-to-emoji" || game.slug === "emoji") && (
                <span className="text-[10px] text-[var(--color-muted)]">
                  Camera/Photos stay on your device
                </span>
              )}
            </div>
          </article>
        ))}
      </div>
    </PageShell>
  );
}
