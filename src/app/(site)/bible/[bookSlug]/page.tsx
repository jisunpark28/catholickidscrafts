import Link from "next/link";
import { notFound } from "next/navigation";
import { BibleStickerGrid } from "@/components/BibleStickerGrid";
import { PageShell } from "@/components/PageShell";
import { fetchBibleBooks } from "@/lib/bible/latinprayer";
import { canonicalForPath } from "@/lib/site-metadata";
import type { Metadata } from "next";

type Props = { params: Promise<{ bookSlug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { bookSlug } = await params;
  const books = await fetchBibleBooks().catch(() => []);
  const book = books.find((b) => b.slug === bookSlug);
  if (!book) return { title: "Book not found" };
  return {
    title: book.name,
    description: `Read ${book.name} chapter by chapter and collect praise stickers.`,
    ...canonicalForPath(`/bible/${bookSlug}`),
  };
}

export default async function BibleBookPage({ params }: Props) {
  const { bookSlug } = await params;
  const books = await fetchBibleBooks().catch(() => []);
  const book = books.find((b) => b.slug === bookSlug);
  if (!book) notFound();

  const testamentHref =
    book.testament === "OT" ? "/bible/old-testament" : "/bible/new-testament";

  return (
    <PageShell>
      <Link href={testamentHref} className="text-sm font-semibold text-[var(--color-link)]">
        ← {book.testament === "OT" ? "Old Testament" : "New Testament"}
      </Link>
      <h1 className="mt-6 text-3xl text-[var(--color-ink)]">{book.name}</h1>
      <p className="mt-2 text-sm text-[var(--color-muted)]">
        {book.totalChapters} chapters · Douay-Rheims (public domain)
      </p>
      <BibleStickerGrid
        bookSlug={book.slug}
        bookName={book.name}
        chapterCount={book.totalChapters}
        completedChapters={[]}
      />
      <p className="mt-8 text-xs text-[var(--color-muted)]">
        <Link href="/reader/login" className="text-[var(--color-link)]">
          Sign in with Access ID
        </Link>{" "}
        or a family account to save sticker progress.
      </p>
    </PageShell>
  );
}
