import Link from "next/link";
import { notFound } from "next/navigation";
import { BibleChapterTyping } from "@/components/BibleChapterTyping";
import { PageShell } from "@/components/PageShell";
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
    <PageShell>
      <Link href={`/bible/${bookSlug}`} className="text-sm font-semibold text-[var(--color-link)]">
        ← {data.meta.book.name}
      </Link>
      <h1 className="mt-6 text-2xl text-[var(--color-ink)]">
        {data.meta.book.name} — Chapter {data.meta.chapter}
      </h1>
      <p className="mt-2 text-xs text-[var(--color-muted)]">{data.citation}</p>
      <BibleChapterTyping
        bookSlug={bookSlug}
        bookName={data.meta.book.name}
        chapter={data.meta.chapter}
        text={text}
        citation={data.citation}
      />
    </PageShell>
  );
}
