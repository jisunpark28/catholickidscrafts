import {
  createAdminGlobalTemplate,
  listAdminGlobalTemplates,
} from "@/lib/lesson-kit/admin-templates";
import { requireAdminSession } from "@/lib/admin-auth";
import { NextResponse } from "next/server";
import { z } from "zod";

const createSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
  liturgicalPeriod: z.string().max(64).nullable().optional(),
  gradeBand: z.string().max(64).nullable().optional(),
  sortOrder: z.number().int().min(0).optional(),
  published: z.boolean().optional(),
  tptUrl: z.string().url().nullable().optional().or(z.literal("")),
  isFreeSample: z.boolean().optional(),
});

function normalizeTptUrl(value: string | null | undefined) {
  if (value == null || value === "") return null;
  return value;
}

export async function GET() {
  const { error } = await requireAdminSession();
  if (error) return error;

  const templates = await listAdminGlobalTemplates();
  return NextResponse.json({ templates });
}

export async function POST(request: Request) {
  const { error } = await requireAdminSession();
  if (error) return error;

  const parsed = createSchema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const data = parsed.data;
  const kit = await createAdminGlobalTemplate({
    title: data.title,
    description: data.description,
    liturgicalPeriod: data.liturgicalPeriod,
    gradeBand: data.gradeBand,
    sortOrder: data.sortOrder,
    published: data.published,
    tptUrl: normalizeTptUrl(data.tptUrl),
    isFreeSample: data.isFreeSample,
  });

  return NextResponse.json({ kit }, { status: 201 });
}
