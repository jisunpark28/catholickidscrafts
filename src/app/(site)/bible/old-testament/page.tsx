import Link from "next/link";
import { PageShell } from "@/components/PageShell";
import { booksByTestament, fetchBibleBooks } from "@/lib/bible/latinprayer";
import { canonicalForPath } from "@/lib/site-metadata";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Old Testament",
  description: "Choose an Old Testament book to read and collect praise stickers.",
  ...canonicalForPath("/bible/old-testament"),
};

export default async function OldTestamentPage() {
  const books = booksByTestament(await fetchBibleBooks(), "OT");

  return (
    <PageShell>
      <Link href="/" className="text-sm font-semibold text-[var(--color-link)]">
        ← Home
      </Link>
      <h1 className="mt-6 text-3xl text-[var(--color-ink)]">Old Testament</h1>
      <p className="mt-2 text-[var(--color-muted)]">
        Select a book. Each chapter you type unlocks one praise sticker (Douay-Rheims, public
        domain).
      </p>
      <ul className="mt-8 grid gap-2 sm:grid-cols-2">
        {books.map((book) => (
          <li key={book.slug}>
            <Link
              href={`/bible/${book.slug}`}
              className="block border border-[var(--color-border)] px-4 py-3 hover:border-[var(--color-accent)]"
            >
              {book.name}
              <span className="ml-2 text-sm text-[var(--color-muted)]">
                ({book.totalChapters} chapters)
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </PageShell>
  );
}
