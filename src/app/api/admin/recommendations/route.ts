import { requireAdminSession } from "@/lib/admin-auth";
import { isAmazonUrl } from "@/lib/external-links";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/slug";
import { ExternalLinkType, RecommendationKind } from "@prisma/client";
import { NextResponse } from "next/server";
import { z } from "zod";

const schema = z.object({
  title: z.string().min(1),
  slug: z.string().optional(),
  excerpt: z.string().optional(),
  description: z.string().optional(),
  kind: z.nativeEnum(RecommendationKind).optional(),
  linkType: z.nativeEnum(ExternalLinkType).optional(),
  externalUrl: z.string().url(),
  author: z.string().optional().nullable(),
  imageUrl: z.string().optional().nullable(),
  tags: z.string().optional(),
  sortOrder: z.number().optional(),
  published: z.boolean().optional(),
});

function defaultLinkType(
  linkType: ExternalLinkType | undefined,
  externalUrl: string,
  kind: RecommendationKind,
): ExternalLinkType {
  if (linkType) return linkType;
  if (isAmazonUrl(externalUrl)) return ExternalLinkType.AMAZON_AFFILIATE;
  if (kind === "BOOK") return ExternalLinkType.STANDARD;
  return ExternalLinkType.STANDARD;
}

export async function GET() {
  const { error } = await requireAdminSession();
  if (error) return error;

  const items = await prisma.recommendation.findMany({
    orderBy: [{ sortOrder: "asc" }, { updatedAt: "desc" }],
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
  const slug = data.slug?.trim() || slugify(data.title);
  if (await prisma.recommendation.findUnique({ where: { slug } })) {
    return NextResponse.json({ error: "Slug already in use" }, { status: 409 });
  }

  const kind = data.kind ?? RecommendationKind.OTHER;
  const linkType = defaultLinkType(data.linkType, data.externalUrl, kind);

  const item = await prisma.recommendation.create({
    data: {
      slug,
      title: data.title,
      excerpt: data.excerpt ?? "",
      description: data.description ?? "",
      kind,
      linkType,
      externalUrl: data.externalUrl,
      author: data.author ?? null,
      imageUrl: data.imageUrl ?? null,
      tags: data.tags ?? "",
      sortOrder: data.sortOrder ?? 0,
      published: data.published ?? true,
    },
  });

  return NextResponse.json(item, { status: 201 });
}
