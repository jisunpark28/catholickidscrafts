import {
  deleteAdminGlobalTemplate,
  getAdminGlobalTemplate,
  updateAdminGlobalTemplate,
} from "@/lib/lesson-kit/admin-templates";
import { requireAdminSession } from "@/lib/admin-auth";
import { NextResponse } from "next/server";
import { z } from "zod";

type Params = { params: Promise<{ id: string }> };

const patchSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(2000).optional(),
  liturgicalPeriod: z.string().max(64).nullable().optional(),
  gradeBand: z.string().max(64).nullable().optional(),
  sortOrder: z.number().int().min(0).optional(),
  published: z.boolean().optional(),
  tptUrl: z.string().url().nullable().optional().or(z.literal("")),
  isFreeSample: z.boolean().optional(),
  familyMode: z
    .object({
      gospelMaxChars: z.number().int().positive().optional(),
      includedBlockIds: z.array(z.string()).optional(),
    })
    .optional(),
});

function normalizeTptUrl(value: string | null | undefined) {
  if (value === undefined) return undefined;
  if (value == null || value === "") return null;
  return value;
}

export async function GET(_req: Request, { params }: Params) {
  const { error } = await requireAdminSession();
  if (error) return error;

  const { id } = await params;
  const kit = await getAdminGlobalTemplate(id);
  if (!kit) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ kit });
}

export async function PATCH(req: Request, { params }: Params) {
  const { error } = await requireAdminSession();
  if (error) return error;

  const { id } = await params;
  const parsed = patchSchema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const body = parsed.data;
  const kit = await updateAdminGlobalTemplate(id, {
    ...body,
    tptUrl: normalizeTptUrl(body.tptUrl),
  });
  if (!kit) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ kit });
}

export async function DELETE(_req: Request, { params }: Params) {
  const { error } = await requireAdminSession();
  if (error) return error;

  const { id } = await params;
  const ok = await deleteAdminGlobalTemplate(id);
  if (!ok) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
