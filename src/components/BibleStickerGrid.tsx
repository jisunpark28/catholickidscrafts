import Link from "next/link";

/** One grid cell: an official (NABRE) chapter label and its reader link. */
export type StickerGridChapter = { label: string; href: string; filled: boolean };

type Props = {
  bookSlug: string;
  bookName: string;
  chapterCount: number;
  completedChapters: number[];
  /** Official chapter cells (overrides chapterCount / completedChapters numbering). */
  chapters?: readonly StickerGridChapter[];
};

export function BibleStickerGrid({
  bookSlug,
  bookName,
  chapterCount,
  completedChapters,
  chapters,
}: Props) {
  const done = new Set(completedChapters);
  const cells: readonly StickerGridChapter[] =
    chapters ??
    Array.from({ length: chapterCount }, (_, i) => ({
      label: String(i + 1),
      href: `/bible/read/${bookSlug}/${i + 1}`,
      filled: done.has(i + 1),
    }));

  return (
    <div className="mt-10 w-full">
      <div className="grid w-full grid-cols-5 gap-x-6 gap-y-8 sm:grid-cols-8 sm:gap-x-8 md:grid-cols-10 md:gap-x-10 md:gap-y-10">
        {cells.map(({ label, href, filled }) => (
          <Link
            key={label}
            href={href}
            className="flex items-center justify-center py-1 transition hover:scale-105"
            title={`${bookName} ${label}`}
            aria-label={`Chapter ${label}${filled ? ", completed" : ""}`}
          >
            <span
              className={`text-3xl leading-none sm:text-4xl ${
                filled ? "opacity-100 drop-shadow-sm" : "opacity-[0.18] grayscale"
              }`}
              aria-hidden
            >
              ✝
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
