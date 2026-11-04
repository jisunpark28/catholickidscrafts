/**
 * Mom's Bible decision rules, kept pure (no DB) so scripts/test-moms-bible.ts can prove them.
 * The API routes load the facts (links, Family Pass, note state) and ask these functions.
 */
import { isMbColor, isMbSticker, MB_LIMITS, type MbColorKey, type MbStamp, type MbStickerKey } from "./constants";

// ───────────────────────── Authorization + entitlement ─────────────────────────

export type ParentFacts = {
  /** ParentChildLink exists (owner or co-parent). */
  linked: boolean;
  /** Family Pass: any parent linked to this child has active Plus. */
  familyPass: boolean;
};

export type Decision = { ok: true } | { ok: false; status: 403 | 402 | 404; error: string };

const OK: Decision = { ok: true };
export const MB_NOT_FOUND = "Not found";
export const MB_PLUS_NEEDED =
  "Writing new notes and highlights needs Plus for one of this child's parents. Reading always stays open.";
export const MB_PDF_PLUS = "Printing the Bible book needs Plus on your own account.";
export const MB_REPLY_LOCKED =
  "You already answered this note. More replies come back when your family has Plus again.";

/** Reading a child's Bible: any linked parent, Plus or not. */
export function canParentRead(f: ParentFacts): Decision {
  return f.linked ? OK : { ok: false, status: 404, error: MB_NOT_FOUND };
}

/** New/edited highlights, notes, letters and parent replies: linked + Family Pass. */
export function canParentWrite(f: ParentFacts): Decision {
  if (!f.linked) return { ok: false, status: 404, error: MB_NOT_FOUND };
  if (!f.familyPass) return { ok: false, status: 402, error: MB_PLUS_NEEDED };
  return OK;
}

/**
 * The keepsake PDF: a linked parent with their OWN Plus (Family Pass doesn't cover it, design 3/C).
 */
export function canParentPrintPdf(f: { linked: boolean; ownPlus: boolean }): Decision {
  if (!f.linked) return { ok: false, status: 404, error: MB_NOT_FOUND };
  if (!f.ownPlus) return { ok: false, status: 402, error: MB_PDF_PLUS };
  return OK;
}

/** Removing your own note/highlight/item is always allowed for a linked author (no Plus needed). */
export function canParentRemove(f: ParentFacts & { isAuthor: boolean }): Decision {
  if (!f.linked || !f.isAuthor) return { ok: false, status: 404, error: MB_NOT_FOUND };
  return OK;
}

export type ChildReplyFacts = {
  sessionChildId: string;
  noteChildId: string;
  familyPass: boolean;
  /** null = the child hasn't answered this note yet (yellow stamp). */
  childRepliedAt: Date | null;
};

/**
 * A child replies only in their own Bible. With Plus: any time. After Plus ends: exactly one reply
 * (one request, sticker and/or text) to each note they haven't answered yet.
 */
export function canChildReply(f: ChildReplyFacts): Decision {
  if (f.sessionChildId !== f.noteChildId) return { ok: false, status: 404, error: MB_NOT_FOUND };
  if (f.familyPass || f.childRepliedAt === null) return OK;
  return { ok: false, status: 402, error: MB_REPLY_LOCKED };
}

/** "Also send to Leo": every extra child must be linked to the author too. */
export function siblingTargets(primaryId: string, also: unknown, linkedIds: ReadonlySet<string>): string[] | null {
  if (also === undefined || also === null) return [primaryId];
  if (!Array.isArray(also) || also.length > MB_LIMITS.alsoSendTo) return null;
  const out = [primaryId];
  for (const id of also) {
    if (typeof id !== "string" || !linkedIds.has(id)) return null;
    if (!out.includes(id)) out.push(id);
  }
  return out;
}

// ───────────────────────── Validation ─────────────────────────

/** Plain text: trimmed, control characters removed (newlines kept), length-checked. */
export function cleanText(raw: unknown, max: number): { ok: true; value: string } | { ok: false; error: string } {
  if (typeof raw !== "string") return { ok: false, error: "Text is required" };
  const value = raw.replace(/\r\n?/g, "\n").replace(/[\u0000-\u0009\u000b-\u001f\u007f]/g, "").trim();
  if (!value) return { ok: false, error: "Text is required" };
  if ([...value].length > max) return { ok: false, error: `Please keep it to ${max} characters or fewer.` };
  return { ok: true, value };
}

export type ChildReplyInput = { stickerKey: MbStickerKey | null; body: string | null };

/** A child reply: one of the 3 stickers and/or text up to 200 characters. */
export function parseChildReply(raw: { stickerKey?: unknown; body?: unknown }):
  | { ok: true; value: ChildReplyInput }
  | { ok: false; error: string } {
  let stickerKey: MbStickerKey | null = null;
  if (raw.stickerKey !== undefined && raw.stickerKey !== null && raw.stickerKey !== "") {
    if (!isMbSticker(raw.stickerKey)) return { ok: false, error: "Unknown sticker" };
    stickerKey = raw.stickerKey;
  }
  let body: string | null = null;
  if (typeof raw.body === "string" && raw.body.trim()) {
    const t = cleanText(raw.body, MB_LIMITS.childText);
    if (!t.ok) return t;
    body = t.value;
  } else if (raw.body !== undefined && raw.body !== null && typeof raw.body !== "string") {
    return { ok: false, error: "Invalid reply" };
  }
  if (!stickerKey && !body) return { ok: false, error: "Pick a sticker or write a reply" };
  return { ok: true, value: { stickerKey, body } };
}

export function parseColor(raw: unknown): { ok: true; value: MbColorKey | null } | { ok: false } {
  if (raw === null || raw === undefined || raw === "") return { ok: true, value: null };
  return isMbColor(raw) ? { ok: true, value: raw } : { ok: false };
}

/** Verse range inside one chapter (storage numbering). null start = chapter letter. */
export function parseVerseRange(
  start: unknown,
  end: unknown,
  verseCount: number,
): { ok: true; start: number | null; end: number | null } | { ok: false } {
  if (start === null || start === undefined) {
    return end === null || end === undefined ? { ok: true, start: null, end: null } : { ok: false };
  }
  const s = Number(start);
  const e = end === null || end === undefined ? s : Number(end);
  if (!Number.isInteger(s) || !Number.isInteger(e) || s < 1 || e < s || e > verseCount) return { ok: false };
  return { ok: true, start: s, end: e };
}

export function cleanRoleLabel(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  const v = raw.replace(/[^\p{L}\p{N} '&.-]/gu, "").replace(/\s+/g, " ").trim();
  if (!v || [...v].length > MB_LIMITS.roleLabel) return null;
  return v;
}

// ───────────────────────── Stamps + seeds ─────────────────────────

/**
 * One stamp per child x chapter, the one that needs attention first.
 * Child: an unanswered note = waiting (new note to read); all answered = shared; only marks = mine.
 * Parent: an unseen child reply = waiting (new reply to read); a note not answered yet or only
 * highlights = mine; all answered = shared.
 */
export function chapterStamp(
  viewer: "parent" | "child",
  notes: readonly { childRepliedAt: Date | null }[],
  highlightCount: number,
  unseenReplies = 0,
): MbStamp {
  const open = notes.some((n) => n.childRepliedAt === null);
  if (viewer === "child") {
    if (open) return "waiting";
    if (notes.length > 0) return "shared";
    return highlightCount > 0 ? "mine" : null;
  }
  if (unseenReplies > 0) return "waiting";
  if (open) return "mine";
  if (notes.length > 0) return "shared";
  return highlightCount > 0 ? "mine" : null;
}

/** 🌱 seeds: chapters where the child answered at least one note. */
export function seedCount(notes: readonly { bookSlug: string; chapter: number; childRepliedAt: Date | null }[]): number {
  const set = new Set<string>();
  for (const n of notes) if (n.childRepliedAt) set.add(`${n.bookSlug}:${n.chapter}`);
  return set.size;
}

// ───────────────────────── Notification emails ─────────────────────────

export const MB_EMAIL_COOLDOWN_MS = 60 * 60 * 1000;

export type EmailMode = "INSTANT" | "DIGEST" | "OFF";

/** Send the reply email right now? INSTANT only, and at most one email per hour per parent. */
export function shouldSendInstantEmail(mode: EmailMode, lastReplyEmailAt: Date | null, now: Date): boolean {
  if (mode !== "INSTANT") return false;
  return !lastReplyEmailAt || now.getTime() - lastReplyEmailAt.getTime() >= MB_EMAIL_COOLDOWN_MS;
}

/**
 * Daily catch-up / digest: notifications not seen and not emailed, older than 1 hour.
 * INSTANT parents also get it for replies that waited out the cooldown; OFF never.
 */
export function digestPending<T extends { createdAt: Date; seenAt: Date | null; emailedAt: Date | null }>(
  mode: EmailMode,
  notifications: readonly T[],
  now: Date,
): T[] {
  if (mode === "OFF") return [];
  return notifications.filter(
    (n) => !n.seenAt && !n.emailedAt && now.getTime() - n.createdAt.getTime() >= MB_EMAIL_COOLDOWN_MS,
  );
}

/** Email copy: only the child's first name. Never the child's words, sticker or verse. */
export function replyEmailCopy(childFirstName: string, count: number): { subject: string; lead: string } {
  const name = childFirstName.trim() || "Your child";
  if (count <= 1) {
    return { subject: `💌 ${name} sent a warm reply to your note`, lead: `${name} sent a warm reply to your note!` };
  }
  return {
    subject: `💌 ${name} sent ${count} warm replies to your notes`,
    lead: `${name} sent ${count} warm replies to your notes!`,
  };
}

// ───────────────────────── Invites ─────────────────────────

export const MB_INVITE_TTL_MS = 7 * 24 * 60 * 60 * 1000;

export type InviteFacts = {
  expiresAt: Date;
  acceptedAt: Date | null;
  ownerAccountId: string;
  acceptorId: string;
};

export function canAcceptInvite(f: InviteFacts, now: Date): { ok: true } | { ok: false; error: string } {
  if (f.acceptedAt) return { ok: false, error: "This invite was already used." };
  if (f.expiresAt.getTime() <= now.getTime()) return { ok: false, error: "This invite has expired. Ask for a new one." };
  if (f.ownerAccountId === f.acceptorId) return { ok: false, error: "This invite is for another parent's account." };
  return { ok: true };
}
