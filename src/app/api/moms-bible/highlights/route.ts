import { randomUUID } from "node:crypto";
import { isSituationKey } from "@/data/moms-bible/situations";
import { parentApiGuard } from "@/lib/family-auth";
import { linkedChildren, parentFacts } from "@/lib/moms-bible/access";
import {
  decisionError,
  mbError,
  MB_PARENT_WRITE_RULE,
  parseChapterRef,
  parseId,
  readJsonBody,
  writeRateLimit,
} from "@/lib/moms-bible/http";
import { canParentRemove, canParentWrite, parseColor, siblingTargets } from "@/lib/moms-bible/rules";
import { prisma } from "@/lib/prisma";
import { crossOriginError } from "@/lib/same-origin";
import { NextResponse } from "next/server";

type Body = {
  childId?: unknown;
  book?: unknown;
  chapter?: unknown;
  verse?: unknown;
  color?: unknown;
  star?: unknown;
  underline?: unknown;
  situationKey?: unknown;
  alsoChildIds?: unknown;
};

/**
 * PUT: set this parent's mark on one verse in a child's Bible (colour / star / underline).
 * All three off = remove the mark (allowed without Plus). Optional "also send to" siblings.
 */
export async function PUT(request: Request) {
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
  const verse = Number(b.verse);
  const color = parseColor(b.color);
  if (!childId || !ref || !Number.isInteger(verse) || verse < 1 || verse > ref.verseCount || !color.ok) {
    return mbError(400, "Invalid highlight");
  }
  if ((b.star !== undefined && typeof b.star !== "boolean") || (b.underline !== undefined && typeof b.underline !== "boolean")) {
    return mbError(400, "Invalid highlight");
  }
  const star = b.star === true;
  const underline = b.underline === true;
  const situationKey = isSituationKey(b.situationKey) ? b.situationKey : null;

  const limited = await writeRateLimit(`mb:parent:${parentId}`, MB_PARENT_WRITE_RULE);
  if (limited) return limited;

  const linkedIds = new Set((await linkedChildren(parentId)).map((c) => c.id));
  const targets = siblingTargets(childId, b.alsoChildIds, linkedIds);
  if (!targets) return mbError(400, "Invalid children");

  const clearing = color.value === null && !star && !underline;
  for (const target of targets) {
    const facts = await parentFacts(parentId, target);
    const err = decisionError(clearing ? canParentRemove({ ...facts, isAuthor: true }) : canParentWrite(facts));
    if (err) return err;
  }

  const where = { bookSlug: ref.bookSlug, chapter: ref.chapter, verse, authorParentId: parentId };
  if (clearing) {
    await prisma.mbHighlight.deleteMany({ where: { ...where, subProfileId: { in: targets } } });
    return NextResponse.json({ ok: true });
  }
  const batchId = targets.length > 1 ? randomUUID() : null;
  await prisma.$transaction(
    targets.map((subProfileId) =>
      prisma.mbHighlight.upsert({
        where: {
          subProfileId_authorParentId_bookSlug_chapter_verse: { subProfileId, ...where },
        },
        create: { subProfileId, ...where, color: color.value, star, underline, situationKey, batchId },
        update: { color: color.value, star, underline, ...(situationKey ? { situationKey } : {}) },
      }),
    ),
  );
  return NextResponse.json({ ok: true });
}
