import type { LessonBlockDto } from "@/lib/lesson-kit/types";
import { videoEmbedUrlFromLink } from "@/lib/lesson-kit/video-embed";
import type { LessonBlockType } from "@prisma/client";

const MEDIA_PRIMARY_TYPES: ReadonlySet<LessonBlockType> = new Set([
  "IMAGE",
  "SLIDES",
  "LINK",
]);

const VIDEO_MIME_PREFIX = "video/";

export function isMediaPrimaryBlock(block: LessonBlockDto): boolean {
  if (!MEDIA_PRIMARY_TYPES.has(block.type)) return false;

  if (block.type === "LINK") {
    const mime = block.config.assetMimeType?.trim() ?? "";
    if (mime.startsWith(VIDEO_MIME_PREFIX) || mime.startsWith("image/")) return true;
    if (linkVideoEmbedUrl(block)) return true;
    return false;
  }

  return true;
}

export function isClassroomHeroBlock(block: LessonBlockDto): boolean {
  return isMediaPrimaryBlock(block);
}

export function linkVideoEmbedUrl(block: LessonBlockDto): string | null {
  const href = block.config.url?.trim();
  if (!href) return null;
  return videoEmbedUrlFromLink(href);
}

export function linkUploadedVideoUrl(block: LessonBlockDto): string | null {
  const mime = block.config.assetMimeType?.trim() ?? "";
  const url = block.config.assetUrl?.trim();
  if (!url || !mime.startsWith(VIDEO_MIME_PREFIX)) return null;
  return url;
}
