import { BibleTestamentHub } from "@/components/bible/BibleTestamentHub";
import { booksByTestament, fetchBibleBooks } from "@/lib/bible/latinprayer";
import { getReaderDisplay } from "@/lib/reader-display";
import { canonicalForPath } from "@/lib/site-metadata";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "New Testament",
  description: "Choose a New Testament book to read and collect praise stickers.",
  ...canonicalForPath("/bible/new-testament"),
};

export default async function NewTestamentPage() {
  const books = booksByTestament(await fetchBibleBooks(), "NT");
  const reader = await getReaderDisplay();

  return (
    <BibleTestamentHub
      title="New Testament"
      description="Select a book. Type each chapter with 90% accuracy to unlock praise stickers on your collection grid."
      books={books}
      reader={reader}
    />
  );
}
