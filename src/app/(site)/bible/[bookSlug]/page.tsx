import { notFound } from "next/navigation";
import { BibleBookHub } from "@/components/bible/BibleBookHub";
import { booksByTestament, fetchBibleBooks } from "@/lib/bible/latinprayer";
import { getCompletedChaptersForBook } from "@/lib/bible/progress";
import { getReaderDisplay } from "@/lib/reader-display";
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

  const testamentBooks = booksByTestament(books, book.testament);
  const [completedChapters, reader] = await Promise.all([
    getCompletedChaptersForBook(bookSlug),
    getReaderDisplay(),
  ]);

  const testamentHref =
    book.testament === "OT" ? "/bible/old-testament" : "/bible/new-testament";
  const testamentLabel = book.testament === "OT" ? "Old Testament" : "New Testament";

  return (
    <BibleBookHub
      book={book}
      testamentBooks={testamentBooks}
      testamentHref={testamentHref}
      testamentLabel={testamentLabel}
      completedChapters={completedChapters}
      reader={reader}
    />
  );
}
