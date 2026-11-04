import { notFound, permanentRedirect } from "next/navigation";
import { BibleBookHub } from "@/components/bible/BibleBookHub";
import { nabreChapterLabels } from "@/lib/bible/chapter-pages";
import { booksByTestament, fetchBibleBooks } from "@/lib/bible/latinprayer";
import { NABRE_BOOK_TO_SLUG, SLUG_TO_NABRE_BOOK, isDouaySlug, isNabreBookId } from "@/lib/bible/ref-map";
import { getCompletedChaptersForBook } from "@/lib/bible/progress";
import { bookPageMomsBible } from "@/lib/moms-bible/page-data";
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
  const chapters = isDouaySlug(book.slug)
    ? nabreChapterLabels(SLUG_TO_NABRE_BOOK[book.slug]).length
    : book.totalChapters;
  return pageMetadata({
    title: `${book.name} – Catholic Bible for Kids`,
    description: `Read ${book.name} chapter by chapter (${chapters} chapters) in the Catholic Bible. A gentle way for children to read the Bible at home or in class.`,
    path: `/bible/${bookSlug}`,
  });
}

export default async function BibleBookPage({ params }: Props) {
  const { bookSlug } = await params;
  const books = await fetchBibleBooks().catch(() => []);
  const book = books.find((b) => b.slug === bookSlug);
  if (!book) {
    // Official (NABRE) book ids, e.g. /bible/joshua -> /bible/josue.
    if (isNabreBookId(bookSlug) && !isDouaySlug(bookSlug)) {
      permanentRedirect(`/bible/${NABRE_BOOK_TO_SLUG[bookSlug]}`);
    }
    notFound();
  }

  const testamentBooks = booksByTestament(books, book.testament);
  const [completedChapters, momsBible] = await Promise.all([
    getCompletedChaptersForBook(bookSlug),
    isDouaySlug(bookSlug) ? bookPageMomsBible(bookSlug).catch(() => null) : Promise.resolve(null),
  ]);

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
        momsBible={momsBible}
      />
    </>
  );
}
