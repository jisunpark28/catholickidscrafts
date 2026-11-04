import { getFamilySession, parentApiGuard } from "@/lib/family-auth";
import { isParentLinked } from "@/lib/moms-bible/access";
import { getChildSession, mbError, parseId } from "@/lib/moms-bible/http";
import { prisma } from "@/lib/prisma";
import { crossOriginError } from "@/lib/same-origin";
import { NextResponse } from "next/server";

/** DELETE: remove your own thread entry (soft delete). Children: own replies; parents: own text. */
export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const bad = crossOriginError(request);
  if (bad) return bad;
  const id = parseId((await params).id);
  if (!id) return mbError(404, "Not found");
  const item = await prisma.mbNoteItem.findUnique({
    where: { id },
    select: { authorKind: true, authorParentId: true, authorChildId: true, deletedAt: true, note: { select: { subProfileId: true } } },
  });

  const child = await getChildSession();
  if (child) {
    if (!item || item.deletedAt || item.authorKind !== "CHILD" || item.authorChildId !== child.childId) {
      return mbError(404, "Not found");
    }
  } else {
    if (!(await getFamilySession())) return mbError(401, "Not signed in");
    const guard = await parentApiGuard();
    if (guard.error) return guard.error;
    const parentId = guard.session.familyAccountId;
    if (
      !item ||
      item.deletedAt ||
      item.authorKind !== "PARENT" ||
      item.authorParentId !== parentId ||
      !(await isParentLinked(parentId, item.note.subProfileId))
    ) {
      return mbError(404, "Not found");
    }
  }
  await prisma.mbNoteItem.update({ where: { id }, data: { deletedAt: new Date(), body: null, stickerKey: null } });
  return NextResponse.json({ ok: true });
}
