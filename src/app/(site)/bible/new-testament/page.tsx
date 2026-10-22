import { BibleTestamentHub } from "@/components/bible/BibleTestamentHub";
import { booksByTestament, fetchBibleBooks } from "@/lib/bible/latinprayer";
import { pageMetadata } from "@/lib/site-metadata";
import type { Metadata } from "next";

export const metadata: Metadata = pageMetadata({
  title: "New Testament for Kids – Bible Typing",
  absoluteTitle: true,
  description:
    "Read and type the New Testament chapter by chapter, Matthew to Revelation. Type with 80% accuracy to earn praise stickers. Free Catholic Bible for kids.",
  path: "/bible/new-testament",
});

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
