import {
  chapterPlainText,
  type BibleChapterResponse,
} from "@/lib/bible/latinprayer";
import { modernizeForReading } from "@/lib/bible/modernize-for-reading";

/** Plain chapter text for display and typing (modernized when the book is in the pilot). */
export function chapterPlainTextForReading(
  chapter: BibleChapterResponse,
  bookSlug: string,
): string {
  const plain = chapterPlainText(chapter);
  return modernizeForReading(plain, { bookSlug });
}
