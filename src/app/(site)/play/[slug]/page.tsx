import { GameEmbed } from "@/components/GameEmbed";
import { PageShell } from "@/components/PageShell";
import { getPlayGameFromCopy } from "@/lib/play-games-copy";
import { getSiteCopyMap } from "@/lib/site-copy";
import { pageMetadata } from "@/lib/site-metadata";
import { getTinyPriestEmbedPath } from "@/lib/tiny-priest";
import type { Metadata } from "next";
import Link from "next/link";
import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbNode, playAppNode } from "@/lib/structured-data";
import { notFound } from "next/navigation";

/** Search titles/descriptions (separate from the admin-editable card copy on /play). */
const PLAY_SEO: Record<string, { title: string; description: string }> = {
  church: { title: "Come to Mass! Catholic Church Game", description: "Explore a friendly church, follow the parts of the Mass step by step and practice the people's responses in this free Catholic game for kids." },
  hangman: { title: "Catholic Hangman Word Game", description: "Guess the Catholic word before the petals fall. A free hangman game with faith and Mass vocabulary for kids, at home or in class." },
  "photo-booth": { title: "4-Cut Photo Booth for Kids", description: "Make a 4-cut photo strip with Catholic frames, stickers and backgrounds. Use the camera or upload photos; editing happens on your device, not our servers." },
};

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
  const seo = PLAY_SEO[slug === "emoji" ? "photo-booth" : slug];
  return pageMetadata({
    title: seo?.title ?? game.title,
    description: seo?.description ?? game.description,
    path,
  });
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

  const seo = PLAY_SEO[slug];
  const path = `/play/${slug}`;
  return (
    <PageShell wide>
      <JsonLd
        nodes={[
          breadcrumbNode([{ name: "Play & Learn", path: "/play" }, { name: game.title, path }]),
          playAppNode({ name: seo?.title ?? game.title, description: seo?.description ?? game.description, path, kind: "game" }),
        ]}
      />
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
