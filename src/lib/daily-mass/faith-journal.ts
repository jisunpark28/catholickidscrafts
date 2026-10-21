import { fetchBibleChapter } from "@/lib/bible/latinprayer";
import { modernizeVerse } from "@/lib/bible/modernize-for-reading";
import { getReaderKey, isSignedInReaderKey } from "@/lib/bible/reader";
import { loadVisibleMemos, resolveMemoViewer } from "@/lib/bible-memos/memo-access";
import { MEMO_QUOTE_MAX } from "@/lib/bible-memos/passage-memos";
import { buildVerseOffsetTable, chapterTextVersion } from "@/lib/bible-memos/verse-offsets";
import { parseGospelCitation } from "@/lib/daily-mass/gospel-citation";
import {
  FREE_JOURNAL_LIMIT,
  JOURNAL_COLOR,
  JOURNAL_PREFIX,
  type FaithJournalState,
  type JournalAnchor,
} from "@/lib/daily-mass/faith-journal-shared";
import { prisma } from "@/lib/prisma";
import { familyAccountIdForReader, hasPaidFeatures } from "@/lib/subscription/entitlements";
import type { ReaderKey } from "@/lib/bible/reader";
import { normalizePassageText } from "@/lib/typing-accuracy";

/**
 * Anchor for today's Gospel, built exactly like the chapter reader builds memo setup:
 * same verse text (modernized), same normalization, same textVersion hash.
 */
export async function buildJournalAnchor(citation: string | null | undefined): Promise<JournalAnchor | null> {
  const passage = parseGospelCitation(citation);
  if (!passage) return null;
  try {
    const data = await fetchBibleChapter(passage.bookSlug, passage.chapter);
    const verseTexts = data.verses.map((v) => ({
      verse: v.verse,
      text: modernizeVerse(data.meta.book.slug, data.meta.chapter, v.verse, v.text),
    }));
    const table = buildVerseOffsetTable(verseTexts);
    if (!table) return null;
    const normalized = normalizePassageText(verseTexts.map((v) => v.text).join(" "));
    const last = table.verses[table.verses.length - 1]!.verse;
    const startVerse = Math.min(passage.startVerse, last);
    const endVerse = Math.min(passage.endVerse, last);
    const startIdx = table.verses.findIndex((v) => v.verse === startVerse);
    if (startIdx < 0) return null;
    const endIdx = table.verses.findIndex((v) => v.verse === endVerse);
    const startOffset = table.verses[startIdx]!.start;
    const next = table.verses[(endIdx < 0 ? startIdx : endIdx) + 1];
    let endOffset = next ? next.start : table.length;
    let quotedText = normalized.slice(startOffset, endOffset).trim();
    if (quotedText.length > MEMO_QUOTE_MAX) {
      quotedText = quotedText.slice(0, MEMO_QUOTE_MAX).trim();
    }
    endOffset = startOffset + quotedText.length;
    if (!quotedText) return null;
    return {
      bookSlug: passage.bookSlug,
      chapter: passage.chapter,
      startVerse,
      endVerse,
      startOffset,
      endOffset,
      quotedText,
      textVersion: chapterTextVersion(normalized),
    };
  } catch {
    return null;
  }
}

/** Prisma filter for Faith Journal memos (same rule as isJournalMemo). */
const journalWhere = {
  bookSlug: { in: ["matthew", "mark", "luke", "john"] },
  body: { startsWith: JOURNAL_PREFIX },
  color: JOURNAL_COLOR,
};

/** Faith Journal entries saved by anyone in the reader's family (parent or any child profile). */
export async function countFamilyJournalEntries(key: ReaderKey | null): Promise<number> {
  const familyAccountId = await familyAccountIdForReader(key);
  if (!familyAccountId) return 0;
  return prisma.biblePassageMemo.count({
    where: {
      AND: [
        { OR: [{ familyAccountId }, { subProfile: { familyAccountId } }] },
        journalWhere,
      ],
    },
  });
}

/** Free families may still save a Faith Journal entry while under FREE_JOURNAL_LIMIT. */
export async function freeJournalSlotLeft(key: ReaderKey | null): Promise<boolean> {
  return (await countFamilyJournalEntries(key)) < FREE_JOURNAL_LIMIT;
}

/** Who is reading, whether they have Plus, the passage anchor, the family's entry count and latest entries. */
export async function loadFaithJournal(citation: string | null | undefined): Promise<FaithJournalState> {
  const key = await getReaderKey();
  if (!isSignedInReaderKey(key)) return { signedIn: false, paid: false, total: 0, anchor: null, entries: [] };

  const [paid, anchor, viewer, total] = await Promise.all([
    hasPaidFeatures(key),
    buildJournalAnchor(citation),
    resolveMemoViewer(key),
    countFamilyJournalEntries(key),
  ]);
  const memos = viewer ? await loadVisibleMemos(viewer, journalWhere, 3) : [];
  const entries = memos.map((m) => ({
    id: m.id,
    text: m.body.slice(JOURNAL_PREFIX.length),
    createdAt: m.createdAt,
    authorName: m.authorName,
  }));
  return { signedIn: true, paid, total, anchor, entries };
}
