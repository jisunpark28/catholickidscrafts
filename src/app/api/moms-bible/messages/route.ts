import { linkedParents } from "@/lib/moms-bible/access";
import {
  decisionError,
  getChildSession,
  mbError,
  MB_CHILD_WRITE_RULE,
  parseChapterRef,
  parseId,
  readJsonBody,
  writeRateLimit,
} from "@/lib/moms-bible/http";
import { notifyChildReply } from "@/lib/moms-bible/notify";
import { canChildStartMessage, parseChildReply, parseVerseRange } from "@/lib/moms-bible/rules";
import { prisma } from "@/lib/prisma";
import { crossOriginError } from "@/lib/same-origin";
import { childHasFamilyPass } from "@/lib/subscription/entitlements";
import { NextResponse } from "next/server";

type Body = { book?: unknown; chapter?: unknown; verse?: unknown; toParentId?: unknown; stickerKey?: unknown; body?: unknown };

/**
 * POST: a signed-in child starts a message on one verse of their own Bible, to one linked parent:
 * a sticker and/or text (<= 200 chars), like a reply. The child always comes from the session,
 * never the body. New threads need the Family Pass (same rule as parents' new notes); after it
 * ends the child can still answer waiting notes through /notes/[id]/items.
 */
export async function POST(request: Request) {
  const bad = crossOriginError(request);
  if (bad) return bad;
  const child = await getChildSession();
  if (!child) return mbError(401, "Not signed in");
  const parsed = await readJsonBody<Body>(request);
  if (!parsed.ok) return parsed.res;
  const b = parsed.body;

  const ref = parseChapterRef(b.book, b.chapter);
  const toParentId = parseId(b.toParentId);
  if (!ref || !toParentId || b.verse === null || b.verse === undefined) return mbError(400, "Invalid message");
  const range = parseVerseRange(b.verse, b.verse, ref.verseCount);
  if (!range.ok || range.start === null) return mbError(400, "Invalid message");
  const content = parseChildReply(b);
  if (!content.ok) return mbError(400, content.error);

  const [parents, familyPass] = await Promise.all([linkedParents(child.childId), childHasFamilyPass(child.childId)]);
  const err = decisionError(
    canChildStartMessage({ recipientLinked: parents.some((p) => p.parentId === toParentId), familyPass }),
  );
  if (err) return err;
  const limited = await writeRateLimit(`mb:child:${child.childId}`, MB_CHILD_WRITE_RULE);
  if (limited) return limited;

  const now = new Date();
  const created = await prisma.$transaction(async (tx) => {
    const note = await tx.mbNote.create({
      data: {
        subProfileId: child.childId,
        authorParentId: toParentId,
        bookSlug: ref.bookSlug,
        chapter: ref.chapter,
        startVerse: range.start,
        endVerse: range.end,
        startedByChild: true,
        // The child's words are the first item, so nothing is "waiting for" the child here.
        childRepliedAt: now,
        lastActivityAt: now,
      },
      select: { id: true },
    });
    const base = { noteId: note.id, authorKind: "CHILD" as const, authorChildId: child.childId };
    const ids: string[] = [];
    if (content.value.stickerKey) {
      const s = await tx.mbNoteItem.create({
        data: { ...base, kind: "STICKER", stickerKey: content.value.stickerKey, createdAt: now },
        select: { id: true },
      });
      ids.push(s.id);
    }
    if (content.value.body) {
      const t = await tx.mbNoteItem.create({
        data: { ...base, kind: "TEXT", body: content.value.body, createdAt: new Date(now.getTime() + 1) },
        select: { id: true },
      });
      ids.push(t.id);
    }
    return { noteId: note.id, itemId: ids[0]! };
  });
  await notifyChildReply({ noteId: created.noteId, itemId: created.itemId, childId: child.childId });
  return NextResponse.json({ ok: true, noteId: created.noteId });
}
