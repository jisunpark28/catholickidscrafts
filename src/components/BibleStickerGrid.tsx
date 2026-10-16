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
    <div className="mt-10 w-full">
      <div className="grid w-full grid-cols-5 gap-x-6 gap-y-8 sm:grid-cols-8 sm:gap-x-8 md:grid-cols-10 md:gap-x-10 md:gap-y-10">
        {Array.from({ length: chapterCount }, (_, i) => {
          const chapter = i + 1;
          const filled = done.has(chapter);
          return (
            <Link
              key={chapter}
              href={`/bible/read/${bookSlug}/${chapter}`}
              className="flex items-center justify-center py-1 transition hover:scale-105"
              title={`${bookName} ${chapter}`}
              aria-label={`Chapter ${chapter}${filled ? ", completed" : ""}`}
            >
              <span
                className={`text-3xl leading-none sm:text-4xl ${
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
