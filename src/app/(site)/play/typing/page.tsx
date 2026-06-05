import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";
import { PageShell } from "@/components/PageShell";
import { TypingGameHub } from "@/components/TypingGameHub";
import { copyText, getSiteCopyMap } from "@/lib/site-copy";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Typing Game",
  description:
    "Word mode or Today’s Bible with today's Mass readings from Universalis.",
};

export default async function PlayTypingPage() {
  const copy = await getSiteCopyMap();

  return (
    <PageShell wide>
      <Link
        href="/play"
        className="text-sm font-semibold text-[var(--color-link)] hover:underline"
      >
        ← Play & learn
      </Link>

      <div className="mt-6">
        <PageHeader
          title={copyText(copy, "play.typing.page.title", "Typing Game")}
          subtitle={copyText(copy, "play.typing.page.subtitle", "")}
          programNote={copyText(copy, "play.typing.page.program_note", "")}
        />
      </div>

      <TypingGameHub />
    </PageShell>
  );
}
