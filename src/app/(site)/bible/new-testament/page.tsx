import { BibleTestamentHub } from "@/components/bible/BibleTestamentHub";
import { booksByTestament, fetchBibleBooks } from "@/lib/bible/latinprayer";
import { canonicalForPath } from "@/lib/site-metadata";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "New Testament",
  description: "Choose a New Testament book to read and collect praise stickers.",
  ...canonicalForPath("/bible/new-testament"),
};

export default async function NewTestamentPage() {
  const books = await fetchBibleBooks().catch(() => []);
  const ntBooks = booksByTestament(books, "NT");

  return (
    <BibleTestamentHub
      title="New Testament"
      description="Choose a book to read chapter by chapter. Type with 80% accuracy to earn praise stickers."
      books={ntBooks}
    />
  );
}
