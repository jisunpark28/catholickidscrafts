import { notFound } from "next/navigation";
import { BibleBookHub } from "@/components/bible/BibleBookHub";
import { booksByTestament, fetchBibleBooks } from "@/lib/bible/latinprayer";
import { getCompletedChaptersForBook } from "@/lib/bible/progress";
import { pageMetadata } from "@/lib/site-metadata";
import type { Metadata } from "next";

type Props = { params: Promise<{ bookSlug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { bookSlug } = await params;
  const books = await fetchBibleBooks().catch(() => []);
  const book = books.find((b) => b.slug === bookSlug);
  if (!book) return { title: "Book not found" };
  return pageMetadata({
    title: `${book.name} – Bible for Kids`,
    description: `Read and type ${book.name} chapter by chapter (${book.totalChapters} chapters) in this free Catholic Bible for kids. Type with 80% accuracy to earn praise stickers.`,
    path: `/bible/${bookSlug}`,
  });
}

export default async function BibleBookPage({ params }: Props) {
  const { bookSlug } = await params;
  const books = await fetchBibleBooks().catch(() => []);
  const book = books.find((b) => b.slug === bookSlug);
  if (!book) notFound();

  const testamentBooks = booksByTestament(books, book.testament);
  const completedChapters = await getCompletedChaptersForBook(bookSlug);

  return (
    <BibleBookHub
      book={book}
      testamentBooks={testamentBooks}
      completedChapters={completedChapters}
    />
  );
}
