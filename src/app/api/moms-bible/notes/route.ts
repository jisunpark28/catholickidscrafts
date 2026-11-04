import { randomUUID } from "node:crypto";
import { isSituationKey } from "@/data/moms-bible/situations";
import { parentApiGuard } from "@/lib/family-auth";
import { linkedChildren, parentFacts } from "@/lib/moms-bible/access";
import { MB_LIMITS } from "@/lib/moms-bible/constants";
import {
  decisionError,
  mbError,
  MB_PARENT_WRITE_RULE,
  parseChapterRef,
  parseId,
  readJsonBody,
  writeRateLimit,
} from "@/lib/moms-bible/http";
import { canParentWrite, cleanText, parseColor, parseVerseRange, siblingTargets } from "@/lib/moms-bible/rules";
import { prisma } from "@/lib/prisma";
import { crossOriginError } from "@/lib/same-origin";
import { NextResponse } from "next/server";

type Body = {
  childId?: unknown;
  book?: unknown;
  chapter?: unknown;
  startVerse?: unknown;
  endVerse?: unknown;
  body?: unknown;
  color?: unknown;
  situationKey?: unknown;
  alsoChildIds?: unknown;
};

/**
 * POST: a parent writes a verse note / prayer (startVerse..endVerse) or the chapter letter
 * (startVerse null). A chapter already holding this parent's letter gets the text appended.
 */
export async function POST(request: Request) {
  const bad = crossOriginError(request);
  if (bad) return bad;
  const guard = await parentApiGuard();
  if (guard.error) return guard.error;
  const parentId = guard.session.familyAccountId;
  const parsed = await readJsonBody<Body>(request);
  if (!parsed.ok) return parsed.res;
  const b = parsed.body;

  const childId = parseId(b.childId);
  const ref = parseChapterRef(b.book, b.chapter);
  if (!childId || !ref) return mbError(400, "Invalid note");
  const range = parseVerseRange(b.startVerse, b.endVerse, ref.verseCount);
  const color = parseColor(b.color);
  if (!range.ok || !color.ok) return mbError(400, "Invalid note");
  const text = cleanText(b.body, MB_LIMITS.parentText);
  if (!text.ok) return mbError(400, text.error);
  const situationKey = isSituationKey(b.situationKey) ? b.situationKey : null;

  const limited = await writeRateLimit(`mb:parent:${parentId}`, MB_PARENT_WRITE_RULE);
  if (limited) return limited;

  const linkedIds = new Set((await linkedChildren(parentId)).map((c) => c.id));
  const targets = siblingTargets(childId, b.alsoChildIds, linkedIds);
  if (!targets) return mbError(400, "Invalid children");
  for (const target of targets) {
    const err = decisionError(canParentWrite(await parentFacts(parentId, target)));
    if (err) return err;
  }

  const now = new Date();
  const batchId = targets.length > 1 ? randomUUID() : null;
  const ids: string[] = [];
  for (const subProfileId of targets) {
    const base = { subProfileId, authorParentId: parentId, bookSlug: ref.bookSlug, chapter: ref.chapter };
    if (range.start === null) {
      const existing = await prisma.mbNote.findFirst({ where: { ...base, startVerse: null }, select: { id: true } });
      if (existing) {
        await prisma.$transaction([
          prisma.mbNoteItem.create({
            data: { noteId: existing.id, authorKind: "PARENT", authorParentId: parentId, kind: "TEXT", body: text.value },
          }),
          prisma.mbNote.update({ where: { id: existing.id }, data: { lastActivityAt: now } }),
        ]);
        ids.push(existing.id);
        continue;
      }
    }
    const note = await prisma.mbNote.create({
      data: {
        ...base,
        startVerse: range.start,
        endVerse: range.end,
        color: color.value,
        situationKey,
        batchId,
        lastActivityAt: now,
        items: { create: { authorKind: "PARENT", authorParentId: parentId, kind: "TEXT", body: text.value } },
      },
      select: { id: true },
    });
    ids.push(note.id);
  }
  return NextResponse.json({ ok: true, noteIds: ids });
}
