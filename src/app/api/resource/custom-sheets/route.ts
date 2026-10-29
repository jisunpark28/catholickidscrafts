import { parentApiGuard } from "@/lib/family-auth";
import { parseCustomSheetData } from "@/lib/resource/custom-sheet-data";
import { createCustomSheet, listCustomSheets } from "@/lib/resource/custom-sheet-db";
import { familyHasPlus, plusRequiredResponse } from "@/lib/subscription/entitlements";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

function rowDto(row: Awaited<ReturnType<typeof listCustomSheets>>[number]) {
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

export async function GET(request: Request) {
  const guard = await parentApiGuard();
  if (guard.error) return guard.error;
  const { searchParams } = new URL(request.url);
  const baseKey = searchParams.get("baseKey")?.trim() || undefined;
  const levelRaw = searchParams.get("level");
  const level = levelRaw === "1" || levelRaw === "2" ? Number(levelRaw) : undefined;
  try {
    const rows = await listCustomSheets(guard.session.familyAccountId, { baseKey, level });
    return NextResponse.json({ sheets: rows.map(rowDto) });
  } catch (e) {
    console.error("[custom-sheets] list", e);
    return NextResponse.json({ error: "Database not ready" }, { status: 503 });
  }
}

export async function POST(request: Request) {
  const guard = await parentApiGuard();
  if (guard.error) return guard.error;
  if (!(await familyHasPlus(guard.session.familyAccountId))) return plusRequiredResponse();

  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const body = raw as { name?: unknown; data?: unknown; thumbUrl?: unknown };
  const name = typeof body.name === "string" ? body.name.trim().slice(0, 80) : "";
  if (!name) return NextResponse.json({ error: "Name is required" }, { status: 400 });
  const data = parseCustomSheetData(body.data, { familyAccountId: guard.session.familyAccountId });
  if (typeof data === "string") return NextResponse.json({ error: data }, { status: 400 });
  const thumbUrl =
    typeof body.thumbUrl === "string" && body.thumbUrl.startsWith("data:image/")
      ? body.thumbUrl.slice(0, 120_000)
      : null;

  try {
    const row = await createCustomSheet({
      familyAccountId: guard.session.familyAccountId,
      name,
      baseKey: data.base.key,
      level: data.base.level,
      baseRev: data.base.rev,
      data,
      thumbUrl,
    });
    return NextResponse.json({ sheet: rowDto(row) }, { status: 201 });
  } catch (e) {
    console.error("[custom-sheets] create", e);
    return NextResponse.json({ error: "Could not save sheet" }, { status: 500 });
  }
}
