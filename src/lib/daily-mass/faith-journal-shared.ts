/** Client-safe Faith Journal constants (Daily Mass banner). Entries are Bible passage memos. */

/** One entry type: the body prefix + colour mark a memo as a Faith Journal entry. */
export const JOURNAL_PREFIX = "✍️ Journal: ";
export const JOURNAL_COLOR = "yellow";

/** Signed-in families without Plus may keep this many entries (enforced in POST /api/bible/memos). */
export const FREE_JOURNAL_LIMIT = 4;

/** Where on the passage the memo is anchored; computed on the server from the chapter text. */
export type JournalAnchor = {
  bookSlug: string;
  chapter: number;
  startVerse: number;
  endVerse: number;
  startOffset: number;
  endOffset: number;
  quotedText: string;
  textVersion: string;
};

export type JournalEntry = {
  id: string;
  text: string;
  createdAt: string;
  authorName: string;
};

export type FaithJournalState = {
  signedIn: boolean;
  paid: boolean;
  /** Journal entries saved by the whole family (parent + children). 0 when signed out. */
  total: number;
  /** Null when signed out or today's citation can't be resolved to a passage (saving is then disabled). */
  anchor: JournalAnchor | null;
  /** Signed in: the latest entries the reader may see (max 3); [] when signed out. */
  entries: JournalEntry[];
};

const GOSPEL_SLUGS = new Set(["matthew", "mark", "luke", "john"]);

/** A memo counts as a Faith Journal entry when it has the prefix, the journal colour and sits on a Gospel passage. */
export function isJournalMemo(m: { body: string; color?: string | null; bookSlug: string }): boolean {
  return (
    m.body.startsWith(JOURNAL_PREFIX) &&
    m.body.length > JOURNAL_PREFIX.length &&
    m.color === JOURNAL_COLOR &&
    GOSPEL_SLUGS.has(m.bookSlug)
  );
}

export function journalDraftKey(dateKey: string): string {
  return `ckc.faithJournal.draft.${dateKey}`;
}
