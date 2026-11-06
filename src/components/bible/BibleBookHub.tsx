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

function stampFor(
  douayChapters: number[],
  stamps: Record<number, "mine" | "waiting" | "shared">,
): StampCell["stamp"] {
  const found = douayChapters.map((d) => stamps[d]).filter(Boolean);
  return STAMP_ORDER.find((s) => found.includes(s)) ?? null;
}

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

  const cells: StampCell[] =
    momsBible && isDouaySlug(book.slug)
      ? chapterGrid(book.slug).map((c) => ({
          label: c.label,
          href: c.href,
          stamp: stampFor(c.douayChapters, momsBible.stamps),
        }))
      : [];

  const highlightCells: StampCell[] =
    momsBible && isDouaySlug(book.slug)
      ? testamentBooks.flatMap((b) => {
          if (!isDouaySlug(b.slug)) return [];
          const bookStamps = momsBible.stampsByBook[b.slug] ?? {};
          return chapterGrid(b.slug).flatMap((c): StampCell[] => {
            const stamp = stampFor(c.douayChapters, bookStamps);
            if (!stamp) return [];
            return [{ label: c.label, href: c.href, stamp, bookName: b.name }];
          });
        })
      : [];

  return (
    <TestamentPageShell>
      {momsBible && isDouaySlug(book.slug) ? (
        <div className="space-y-4 rounded-[24px] bg-[#fff3e6] p-4 sm:p-6 lg:p-8">
          {momsBible.childBanner && <NewNoteBanner note={momsBible.childBanner} />}
          <MbStampGrid
            bookName={book.name}
            testamentLabel={book.testament === "OT" ? "the Old Testament" : "the New Testament"}
            viewer={momsBible.viewer}
            roleLabel={momsBible.roleLabels.join(" & ") || "Mom"}
            toolbar={<MbToolbar data={momsBible.toolbar} />}
            bookSelect={<BibleBookSelect books={testamentBooks} currentSlug={book.slug} showLabel={false} />}
            cells={cells}
            highlightCells={highlightCells}
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
