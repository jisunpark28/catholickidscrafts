import { parentApiGuard } from "@/lib/family-auth";
import { linkedChildren } from "@/lib/moms-bible/access";
import { mbError, MB_PARENT_WRITE_RULE, parseId, readJsonBody, writeRateLimit } from "@/lib/moms-bible/http";
import { markImport, memoImportOffer, runMemoImport } from "@/lib/moms-bible/memo-import-server";
import { crossOriginError } from "@/lib/same-origin";
import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";

type Body = { childId?: unknown; dismiss?: unknown };

/** GET: how many of this parent's own memos can still be moved (for the /account offer). */
export async function GET() {
  const guard = await parentApiGuard();
  if (guard.error) return guard.error;
  const offer = await memoImportOffer(guard.session.familyAccountId, { force: true });
  return NextResponse.json({ count: offer?.count ?? 0 });
}

/**
 * POST { childId }: copy the parent's own memos into one of their children's Bibles (allowed
 * without Plus; originals are untouched; idempotent per memo). POST { dismiss: true }: "Not now".
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

  if (b.dismiss === true) {
    await markImport(parentId, "dismissed");
    return NextResponse.json({ ok: true });
  }

  const childId = parseId(b.childId);
  if (!childId) return mbError(400, "Pick a child");
  const limited = await writeRateLimit(`mb:parent:${parentId}`, MB_PARENT_WRITE_RULE);
  if (limited) return limited;
  // Only a child this parent is linked to (their own or a co-parent link).
  const linked = (await linkedChildren(parentId)).some((c) => c.id === childId);
  if (!linked) return mbError(404, "Not found");

  try {
    const { imported } = await runMemoImport(parentId, childId);
    return NextResponse.json({ ok: true, imported });
  } catch (e) {
    // Two imports at once: the unique memo id stops duplicates; ask to try again.
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      return mbError(409, "Your notes are already being moved. Please refresh in a moment.");
    }
    throw e;
  }
}
