import { parentApiGuard } from "@/lib/family-auth";
import { isParentLinked } from "@/lib/moms-bible/access";
import { MB_LIMITS } from "@/lib/moms-bible/constants";
import { decisionError, mbError, MB_PARENT_WRITE_RULE, parseId, readJsonBody, writeRateLimit } from "@/lib/moms-bible/http";
import { canParentPrintPdf, cleanText } from "@/lib/moms-bible/rules";
import { prisma } from "@/lib/prisma";
import { crossOriginError } from "@/lib/same-origin";
import { resolveFamilyPlus } from "@/lib/subscription/entitlements";
import { NextResponse } from "next/server";

type Body = { childId?: unknown; dedication?: unknown; dedicationBy?: unknown };

const BY_MAX = 60;

function optionalText(raw: unknown, max: number): { ok: true; value: string | null } | { ok: false; error: string } {
  if (raw === undefined || raw === null || (typeof raw === "string" && !raw.trim())) return { ok: true, value: null };
  return cleanText(raw, max);
}

/** PUT: the PDF cover dedication for a child's Bible (linked parent with their own Plus, like printing). */
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
  const dedication = optionalText(b.dedication, MB_LIMITS.dedication);
  const dedicationBy = optionalText(b.dedicationBy, BY_MAX);
  if (!childId) return mbError(400, "Invalid request");
  if (!dedication.ok) return mbError(400, dedication.error);
  if (!dedicationBy.ok) return mbError(400, dedicationBy.error);

  const limited = await writeRateLimit(`mb:parent:${parentId}`, MB_PARENT_WRITE_RULE);
  if (limited) return limited;
  const linked = await isParentLinked(parentId, childId);
  const err = decisionError(
    canParentPrintPdf({ linked, ownPlus: linked ? (await resolveFamilyPlus(parentId)).isPlus : false }),
  );
  if (err) return err;

  await prisma.mbBook.upsert({
    where: { subProfileId: childId },
    create: { subProfileId: childId, dedication: dedication.value, dedicationBy: dedicationBy.value },
    update: { dedication: dedication.value, dedicationBy: dedicationBy.value },
  });
  return NextResponse.json({ ok: true });
}
