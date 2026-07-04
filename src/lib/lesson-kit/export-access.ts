import { slugify } from "@/lib/slug";
import type { LessonKitDto } from "@/lib/lesson-kit/types";

type FamilySession = { familyAccountId: string } | null;

export function lessonKitPdfExportUrl(kitId: string): string {
  return `/api/program/kits/${kitId}/export.pdf`;
}

/** Owner, or any visitor when the kit is a published global template. */
export function canExportLessonKitPdf(kit: LessonKitDto, session: FamilySession): boolean {
  if (session?.familyAccountId && kit.familyAccountId === session.familyAccountId) {
    return true;
  }
  if (kit.published && kit.scope === "GLOBAL_TEMPLATE") {
    return true;
  }
  return false;
}

export function lessonKitPdfFilename(kit: LessonKitDto): string {
  const base = slugify(kit.title) || kit.shareSlug || "lesson";
  return `${base}.pdf`;
}
