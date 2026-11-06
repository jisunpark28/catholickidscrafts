import { PlayGameIcon } from "@/components/PlayGameIcon";
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
    <div className="min-w-0">
      <JsonLd
        nodes={[
          breadcrumbNode([{ name: "Play & Learn", path: "/play" }]),
          itemListNode(
            "Catholic games for kids",
            games.map((g) => ({ name: g.title, path: gamePath(g.slug) })),
          ),
        ]}
      />
      <header className="mb-8 border-b border-[#e8e0d6] pb-6">
        <h1 className="text-3xl font-bold tracking-tight text-[#2e7d32] sm:text-4xl">
          {copyText(copy, "play.hub.title", "Play & Learn")}
        </h1>
      </header>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {games.map((game) => (
          <article
            key={game.slug}
            className="group flex min-w-0 flex-col rounded-2xl border border-[#e8e0d6] bg-white p-5 shadow-sm transition duration-200 hover:border-[#d35400]/40 hover:shadow-md focus-within:border-[#d35400] sm:p-6"
          >
            <div className={`mb-5 flex h-24 items-center justify-center rounded-xl ${game.supervision ? "bg-[#fff2e6] text-[#d35400]" : "bg-[#edf4e9] text-[#2e7d32]"}`}>
              <PlayGameIcon slug={game.slug} />
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-bold text-[var(--color-ink)]">{game.title}</h2>
              <div className="mt-3 flex flex-wrap items-center gap-2 text-xs font-semibold text-[#666]">
                {game.duration && <span className="rounded-full bg-[#fdfaf7] px-2.5 py-1">{game.duration}</span>}
                {game.supervision && <span className="rounded-full bg-[#fff2e6] px-2.5 py-1 text-[#a84400]">Adult Supervision</span>}
              </div>
              {game.description ? (
                <p className="mt-3 text-sm text-[var(--color-muted)]">{game.description}</p>
              ) : null}
            </div>

            <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
              <Link
                href={gamePath(game.slug)}
                className="inline-flex min-h-11 items-center justify-center rounded-full bg-[#d35400] px-6 py-2.5 text-sm font-bold text-white no-underline transition hover:bg-[#b94700] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#d35400]"
                aria-label={`${copyText(copy, "play.hub.play_link", "Play")} ${game.title}`}
              >
                {copyText(copy, "play.hub.play_link", "Play →")}
              </Link>

              {(game.slug === "face-to-emoji" || game.slug === "emoji") && (
                <span className="max-w-40 text-xs leading-relaxed text-[var(--color-muted)]">
                  Camera/Photos stay on your device
                </span>
              )}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
