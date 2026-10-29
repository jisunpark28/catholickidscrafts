import { parentApiGuard } from "@/lib/family-auth";
import { deleteFamilyPhoto } from "@/lib/resource/sheet-photo-db";
import { deleteStoredSheetPhoto } from "@/lib/resource/sheet-photo";
import { familyHasPlus, plusRequiredResponse } from "@/lib/subscription/entitlements";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type Ctx = { params: Promise<{ id: string }> };

/** Delete one of the family's sheet photos (row + stored file). */
export async function DELETE(_request: Request, ctx: Ctx) {
  const guard = await parentApiGuard();
  if (guard.error) return guard.error;
  if (!(await familyHasPlus(guard.session.familyAccountId))) return plusRequiredResponse();
  const { id } = await ctx.params;
  if (!/^sp_[a-f0-9]{1,32}$/i.test(id)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  try {
    // Ownership enforced in SQL (id AND familyAccountId).
    const row = await deleteFamilyPhoto(guard.session.familyAccountId, id);
    if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });
    try {
      await deleteStoredSheetPhoto(row.url);
    } catch (e) {
      console.error("[sheet-photos] blob delete failed", e);
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[sheet-photos] delete", e);
    return NextResponse.json({ error: "Could not delete photo." }, { status: 500 });
  }
}
