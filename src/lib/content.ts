import type { LiturgicalPeriodId } from "@/lib/content-types";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

export type {
  CurriculumTrack,
  LiturgicalPeriod,
  LiturgicalPeriodId,
  ResourcePost,
} from "@/lib/content-types";

export {
  LITURGICAL_PERIODS,
  getLiturgicalPeriod,
} from "@/lib/content-types";

import type { CurriculumTrack, ResourcePost } from "@/lib/content-types";

function mapResource(r: {
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  grade: string;
  topic: string;
  liturgicalPeriod: string;
  downloadLabel: string | null;
  downloadUrl: string | null;
  tptUrl: string | null;
  isFreeSample: boolean;
  previewImageUrl: string | null;
  contentFormat: string;
  updatedAt: Date;
}): ResourcePost {
  return {
    slug: r.slug,
    title: r.title,
    excerpt: r.excerpt,
    date: r.updatedAt.toISOString().slice(0, 10),
    grade: r.grade,
    topic: r.topic,
    liturgicalPeriod: r.liturgicalPeriod as ResourcePost["liturgicalPeriod"],
    downloadLabel: r.downloadLabel ?? undefined,
    downloadUrl: r.downloadUrl ?? undefined,
    tptUrl: r.tptUrl ?? undefined,
    isFreeSample: r.isFreeSample,
    previewImageUrl: r.previewImageUrl ?? undefined,
    content: r.content,
    contentFormat: r.contentFormat,
  };
}

function mapTrack(t: {
  slug: string;
  stage: string;
  title: string;
  description: string;
  lessonCount: number;
}): CurriculumTrack {
  return {
    slug: t.slug,
    stage: t.stage,
    title: t.title,
    description: t.description,
    lessonCount: t.lessonCount,
  };
}

export async function getCurriculumTracks(): Promise<CurriculumTrack[]> {
  const rows = await prisma.curriculumTrack.findMany({
    where: { published: true },
    orderBy: { sortOrder: "asc" },
  });
  return rows.map(mapTrack);
}

export async function getCurriculumTrack(
  slug: string,
): Promise<CurriculumTrack | undefined> {
  const row = await prisma.curriculumTrack.findFirst({
    where: { slug, published: true },
  });
  return row ? mapTrack(row) : undefined;
}

export async function getAllResources(): Promise<ResourcePost[]> {
  const rows = await prisma.resource.findMany({
    where: { published: true },
    orderBy: { updatedAt: "desc" },
  });
  return rows.map(mapResource);
}

export async function searchPublishedResources(options: {
  q?: string;
  period?: LiturgicalPeriodId;
}): Promise<ResourcePost[]> {
  const where: Prisma.ResourceWhereInput = { published: true };

  if (options.period) {
    where.liturgicalPeriod = options.period;
  }

  const query = options.q?.trim();
  if (query) {
    where.OR = [
      { title: { contains: query, mode: "insensitive" } },
      { excerpt: { contains: query, mode: "insensitive" } },
      { content: { contains: query, mode: "insensitive" } },
      { grade: { contains: query, mode: "insensitive" } },
      { topic: { contains: query, mode: "insensitive" } },
    ];
  }

  const rows = await prisma.resource.findMany({
    where,
    orderBy: { updatedAt: "desc" },
  });
  return rows.map(mapResource);
}

export async function getResourceBySlug(
  slug: string,
): Promise<ResourcePost | null> {
  const row = await prisma.resource.findFirst({
    where: { slug, published: true },
  });
  return row ? mapResource(row) : null;
}

export async function getAllResourceSlugs(): Promise<string[]> {
  const rows = await prisma.resource.findMany({
    where: { published: true },
    select: { slug: true },
  });
  return rows.map((r) => r.slug);
}

export async function getResourcesByPeriod(
  periodId: LiturgicalPeriodId,
): Promise<ResourcePost[]> {
  const rows = await prisma.resource.findMany({
    where: { published: true, liturgicalPeriod: periodId },
    orderBy: { updatedAt: "desc" },
  });
  return rows.map(mapResource);
}

export async function getResourcesByGrade(grade: string): Promise<ResourcePost[]> {
  const rows = await prisma.resource.findMany({
    where: { published: true, grade },
    orderBy: { updatedAt: "desc" },
  });
  return rows.map(mapResource);
}
