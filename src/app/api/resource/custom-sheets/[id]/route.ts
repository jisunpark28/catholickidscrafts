import { parentApiGuard } from "@/lib/family-auth";
import { parseCustomSheetData } from "@/lib/resource/custom-sheet-data";
import {
  deleteCustomSheet,
  getCustomSheet,
  updateCustomSheet,
} from "@/lib/resource/custom-sheet-db";
import { familyHasPlus, plusRequiredResponse } from "@/lib/subscription/entitlements";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

function rowDto(row: NonNullable<Awaited<ReturnType<typeof getCustomSheet>>>) {
  return {
    id: row.id,
    name: row.name,
    baseKey: row.baseKey,
    level: row.level as 1 | 2,
    baseRev: row.baseRev,
    data: row.data,
    thumbUrl: row.thumbUrl,
    updatedAt: row.updatedAt.toISOString(),
    createdAt: row.createdAt.toISOString(),
  };
}

export async function GET(_request: Request, ctx: Ctx) {
  const guard = await parentApiGuard();
  if (guard.error) return guard.error;
  const { id } = await ctx.params;
  try {
    const row = await getCustomSheet(id, guard.session.familyAccountId);
    if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ sheet: rowDto(row) });
  } catch (e) {
    console.error("[custom-sheets] get", e);
    return NextResponse.json({ error: "Database not ready" }, { status: 503 });
  }
}

export async function PATCH(request: Request, ctx: Ctx) {
  const guard = await parentApiGuard();
  if (guard.error) return guard.error;
  if (!(await familyHasPlus(guard.session.familyAccountId))) return plusRequiredResponse();
  const { id } = await ctx.params;

  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const body = raw as { name?: unknown; data?: unknown; thumbUrl?: unknown };
  const patch: Parameters<typeof updateCustomSheet>[2] = {};

  if (typeof body.name === "string") {
    const name = body.name.trim().slice(0, 80);
    if (!name) return NextResponse.json({ error: "Name is required" }, { status: 400 });
    patch.name = name;
  }
  if (body.data !== undefined) {
    const data = parseCustomSheetData(body.data, { familyAccountId: guard.session.familyAccountId });
    if (typeof data === "string") return NextResponse.json({ error: data }, { status: 400 });
    patch.data = data;
    patch.baseKey = data.base.key;
    patch.level = data.base.level;
    patch.baseRev = data.base.rev;
  }
  if (body.thumbUrl === null) patch.thumbUrl = null;
  else if (typeof body.thumbUrl === "string" && body.thumbUrl.startsWith("data:image/")) {
    patch.thumbUrl = body.thumbUrl.slice(0, 120_000);
  }

  try {
    const row = await updateCustomSheet(id, guard.session.familyAccountId, patch);
    if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ sheet: rowDto(row) });
  } catch (e) {
    console.error("[custom-sheets] patch", e);
    return NextResponse.json({ error: "Could not update sheet" }, { status: 500 });
  }
}

export async function DELETE(_request: Request, ctx: Ctx) {
  const guard = await parentApiGuard();
  if (guard.error) return guard.error;
  if (!(await familyHasPlus(guard.session.familyAccountId))) return plusRequiredResponse();
  const { id } = await ctx.params;
  try {
    const ok = await deleteCustomSheet(id, guard.session.familyAccountId);
    if (!ok) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[custom-sheets] delete", e);
    return NextResponse.json({ error: "Could not delete sheet" }, { status: 500 });
  }
}
