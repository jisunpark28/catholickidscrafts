import { GameEmbed } from "@/components/GameEmbed";
import { PageShell } from "@/components/PageShell";
import { getPlayGame } from "@/lib/play-games";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return [{ slug: "church" }, { slug: "hangman" }, { slug: "emoji" }];
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const game = getPlayGame(slug);
  if (!game) return { title: "Not found" };
  return { title: game.title, description: game.description };
}

export default async function PlayGamePage({ params }: Props) {
  const { slug } = await params;
  const game = getPlayGame(slug);
  if (!game || game.massLink) notFound();

  const churchOverride = process.env.NEXT_PUBLIC_CHURCH_GAME_URL?.trim();
  const src =
    slug === "church" && churchOverride ? churchOverride : game.embedPath;

  return (
    <PageShell wide>
      <GameEmbed title={game.title} description={game.description} src={src} />
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
