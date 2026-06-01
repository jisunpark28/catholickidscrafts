import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";
import { PageShell } from "@/components/PageShell";
import { TypingGameHub } from "@/components/TypingGameHub";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Catholic Typing Games",
  description:
    "Word mode with falling vocabulary, or Today’s Bible mode with Daily Mass readings to type.",
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
          title="Catholic typing games"
          subtitle="Choose Word mode or Today’s Bible mode. Operators can add words in Admin → Typing words."
        />
      </div>

      <TypingGameHub />
    </PageShell>
  );
}
