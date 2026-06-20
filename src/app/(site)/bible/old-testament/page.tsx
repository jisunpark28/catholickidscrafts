import { BibleTestamentHub } from "@/components/bible/BibleTestamentHub";
import { booksByTestament, fetchBibleBooks } from "@/lib/bible/latinprayer";
import { canonicalForPath } from "@/lib/site-metadata";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Old Testament",
  description: "Choose an Old Testament book to read and collect praise stickers.",
  ...canonicalForPath("/bible/old-testament"),
};

export default async function OldTestamentPage() {
  const books = await fetchBibleBooks().catch(() => []);
  const otBooks = booksByTestament(books, "OT");

  return (
    <BibleTestamentHub
      title="Old Testament"
      description="Choose a book to read chapter by chapter. Type with 90% accuracy to earn praise stickers."
      books={otBooks}
    />
  );
}
