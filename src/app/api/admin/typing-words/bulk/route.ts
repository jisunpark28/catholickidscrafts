import { requireAdminSession } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { z } from "zod";

const schema = z.object({
  words: z
    .array(
      z.object({
        word: z.string().min(1).max(64),
        hint: z.string().max(200).optional(),
        published: z.boolean().optional(),
      }),
    )
    .min(1)
    .max(200),
});

export async function POST(request: Request) {
  const { error } = await requireAdminSession();
  if (error) return error;

  const body = await request.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const rows = parsed.data.words.map((row) => ({
    word: row.word.trim(),
    hint: row.hint?.trim() ?? "",
    sortOrder: 0,
    published: row.published ?? true,
  }));

  const uniqueByWord = new Map<string, (typeof rows)[number]>();
  for (const row of rows) {
    const key = row.word.toLowerCase();
    if (!uniqueByWord.has(key)) uniqueByWord.set(key, row);
  }
  const deduped = [...uniqueByWord.values()];

  const result = await prisma.typingWord.createMany({
    data: deduped,
    skipDuplicates: true,
  });

  return NextResponse.json({
    submitted: rows.length,
    uniqueInBatch: deduped.length,
    created: result.count,
    skipped: deduped.length - result.count,
  });
}
