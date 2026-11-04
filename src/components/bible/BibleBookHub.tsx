import { BibleBookSelect } from "@/components/BibleBookSelect";
import { TestamentPageShell } from "@/components/bible/TestamentPageShell";
import { BibleStickerGrid } from "@/components/BibleStickerGrid";
import { NewNoteBanner } from "@/components/moms-bible/MbBanners";
import { MbStampGrid, type StampCell } from "@/components/moms-bible/MbStampGrid";
import { MbToolbar } from "@/components/moms-bible/MbToolbar";
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

/** One stamp per tile when a page joins several chapters: what needs attention first. */
const STAMP_ORDER = ["waiting", "mine", "shared"] as const;

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
      {momsBible && isDouaySlug(book.slug) ? (
        <div className="space-y-4 rounded-[24px] bg-[#fff3e6] p-4 sm:p-6 lg:p-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <BibleBookSelect books={testamentBooks} currentSlug={book.slug} showLabel={false} />
            <MbToolbar data={momsBible.toolbar} />
          </div>
          {momsBible.childBanner && <NewNoteBanner note={momsBible.childBanner} />}
          <MbStampGrid
            bookName={book.name}
            viewer={momsBible.viewer}
            roleLabel={momsBible.roleLabels.join(" & ") || "Mom"}
            cells={chapterGrid(book.slug).map((c): StampCell => {
              const stamps = c.douayChapters.map((d) => momsBible.stamps[d]).filter(Boolean);
              return { label: c.label, href: c.href, stamp: STAMP_ORDER.find((s) => stamps.includes(s)) ?? null };
            })}
          />
        </div>
      ) : (
        <>
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
        </>
      )}
    </TestamentPageShell>
  );
}
