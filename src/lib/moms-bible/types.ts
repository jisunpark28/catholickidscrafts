/** Serializable Mom's Bible shapes shared by server queries, API routes and client components. */
import type { MbColorKey, MbStamp, MbStickerKey } from "./constants";

export type MbAuthorDto = { parentId: string; roleLabel: string; isMe: boolean };

export type MbHighlightDto = {
  id: string;
  authorParentId: string;
  /** Storage chapter/verse (route-internal; displayed through verse labels). */
  chapter: number;
  verse: number;
  color: MbColorKey | null;
  star: boolean;
  underline: boolean;
};

export type MbItemDto = {
  id: string;
  authorKind: "PARENT" | "CHILD";
  authorParentId: string | null;
  kind: "TEXT" | "STICKER";
  body: string | null;
  stickerKey: MbStickerKey | null;
  createdAt: string;
  mine: boolean;
};

export type MbNoteDto = {
  id: string;
  authorParentId: string;
  chapter: number;
  startVerse: number | null;
  endVerse: number | null;
  /** Official reference, e.g. "Psalm 34:19" (or "Psalm 34" for a chapter letter). */
  ref: string;
  color: MbColorKey | null;
  situationKey: string | null;
  childRepliedAt: string | null;
  createdAt: string;
  /** Parent view: this parent hasn't seen the child's latest reply yet (dot on the tab). */
  unseenReply: boolean;
  items: MbItemDto[];
};

export type MbChildChoice = { id: string; displayName: string };

export type MbChapterView = {
  viewer: "parent" | "child";
  childId: string;
  childName: string;
  /** Parent view: other children this parent may "also send to". */
  siblings: MbChildChoice[];
  /** Parent view: all linked children (for the switcher). */
  children: MbChildChoice[];
  authors: MbAuthorDto[];
  highlights: MbHighlightDto[];
  notes: MbNoteDto[];
  /** Family Pass: any linked parent has Plus. */
  familyPass: boolean;
  /** Child view: total 🌱 seeds. */
  seeds: number;
  /** Static sample (free preview): nothing is saved; writes open the Plus modal. */
  preview?: boolean;
};

export type MbBookStamps = { stamps: Record<number, Exclude<MbStamp, null>>; childName: string; viewer: "parent" | "child" };

/** Top bar: "Viewing Mia's Bible ▾ | Leo" + PDF button (parent) or "Hi, Mia! (mia-4821)" (child). */
export type MbToolbarData =
  | { viewer: "parent"; childId: string; childName: string; children: MbChildChoice[]; canPrint: boolean }
  | { viewer: "child"; childName: string; kidCode: string | null };
