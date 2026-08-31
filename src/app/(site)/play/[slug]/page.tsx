import { GameEmbed } from "@/components/GameEmbed";
import { PageShell } from "@/components/PageShell";
import { getPlayGameFromCopy } from "@/lib/play-games-copy";
import { getSiteCopyMap } from "@/lib/site-copy";
import { canonicalForPath } from "@/lib/site-metadata";
import { getTinyPriestEmbedPath } from "@/lib/tiny-priest";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return [{ slug: "church" }, { slug: "hangman" }, { slug: "emoji" }];
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const copy = await getSiteCopyMap();
  const game = getPlayGameFromCopy(copy, slug);
  if (!game) return { title: "Not found" };
  const path = slug === "emoji" ? "/play/photo-booth" : `/play/${slug}`;
  return {
    title: game.title,
    description: game.description,
    ...canonicalForPath(path),
  };
}

export default async function PlayGamePage({ params }: Props) {
  const { slug } = await params;
  if (slug === "emoji") {
    const { redirect } = await import("next/navigation");
    redirect("/play/photo-booth");
  }
  const copy = await getSiteCopyMap();
  const game = getPlayGameFromCopy(copy, slug);
  if (!game) notFound();

  const churchOverride = process.env.NEXT_PUBLIC_CHURCH_GAME_URL?.trim();
  const src =
    slug === "church"
      ? churchOverride || getTinyPriestEmbedPath()
      : game.embedPath;

  return (
    <PageShell wide>
      <GameEmbed
        title={game.title}
        description={game.description || undefined}
        src={src}
        showTip={slug !== "hangman" && slug !== "church"}
        immersive={slug === "church"}
        tall={slug === "hangman"}
      />
      {slug === "emoji" && (
        <p className="mt-6 text-xs text-[var(--color-muted)]">
          Photos are processed in your browser only. See our{" "}
          <Link href="/privacy" className="text-[var(--color-link)]">
            Privacy Policy
          </Link>
          .
        </p>
      )}
    </PageShell>
  );
}
