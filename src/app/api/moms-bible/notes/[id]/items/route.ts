import { getFamilySession, parentApiGuard } from "@/lib/family-auth";
import { parentFacts } from "@/lib/moms-bible/access";
import { MB_LIMITS } from "@/lib/moms-bible/constants";
import {
  decisionError,
  getChildSession,
  mbError,
  MB_CHILD_WRITE_RULE,
  MB_PARENT_WRITE_RULE,
  parseId,
  readJsonBody,
  writeRateLimit,
} from "@/lib/moms-bible/http";
import { notifyChildReply } from "@/lib/moms-bible/notify";
import { canChildReply, canParentWrite, cleanText, MB_REPLY_LOCKED, parseChildReply } from "@/lib/moms-bible/rules";
import { prisma } from "@/lib/prisma";
import { crossOriginError } from "@/lib/same-origin";
import { childHasFamilyPass } from "@/lib/subscription/entitlements";
import { NextResponse } from "next/server";

type Body = { body?: unknown; stickerKey?: unknown };

/**
 * POST: add to a note's thread.
 * - Child (own Bible only): a sticker and/or text (<= 200 chars). Sets "Shared Together".
 * - Linked parent: more text (needs Family Pass).
 */
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const bad = crossOriginError(request);
  if (bad) return bad;
  const id = parseId((await params).id);
  if (!id) return mbError(404, "Not found");
  const parsed = await readJsonBody<Body>(request);
  if (!parsed.ok) return parsed.res;
  const note = await prisma.mbNote.findUnique({
    where: { id },
    select: { id: true, subProfileId: true, childRepliedAt: true },
  });

  const child = await getChildSession();
  if (child) {
    if (!note) return mbError(404, "Not found");
    const reply = parseChildReply(parsed.body);
    if (!reply.ok) return mbError(400, reply.error);
    const familyPass = await childHasFamilyPass(child.childId);
    const err = decisionError(
      canChildReply({
        sessionChildId: child.childId,
        noteChildId: note.subProfileId,
        familyPass,
        childRepliedAt: note.childRepliedAt,
      }),
    );
    if (err) return err;
    const limited = await writeRateLimit(`mb:child:${child.childId}`, MB_CHILD_WRITE_RULE);
    if (limited) return limited;

    const now = new Date();
    const result = await prisma.$transaction(async (tx) => {
      // Without Plus only the first reply is allowed; claim it atomically.
      const claim = await tx.mbNote.updateMany({
        where: familyPass ? { id } : { id, childRepliedAt: null },
        data: { lastActivityAt: now },
      });
      if (claim.count !== 1) return null;
      await tx.mbNote.updateMany({ where: { id, childRepliedAt: null }, data: { childRepliedAt: now } });
      const base = { noteId: id, authorKind: "CHILD" as const, authorChildId: child.childId };
      const created: string[] = [];
      if (reply.value.stickerKey) {
        const s = await tx.mbNoteItem.create({
          data: { ...base, kind: "STICKER", stickerKey: reply.value.stickerKey },
          select: { id: true },
        });
        created.push(s.id);
      }
      if (reply.value.body) {
        const t = await tx.mbNoteItem.create({
          data: { ...base, kind: "TEXT", body: reply.value.body, createdAt: new Date(now.getTime() + 1) },
          select: { id: true },
        });
        created.push(t.id);
      }
      return created;
    });
    if (!result) return mbError(402, MB_REPLY_LOCKED);
    await notifyChildReply({ noteId: id, itemId: result[0]!, childId: child.childId });
    return NextResponse.json({ ok: true });
  }

  if (!(await getFamilySession())) return mbError(401, "Not signed in");
  const guard = await parentApiGuard();
  if (guard.error) return guard.error;
  const parentId = guard.session.familyAccountId;
  if (!note) return mbError(404, "Not found");
  const err = decisionError(canParentWrite(await parentFacts(parentId, note.subProfileId)));
  if (err) return err;
  const text = cleanText(parsed.body.body, MB_LIMITS.parentText);
  if (!text.ok) return mbError(400, text.error);
  const limited = await writeRateLimit(`mb:parent:${parentId}`, MB_PARENT_WRITE_RULE);
  if (limited) return limited;
  await prisma.$transaction([
    prisma.mbNoteItem.create({
      data: { noteId: id, authorKind: "PARENT", authorParentId: parentId, kind: "TEXT", body: text.value },
    }),
    prisma.mbNote.update({ where: { id }, data: { lastActivityAt: new Date() } }),
  ]);
  return NextResponse.json({ ok: true });
}
