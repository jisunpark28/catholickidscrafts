import { BibleBookSelect } from "@/components/BibleBookSelect";
import { BibleHubShell } from "@/components/bible/BibleHubShell";
import { BibleStickerGrid } from "@/components/BibleStickerGrid";
import { HubTypingWidth } from "@/components/HubTypingWidth";
import type { BibleBookMeta } from "@/lib/bible/latinprayer";

type Props = {
  book: BibleBookMeta;
  testamentBooks: BibleBookMeta[];
  testamentHref: string;
  testamentLabel: string;
  completedChapters: number[];
};

export function BibleBookHub({
  book,
  testamentBooks,
  testamentHref,
  testamentLabel,
  completedChapters,
}: Props) {
  const showTestamentBack = book.slug !== "genesis" && book.slug !== "matthew";

  return (
    <BibleHubShell
      showBack={showTestamentBack}
      backHref={testamentHref}
      backLabel={`← ${testamentLabel}`}
    >
      <HubTypingWidth className="space-y-4">
        <div>
          <h1 className="text-2xl font-semibold text-[var(--color-ink)] sm:text-3xl">{book.name}</h1>
        </div>

        <BibleBookSelect books={testamentBooks} currentSlug={book.slug} />

        <BibleStickerGrid
          bookSlug={book.slug}
          bookName={book.name}
          chapterCount={book.totalChapters}
          completedChapters={completedChapters}
        />
      </HubTypingWidth>
    </BibleHubShell>
  );
}
