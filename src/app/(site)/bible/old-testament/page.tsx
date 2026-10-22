import { BibleTestamentHub } from "@/components/bible/BibleTestamentHub";
import { booksByTestament, fetchBibleBooks } from "@/lib/bible/latinprayer";
import { pageMetadata } from "@/lib/site-metadata";
import type { Metadata } from "next";

export const metadata: Metadata = pageMetadata({
  title: "Old Testament for Kids – Bible Typing",
  absoluteTitle: true,
  description:
    "Read and type the Old Testament chapter by chapter, Genesis to Malachi. Type with 80% accuracy to earn praise stickers. Free Catholic Bible for kids.",
  path: "/bible/old-testament",
});

export default async function OldTestamentPage() {
  const books = await fetchBibleBooks().catch(() => []);
  const otBooks = booksByTestament(books, "OT");

  return (
    <BibleTestamentHub
      title="Old Testament"
      description="Choose a book to read chapter by chapter. Type with 80% accuracy to earn praise stickers."
      books={otBooks}
    />
  );
}
