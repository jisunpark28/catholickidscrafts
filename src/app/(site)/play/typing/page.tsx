import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";
import { PageShell } from "@/components/PageShell";
import { TypingGameHub } from "@/components/TypingGameHub";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Typing Game",
  description:
    "Word mode, paste your own passage, or Today’s Bible with Daily Mass readings when available.",
};

export default function PlayTypingPage() {
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
          title="Typing Game"
          subtitle="Word mode, paste a passage from official reading sites, or Today's Bible."
        />
      </div>

      <TypingGameHub />
    </PageShell>
  );
}
