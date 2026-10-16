import { BibleBookSelect } from "@/components/BibleBookSelect";
import { TestamentPageShell } from "@/components/bible/TestamentPageShell";
import { BibleStickerGrid } from "@/components/BibleStickerGrid";
import type { BibleBookMeta } from "@/lib/bible/latinprayer";

type Props = {
  book: BibleBookMeta;
  testamentBooks: BibleBookMeta[];
  completedChapters: number[];
};

export function BibleBookHub({ book, testamentBooks, completedChapters }: Props) {
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
      />
    </TestamentPageShell>
  );
}
