import { BibleBookSelect } from "@/components/BibleBookSelect";
import { BibleHubShell } from "@/components/bible/BibleHubShell";
import { BibleReaderNotice } from "@/components/bible/BibleReaderNotice";
import { BibleStickerGrid } from "@/components/BibleStickerGrid";
import { HOME_HUB_SECTIONS_WIDTH_CLASS } from "@/components/HomeHubButton";
import type { BibleBookMeta } from "@/lib/bible/latinprayer";
import type { ReaderDisplay } from "@/lib/reader-display";

type Props = {
  book: BibleBookMeta;
  testamentBooks: BibleBookMeta[];
  testamentHref: string;
  testamentLabel: string;
  completedChapters: number[];
  reader: ReaderDisplay;
};

export function BibleBookHub({
  book,
  testamentBooks,
  testamentHref,
  testamentLabel,
  completedChapters,
  reader,
}: Props) {
  return (
    <BibleHubShell backHref={testamentHref} backLabel={`← ${testamentLabel}`}>
      <section className={`${HOME_HUB_SECTIONS_WIDTH_CLASS} space-y-4`}>
        <div>
          <h1 className="text-2xl font-semibold text-[var(--color-ink)] sm:text-3xl">{book.name}</h1>
          <p className="mt-1 text-sm text-[var(--color-muted)]">
            {book.totalChapters} chapters · Tap a chapter below to type and earn stickers
          </p>
        </div>

        <BibleReaderNotice reader={reader} />

        <BibleBookSelect books={testamentBooks} currentSlug={book.slug} />

        <BibleStickerGrid
          bookSlug={book.slug}
          bookName={book.name}
          chapterCount={book.totalChapters}
          completedChapters={completedChapters}
        />
      </section>
    </BibleHubShell>
  );
}
