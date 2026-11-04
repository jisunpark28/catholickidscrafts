import { parentApiGuard } from "@/lib/family-auth";
import { mbError, parseChapterRef, parseId, readJsonBody } from "@/lib/moms-bible/http";
import { parentUnseenReplies } from "@/lib/moms-bible/queries";
import { prisma } from "@/lib/prisma";
import { crossOriginError } from "@/lib/same-origin";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/** GET: unseen child replies for the signed-in parent (banner). */
export async function GET() {
  const guard = await parentApiGuard();
  if (guard.error) return guard.error;
  return NextResponse.json(await parentUnseenReplies(guard.session.familyAccountId), {
    headers: { "Cache-Control": "no-store" },
  });
}

/**
 * POST: mark replies seen. {all: true} (dismiss banner) or {childId, book, chapters[]}
 * (the parent opened that chapter of that child's Bible). Only this parent's own rows change.
 */
export async function POST(request: Request) {
  const bad = crossOriginError(request);
  if (bad) return bad;
  const guard = await parentApiGuard();
  if (guard.error) return guard.error;
  const parentId = guard.session.familyAccountId;
  const parsed = await readJsonBody<{ all?: unknown; childId?: unknown; book?: unknown; chapters?: unknown }>(request);
  if (!parsed.ok) return parsed.res;
  const b = parsed.body;
  const now = new Date();
  if (b.all === true) {
    await prisma.mbNotification.updateMany({ where: { parentAccountId: parentId, seenAt: null }, data: { seenAt: now } });
    return NextResponse.json({ ok: true });
  }
  const childId = parseId(b.childId);
  const list = Array.isArray(b.chapters) ? b.chapters.slice(0, 4) : [];
  const refs = list.map((c) => parseChapterRef(b.book, c));
  if (!childId || refs.length === 0 || refs.some((r) => !r)) return mbError(400, "Invalid request");
  await prisma.mbNotification.updateMany({
    where: {
      parentAccountId: parentId,
      subProfileId: childId,
      seenAt: null,
      note: { bookSlug: refs[0]!.bookSlug, chapter: { in: refs.map((r) => r!.chapter) } },
    },
    data: { seenAt: now },
  });
  return NextResponse.json({ ok: true });
}
