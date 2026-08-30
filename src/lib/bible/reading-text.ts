import {
  chapterPlainText,
  type BibleChapterResponse,
} from "@/lib/bible/latinprayer";
import { modernizeForReading } from "@/lib/bible/modernize-for-reading";

/** Plain chapter text for display and typing (modernized Douay-Rheims wording). */
export function chapterPlainTextForReading(chapter: BibleChapterResponse): string {
  const plain = chapterPlainText(chapter);
  return modernizeForReading(plain);
}
