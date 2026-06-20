import Link from "next/link";

type Props = {
  bookSlug: string;
  bookName: string;
  chapterCount: number;
  completedChapters: number[];
};

export function BibleStickerGrid({
  bookSlug,
  bookName,
  chapterCount,
  completedChapters,
}: Props) {
  const done = new Set(completedChapters);

  return (
    <div className="mt-8">
      <p className="mb-4 text-sm text-[var(--color-muted)]">
        {completedChapters.length} / {chapterCount} stickers
      </p>
      <div className="grid grid-cols-5 gap-3 sm:grid-cols-8 md:grid-cols-10">
        {Array.from({ length: chapterCount }, (_, i) => {
          const chapter = i + 1;
          const filled = done.has(chapter);
          return (
            <Link
              key={chapter}
              href={`/bible/read/${bookSlug}/${chapter}`}
              className="flex aspect-square items-center justify-center transition hover:scale-105"
              title={`${bookName} ${chapter}`}
              aria-label={`Chapter ${chapter}${filled ? ", completed" : ""}`}
            >
              <span
                className={`text-3xl sm:text-4xl ${
                  filled
                    ? "opacity-100 drop-shadow-sm"
                    : "opacity-[0.18] grayscale"
                }`}
                aria-hidden
              >
                ✝
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
