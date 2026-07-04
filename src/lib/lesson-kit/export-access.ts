import { slugify } from "@/lib/slug";
import type { LessonKitDto } from "@/lib/lesson-kit/types";

type FamilySession = { familyAccountId: string } | null;

export function lessonKitPdfExportUrl(kitId: string): string {
  return `/api/program/kits/${kitId}/export.pdf`;
}

export function lessonKitDocxExportUrl(kitId: string): string {
  return `/api/program/kits/${kitId}/export.docx`;
}

/** Owner, or any visitor when the kit is a published global template. */
export function canExportLessonKit(kit: LessonKitDto, session: FamilySession): boolean {
  if (session?.familyAccountId && kit.familyAccountId === session.familyAccountId) {
    return true;
  }
  if (kit.published && kit.scope === "GLOBAL_TEMPLATE") {
    return true;
  }
  return false;
}

/** @deprecated Use {@link canExportLessonKit}. */
export const canExportLessonKitPdf = canExportLessonKit;

export function lessonKitExportBasename(kit: LessonKitDto): string {
  return slugify(kit.title) || kit.shareSlug || "lesson";
}

export function lessonKitPdfFilename(kit: LessonKitDto): string {
  return `${lessonKitExportBasename(kit)}.pdf`;
}

export function lessonKitDocxFilename(kit: LessonKitDto): string {
  return `${lessonKitExportBasename(kit)}.docx`;
}
