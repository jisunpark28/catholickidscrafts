import { parentApiGuard } from "@/lib/family-auth";
import { mbError, parseId } from "@/lib/moms-bible/http";
import { prisma } from "@/lib/prisma";
import { crossOriginError } from "@/lib/same-origin";
import { NextResponse } from "next/server";

/**
 * DELETE: end a co-parent link. Allowed for the child's owning parent, or the co-parent
 * leaving. Owner links can't be removed. Notes already written stay in the child's Bible.
 */
export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const bad = crossOriginError(request);
  if (bad) return bad;
  const guard = await parentApiGuard();
  if (guard.error) return guard.error;
  const me = guard.session.familyAccountId;
  const id = parseId((await params).id);
  if (!id) return mbError(404, "Not found");
  const link = await prisma.parentChildLink.findUnique({
    where: { id },
    select: { isOwner: true, parentAccountId: true, child: { select: { familyAccountId: true } } },
  });
  if (!link || link.isOwner || (link.child.familyAccountId !== me && link.parentAccountId !== me)) {
    return mbError(404, "Not found");
  }
  await prisma.parentChildLink.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
