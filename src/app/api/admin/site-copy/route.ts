import { requireAdminSession } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { invalidateSiteCopyCache } from "@/lib/site-copy";
import {
  SITE_COPY_VALUE_MAX,
  listSiteCopyForAdmin,
  siteCopyDefaultsByKey,
} from "@/lib/site-copy-admin-data";
import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { z } from "zod";

export const dynamic = "force-dynamic";

const keySchema = z
  .string()
  .min(1)
  .max(200)
  .regex(/^[A-Za-z0-9_.-]+$/, "Invalid key");

const upsertSchema = z.object({
  key: keySchema,
  value: z.string().max(SITE_COPY_VALUE_MAX, `Value must be at most ${SITE_COPY_VALUE_MAX} characters`),
  published: z.boolean().optional(),
});

/** Defense in depth against cross-site writes: a browser Origin must match this host. */
function crossOriginError(request: Request): NextResponse | null {
  const origin = request.headers.get("origin");
  if (!origin) return null;
  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  try {
    if (host && new URL(origin).host === host) return null;
  } catch {
    // fall through
  }
  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}

/** Admin saves show up at once: drop the cached SiteCopy rows and every cached page. */
function bustSiteCopyCache() {
  invalidateSiteCopyCache(); // revalidateTag(SITE_COPY_TAG)
  revalidatePath("/", "layout");
}

function noStore(body: unknown, init?: ResponseInit) {
  const res = NextResponse.json(body, init);
  res.headers.set("Cache-Control", "no-store");
  return res;
}

export async function GET() {
  const { error } = await requireAdminSession();
  if (error) return error;

  const rows = await listSiteCopyForAdmin();
  return noStore({ rows });
}

/** Upsert one key. The key must exist in the built-in defaults or already in the DB. */
export async function PUT(request: Request) {
  const { error } = await requireAdminSession();
  if (error) return error;
  const originError = crossOriginError(request);
  if (originError) return originError;

  const body = await request.json().catch(() => null);
  const parsed = upsertSchema.safeParse(body);
  if (!parsed.success) {
    return noStore(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 },
    );
  }
  const { key, value, published } = parsed.data;
  if (!value.trim()) {
    return noStore({ error: "Value cannot be empty. Use Reset to restore the default." }, { status: 400 });
  }

  const def = siteCopyDefaultsByKey().get(key);
  const existing = await prisma.siteCopy.findUnique({ where: { key } });
  if (!def && !existing) {
    return noStore({ error: "Unknown key" }, { status: 400 });
  }

  const row = await prisma.siteCopy.upsert({
    where: { key },
    update: { value, ...(published === undefined ? {} : { published }) },
    create: {
      key,
      value,
      group: def?.group ?? "other",
      hint: def?.hint ?? null,
      format: def?.format ?? "plain",
      published: published ?? true,
    },
  });

  bustSiteCopyCache();
  return noStore({
    key: row.key,
    dbValue: row.value,
    published: row.published,
    updatedAt: row.updatedAt.toISOString(),
  });
}

/** Reset to default: removes the DB override. Only allowed for keys that have a built-in default. */
export async function DELETE(request: Request) {
  const { error } = await requireAdminSession();
  if (error) return error;
  const originError = crossOriginError(request);
  if (originError) return originError;

  const parsedKey = keySchema.safeParse(new URL(request.url).searchParams.get("key"));
  if (!parsedKey.success) {
    return noStore({ error: "Invalid key" }, { status: 400 });
  }
  const key = parsedKey.data;
  if (!siteCopyDefaultsByKey().has(key)) {
    return noStore({ error: "This key has no built-in default, so it cannot be reset." }, { status: 400 });
  }

  await prisma.siteCopy.deleteMany({ where: { key } });
  bustSiteCopyCache();
  return noStore({ key, reset: true });
}
