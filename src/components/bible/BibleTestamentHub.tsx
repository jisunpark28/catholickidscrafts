import { BibleHubShell } from "@/components/bible/BibleHubShell";
import { BibleReaderNotice } from "@/components/bible/BibleReaderNotice";
import { HomeHubButtonLink, HOME_HUB_SECTIONS_WIDTH_CLASS } from "@/components/HomeHubButton";
import type { BibleBookMeta } from "@/lib/bible/latinprayer";
import type { ReaderDisplay } from "@/lib/reader-display";

type Props = {
  title: string;
  description: string;
  books: BibleBookMeta[];
  reader: ReaderDisplay;
};

export function BibleTestamentHub({ title, description, books, reader }: Props) {
  return (
    <BibleHubShell>
      <section className={`${HOME_HUB_SECTIONS_WIDTH_CLASS} space-y-6`}>
        <div>
          <h1 className="text-sm font-bold uppercase tracking-[0.12em] text-[var(--color-muted)]">
            {title}
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-[var(--color-muted)]">{description}</p>
        </div>

        <BibleReaderNotice reader={reader} />

        <div>
          <h2 className="mb-3 text-xs font-bold uppercase tracking-wide text-[var(--color-muted)]">
            Choose a book
          </h2>
          <div className="flex flex-col gap-3">
            {books.map((book) => (
              <HomeHubButtonLink key={book.slug} href={`/bible/${book.slug}`}>
                {book.name}
                <span className="ml-2 text-sm font-normal opacity-70">
                  ({book.totalChapters} chapters)
                </span>
              </HomeHubButtonLink>
            ))}
          </div>
        </div>

        <p className="text-xs text-[var(--color-muted)]">
          Type each chapter with 90% accuracy to unlock a praise sticker. Douay-Rheims (public
          domain) via latinprayer.org.
        </p>
      </section>
    </BibleHubShell>
  );
}
