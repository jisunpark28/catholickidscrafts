import { notFound } from "next/navigation";
import { BibleChapterTyping } from "@/components/BibleChapterTyping";
import { BibleHubShell } from "@/components/bible/BibleHubShell";
import { HOME_HUB_DAILY_MASS_WIDTH_CLASS } from "@/components/HomeHubButton";
import { chapterPlainText, fetchBibleChapter } from "@/lib/bible/latinprayer";
import { canonicalForPath } from "@/lib/site-metadata";
import type { Metadata } from "next";

type Props = { params: Promise<{ bookSlug: string; chapter: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { bookSlug, chapter } = await params;
  return {
    title: `Type ${bookSlug} ${chapter}`,
    ...canonicalForPath(`/bible/read/${bookSlug}/${chapter}`),
  };
}

export default async function BibleReadPage({ params }: Props) {
  const { bookSlug, chapter: chapterStr } = await params;
  const chapterNum = Number(chapterStr);
  if (!Number.isFinite(chapterNum) || chapterNum < 1) notFound();

  let data;
  try {
    data = await fetchBibleChapter(bookSlug, chapterNum);
  } catch {
    notFound();
  }

  const text = chapterPlainText(data);

  return (
    <BibleHubShell
      backHref={`/bible/${bookSlug}`}
      backLabel={`← ${data.meta.book.name}`}
    >
      <section className={`${HOME_HUB_DAILY_MASS_WIDTH_CLASS} space-y-4`}>
        <div>
          <h1 className="text-xl font-semibold text-[var(--color-ink)] sm:text-2xl">
            {data.meta.book.name} — Chapter {data.meta.chapter}
          </h1>
          <p className="mt-1 text-xs text-[var(--color-muted)]">{data.citation}</p>
        </div>
        <BibleChapterTyping
          bookSlug={bookSlug}
          bookName={data.meta.book.name}
          chapter={data.meta.chapter}
          text={text}
          citation={data.citation}
        />
      </section>
    </BibleHubShell>
  );
}
