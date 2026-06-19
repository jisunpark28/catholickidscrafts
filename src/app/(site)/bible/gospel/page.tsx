import Link from "next/link";
import { PageShell } from "@/components/PageShell";
import { canonicalForPath } from "@/lib/site-metadata";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Today's Gospel",
  description: "Type along with today's Gospel reading.",
  ...canonicalForPath("/bible/gospel"),
};

export default function TodaysGospelPage() {
  return (
    <PageShell>
      <Link href="/" className="text-sm font-semibold text-[var(--color-link)]">
        ← Home
      </Link>
      <h1 className="mt-6 text-3xl text-[var(--color-ink)]">Today&apos;s Gospel</h1>
      <p className="mt-4 text-[var(--color-muted)]">
        Gospel typing linked to the liturgical calendar is coming in the next release. For now, use{" "}
        <Link href="/play/typing" className="text-[var(--color-link)]">
          Play → Typing → Today&apos;s Bible
        </Link>{" "}
        or pick a book from the{" "}
        <Link href="/bible/new-testament" className="text-[var(--color-link)]">
          New Testament
        </Link>
        .
      </p>
      <p className="mt-4 text-sm text-[var(--color-muted)]">
        Sign in with a family account or Access ID to save praise stickers (Phase C/D in{" "}
        <code className="text-xs">docs/HOME_LEARN_AND_BIBLE.md</code>).
      </p>
    </PageShell>
  );
}
