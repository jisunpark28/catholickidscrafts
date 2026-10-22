import { BibleTestamentHub } from "@/components/bible/BibleTestamentHub";
import { booksByTestament, fetchBibleBooks } from "@/lib/bible/latinprayer";
import { pageMetadata } from "@/lib/site-metadata";
import type { Metadata } from "next";
import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbNode } from "@/lib/structured-data";

export const metadata: Metadata = pageMetadata({
  title: "Bible Typing for Kids: Old Testament",
  description:
    "Type your way through the Old Testament chapter by chapter, Genesis to Malachi! Fun, interactive Bible typing with praise stickers for children.",
  path: "/bible/old-testament",
});

export default async function OldTestamentPage() {
  const books = await fetchBibleBooks().catch(() => []);
  const otBooks = booksByTestament(books, "OT");

  return (
    <>
      <JsonLd nodes={[breadcrumbNode([{ name: "Old Testament", path: "/bible/old-testament" }])]} />
      <BibleTestamentHub
        title="Old Testament"
        description="Choose a book to read chapter by chapter. Type with 80% accuracy to earn praise stickers."
        books={otBooks}
      />
    </>
  );
}
