import { getChildSession, mbError, parseChapterRef, readJsonBody } from "@/lib/moms-bible/http";
import { prisma } from "@/lib/prisma";
import { crossOriginError } from "@/lib/same-origin";
import { NextResponse } from "next/server";

/** POST {book, chapters[]}: the signed-in child opened these chapters (clears the new-note banner). */
export async function POST(request: Request) {
  const bad = crossOriginError(request);
  if (bad) return bad;
  const child = await getChildSession();
  if (!child) return mbError(401, "Not signed in");
  const parsed = await readJsonBody<{ book?: unknown; chapters?: unknown }>(request);
  if (!parsed.ok) return parsed.res;
  const list = Array.isArray(parsed.body.chapters) ? parsed.body.chapters.slice(0, 4) : [];
  const refs = list.map((c) => parseChapterRef(parsed.body.book, c));
  if (refs.length === 0 || refs.some((r) => !r)) return mbError(400, "Invalid chapter");
  const now = new Date();
  await prisma.$transaction(
    refs.map((r) =>
      prisma.mbChapterSeen.upsert({
        where: { subProfileId_bookSlug_chapter: { subProfileId: child.childId, bookSlug: r!.bookSlug, chapter: r!.chapter } },
        create: { subProfileId: child.childId, bookSlug: r!.bookSlug, chapter: r!.chapter, seenAt: now },
        update: { seenAt: now },
      }),
    ),
  );
  return NextResponse.json({ ok: true });
}
