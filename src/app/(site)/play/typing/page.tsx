import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";
import { PageShell } from "@/components/PageShell";
import { TypingGameHub } from "@/components/TypingGameHub";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Typing Game",
  description:
    "Word mode or Today’s Bible with today's readings from Living with Christ.",
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
          subtitle="Quiet practice that still connects to the faith you are teaching this week."
          programNote="Word mode: good for grades 2–6 and review. Today's Bible: loads today's readings from Living with Christ—let readers finish early while others join."
        />
      </div>

      <TypingGameHub />
    </PageShell>
  );
}
