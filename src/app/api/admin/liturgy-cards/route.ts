import { requireAdminSession } from "@/lib/admin-auth";
import { isLiturgyCardLink, isLiturgyTopic } from "@/lib/liturgy-topics";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { z } from "zod";

const schema = z.object({
  topic: z.string().refine(isLiturgyTopic, "Unknown topic"),
  title: z.string().trim().max(120).optional(),
  href: z.string().trim().refine(isLiturgyCardLink, "Use a site path or an http(s) URL"),
  imageUrl: z
    .string()
    .trim()
    .refine((value) => value === "" || isLiturgyCardLink(value), "Image must be a site path or an http(s) URL")
    .optional(),
  sortOrder: z.number().int().optional(),
});

export async function GET(request: Request) {
  const { error } = await requireAdminSession();
  if (error) return error;

  const topic = new URL(request.url).searchParams.get("topic");
  const items = await prisma.liturgyCard.findMany({
    where: topic && isLiturgyTopic(topic) ? { topic } : undefined,
    orderBy: [{ topic: "asc" }, { sortOrder: "asc" }, { createdAt: "asc" }],
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
  const last = await prisma.liturgyCard.aggregate({
    where: { topic: data.topic },
    _max: { sortOrder: true },
  });
  const sortOrder = data.sortOrder ?? (last._max.sortOrder ?? -1) + 1;

  const item = await prisma.liturgyCard.create({
    data: {
      topic: data.topic,
      title: data.title ?? "",
      href: data.href.trim(),
      imageUrl: data.imageUrl?.trim() ?? "",
      sortOrder,
    },
  });

  return NextResponse.json(item, { status: 201 });
}
