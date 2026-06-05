import { requireAdminSession } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { z } from "zod";

const schema = z.object({
  word: z.string().min(1).max(64),
  hint: z.string().max(200).optional(),
  sortOrder: z.number().optional(),
  published: z.boolean().optional(),
});

export async function GET() {
  const { error } = await requireAdminSession();
  if (error) return error;

  const items = await prisma.typingWord.findMany({
    orderBy: [{ sortOrder: "asc" }, { word: "asc" }],
  });
  return NextResponse.json(items);
}

export async function POST(request: Request) {
  const { error } = await requireAdminSession();
  if (error) return error;

  const body = await request.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const data = parsed.data;
  const word = data.word.trim();

  try {
    const item = await prisma.typingWord.create({
      data: {
        word,
        hint: data.hint?.trim() ?? "",
        sortOrder: data.sortOrder ?? 0,
        published: data.published ?? true,
      },
    });
    return NextResponse.json(item, { status: 201 });
  } catch (e) {
    const code = (e as { code?: string }).code;
    if (code === "P2002") {
      return NextResponse.json({ error: `“${word}” is already in the list.` }, { status: 409 });
    }
    throw e;
  }
}
