import { notFound } from "next/navigation";
import { BibleBookHub } from "@/components/bible/BibleBookHub";
import { booksByTestament, fetchBibleBooks } from "@/lib/bible/latinprayer";
import { getCompletedChaptersForBook } from "@/lib/bible/progress";
import { pageMetadata } from "@/lib/site-metadata";
import type { Metadata } from "next";
import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbNode } from "@/lib/structured-data";

type Props = { params: Promise<{ bookSlug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { bookSlug } = await params;
  const books = await fetchBibleBooks().catch(() => []);
  const book = books.find((b) => b.slug === bookSlug);
  if (!book) return { title: "Book not found" };
  return pageMetadata({
    title: `${book.name} Bible Typing for Kids`,
    description: `Type ${book.name} chapter by chapter (${book.totalChapters} chapters) and earn praise stickers. A fun, interactive way for children to read the Bible at home or in class.`,
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

  const testament =
    book.testament === "OT"
      ? { name: "Old Testament", path: "/bible/old-testament" }
      : { name: "New Testament", path: "/bible/new-testament" };
  return (
    <>
      <JsonLd nodes={[breadcrumbNode([testament, { name: book.name, path: `/bible/${bookSlug}` }])]} />
      <BibleBookHub
        book={book}
        testamentBooks={testamentBooks}
        completedChapters={completedChapters}
      />
    </>
  );
}
