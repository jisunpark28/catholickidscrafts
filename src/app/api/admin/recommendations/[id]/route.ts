import { requireAdminSession } from "@/lib/admin-auth";
import { isAmazonUrl } from "@/lib/external-links";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/slug";
import { ExternalLinkType, RecommendationKind } from "@prisma/client";
import { NextResponse } from "next/server";
import { z } from "zod";

const updateSchema = z.object({
  title: z.string().min(1).optional(),
  slug: z.string().optional(),
  excerpt: z.string().optional(),
  description: z.string().optional(),
  kind: z.nativeEnum(RecommendationKind).optional(),
  linkType: z.nativeEnum(ExternalLinkType).optional(),
  externalUrl: z.string().url().optional(),
  author: z.string().optional().nullable(),
  imageUrl: z.string().optional().nullable(),
  tags: z.string().optional(),
  sortOrder: z.number().optional(),
  published: z.boolean().optional(),
});

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Params) {
  const { error } = await requireAdminSession();
  if (error) return error;

  const { id } = await params;
  const body = await request.json();
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const data = parsed.data;
  if (data.slug) {
    const conflict = await prisma.recommendation.findFirst({
      where: { slug: data.slug, NOT: { id } },
    });
    if (conflict) {
      return NextResponse.json({ error: "Slug already in use" }, { status: 409 });
    }
  }

  const existing = await prisma.recommendation.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  let linkType = data.linkType ?? existing.linkType;
  if (data.linkType === undefined && data.externalUrl !== undefined && isAmazonUrl(data.externalUrl)) {
    linkType = ExternalLinkType.AMAZON_AFFILIATE;
  }

  const item = await prisma.recommendation.update({
    where: { id },
    data: {
      title: data.title,
      excerpt: data.excerpt,
      description: data.description,
      kind: data.kind,
      linkType,
      ...(data.externalUrl !== undefined ? { externalUrl: data.externalUrl } : {}),
      author: data.author,
      imageUrl: data.imageUrl,
      tags: data.tags,
      sortOrder: data.sortOrder,
      published: data.published,
      slug: data.slug ?? (data.title ? slugify(data.title) : undefined),
    },
  });

  return NextResponse.json(item);
}

export async function DELETE(_request: Request, { params }: Params) {
  const { error } = await requireAdminSession();
  if (error) return error;

  const { id } = await params;
  await prisma.recommendation.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
