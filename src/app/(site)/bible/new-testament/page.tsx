import { BibleTestamentHub } from "@/components/bible/BibleTestamentHub";
import { booksByTestament, fetchBibleBooks } from "@/lib/bible/latinprayer";
import { pageMetadata } from "@/lib/site-metadata";
import type { Metadata } from "next";
import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbNode } from "@/lib/structured-data";

export const metadata: Metadata = pageMetadata({
  title: "Bible Typing for Kids: New Testament",
  description:
    "Type your way through the New Testament chapter by chapter, Matthew to Revelation! Fun, interactive Bible typing with praise stickers for children.",
  path: "/bible/new-testament",
});

export default async function NewTestamentPage() {
  const books = await fetchBibleBooks().catch(() => []);
  const ntBooks = booksByTestament(books, "NT");

  return (
    <>
      <JsonLd nodes={[breadcrumbNode([{ name: "New Testament", path: "/bible/new-testament" }])]} />
      <BibleTestamentHub
        title="New Testament"
        description="Choose a book to read chapter by chapter. Type with 80% accuracy to earn praise stickers."
        books={ntBooks}
      />
    </>
  );
}
