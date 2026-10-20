import {
  type BibleChapterResponse,
} from "@/lib/bible/latinprayer";
import { modernizeVerse } from "@/lib/bible/modernize-for-reading";

/** Plain chapter text for display and typing (modernized Douay-Rheims wording, per verse + overrides). */
export function chapterPlainTextForReading(chapter: BibleChapterResponse): string {
  const { slug } = chapter.meta.book;
  return chapter.verses
    .map((v) => modernizeVerse(slug, chapter.meta.chapter, v.verse, v.text))
    .join(" ");
}
