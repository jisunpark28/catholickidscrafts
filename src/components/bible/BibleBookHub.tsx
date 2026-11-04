import { BibleBookSelect } from "@/components/BibleBookSelect";
import { TestamentPageShell } from "@/components/bible/TestamentPageShell";
import { BibleStickerGrid } from "@/components/BibleStickerGrid";
import { chapterGrid } from "@/lib/bible/chapter-pages";
import type { BibleBookMeta } from "@/lib/bible/latinprayer";
import { isDouaySlug } from "@/lib/bible/ref-map";

type Props = {
  book: BibleBookMeta;
  testamentBooks: BibleBookMeta[];
  completedChapters: number[];
};

export function BibleBookHub({ book, testamentBooks, completedChapters }: Props) {
  // Cells follow the official Catholic chapter numbering; progress stays Douay-keyed.
  const done = new Set(completedChapters);
  const chapters = isDouaySlug(book.slug)
    ? chapterGrid(book.slug).map((c) => ({
        label: c.label,
        href: c.href,
        filled: c.douayChapters.length > 0 && c.douayChapters.every((d) => done.has(d)),
      }))
    : undefined;
  return (
    <TestamentPageShell>
      <div className="flex justify-end">
        <BibleBookSelect books={testamentBooks} currentSlug={book.slug} showLabel={false} />
      </div>
      <h1 className="mt-6 text-center text-xl font-semibold text-[#1c1c1c] sm:text-2xl">{book.name}</h1>
      <BibleStickerGrid
        bookSlug={book.slug}
        bookName={book.name}
        chapterCount={book.totalChapters}
        completedChapters={completedChapters}
        chapters={chapters}
      />
    </TestamentPageShell>
  );
}
