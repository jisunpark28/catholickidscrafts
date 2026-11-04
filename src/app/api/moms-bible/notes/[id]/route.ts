import { parentApiGuard } from "@/lib/family-auth";
import { parentFacts } from "@/lib/moms-bible/access";
import { decisionError, mbError, parseId } from "@/lib/moms-bible/http";
import { canParentRemove } from "@/lib/moms-bible/rules";
import { prisma } from "@/lib/prisma";
import { crossOriginError } from "@/lib/same-origin";
import { NextResponse } from "next/server";

/** DELETE: the author removes their whole note (and its replies). No Plus needed. */
export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const bad = crossOriginError(request);
  if (bad) return bad;
  const guard = await parentApiGuard();
  if (guard.error) return guard.error;
  const parentId = guard.session.familyAccountId;
  const id = parseId((await params).id);
  if (!id) return mbError(404, "Not found");
  const note = await prisma.mbNote.findUnique({ where: { id }, select: { subProfileId: true, authorParentId: true } });
  if (!note) return mbError(404, "Not found");
  const facts = await parentFacts(parentId, note.subProfileId);
  const err = decisionError(canParentRemove({ ...facts, isAuthor: note.authorParentId === parentId }));
  if (err) return err;
  await prisma.mbNote.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
