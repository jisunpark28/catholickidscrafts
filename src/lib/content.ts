import type { LiturgicalPeriodId } from "@/lib/content-types";
import { prisma } from "@/lib/prisma";

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
    content: r.content,
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
