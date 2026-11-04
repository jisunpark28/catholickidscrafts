import { BibleBookSelect } from "@/components/BibleBookSelect";
import { TestamentPageShell } from "@/components/bible/TestamentPageShell";
import { BibleStickerGrid } from "@/components/BibleStickerGrid";
import { NewNoteBanner } from "@/components/moms-bible/MbBanners";
import { MbStampGrid, type StampCell } from "@/components/moms-bible/MbStampGrid";
import { chapterGrid } from "@/lib/bible/chapter-pages";
import type { BibleBookMeta } from "@/lib/bible/latinprayer";
import { isDouaySlug } from "@/lib/bible/ref-map";
import type { bookPageMomsBible } from "@/lib/moms-bible/page-data";

type Props = {
  book: BibleBookMeta;
  testamentBooks: BibleBookMeta[];
  completedChapters: number[];
  /** Mom's Bible stamps for a parent (their selected child) or a signed-in child. */
  momsBible?: Awaited<ReturnType<typeof bookPageMomsBible>>;
};

const STAMP_ORDER = ["waiting", "shared", "highlights"] as const;

export function BibleBookHub({ book, testamentBooks, completedChapters, momsBible }: Props) {
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
      {momsBible?.childBanner && (
        <div className="mt-4">
          <NewNoteBanner note={momsBible.childBanner} />
        </div>
      )}
      {momsBible && isDouaySlug(book.slug) ? (
        <MbStampGrid
          bookName={book.name}
          cells={chapterGrid(book.slug).map((c): StampCell => {
            const stamps = c.douayChapters.map((d) => momsBible.stamps[d]).filter(Boolean);
            return {
              label: c.label,
              href: c.href,
              stamp: STAMP_ORDER.find((s) => stamps.includes(s)) ?? null,
              read: c.douayChapters.length > 0 && c.douayChapters.every((d) => done.has(d)),
            };
          })}
          filterLabel={
            momsBible.viewer === "child"
              ? `Show ${momsBible.roleLabels.join(" & ") || "Mom"}'s Highlights Only`
              : `Show ${momsBible.childName}'s marked chapters only`
          }
          waitingLabel={momsBible.viewer === "child" ? "Waiting for You" : `Waiting for ${momsBible.childName}`}
        />
      ) : (
        <BibleStickerGrid
          bookSlug={book.slug}
          bookName={book.name}
          chapterCount={book.totalChapters}
          completedChapters={completedChapters}
          chapters={chapters}
        />
      )}
    </TestamentPageShell>
  );
}
