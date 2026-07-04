import type { LessonBlockDto } from "@/lib/lesson-kit/types";

export type LessonSlidesSource = "embed" | "upload";

export type SlidesEmbedConversion =
  | { ok: true; embedUrl: string }
  | { ok: false; error: string };

const GOOGLE_FILE_ID_RE =
  /(?:drive\.google\.com\/(?:file\/d\/|open\?id=)|docs\.google\.com\/presentation\/d\/)([\w-]+)/i;

/** Convert a Google Drive / Slides share link to an embeddable preview URL. */
export function googleSlidesShareToEmbedUrl(raw: string): SlidesEmbedConversion {
  const trimmed = raw.trim();
  if (!trimmed) {
    return { ok: false, error: "Paste a Google Slides or Drive share link" };
  }

  if (/\/embed|\/preview/i.test(trimmed)) {
    try {
      const parsed = new URL(trimmed.startsWith("//") ? `https:${trimmed}` : trimmed);
      if (parsed.protocol === "http:" || parsed.protocol === "https:") {
        return { ok: true, embedUrl: parsed.href };
      }
    } catch {
      return { ok: false, error: "Enter a valid embed or share URL" };
    }
  }

  let url: URL;
  try {
    url = new URL(trimmed.startsWith("//") ? `https:${trimmed}` : trimmed);
  } catch {
    return { ok: false, error: "Enter a valid URL" };
  }

  if (!url.hostname.includes("google.com")) {
    return { ok: false, error: "Use a Google Drive or Google Slides link" };
  }

  const match = trimmed.match(GOOGLE_FILE_ID_RE);
  const fileId = match?.[1];
  if (!fileId) {
    return { ok: false, error: "Could not read the file ID from this Google link" };
  }

  if (url.hostname.includes("docs.google.com") && url.pathname.includes("/presentation/")) {
    return {
      ok: true,
      embedUrl: `https://docs.google.com/presentation/d/${fileId}/embed?start=false&loop=false&delayms=3000`,
    };
  }

  return { ok: true, embedUrl: `https://drive.google.com/file/d/${fileId}/preview` };
}

export function lessonSlidesSource(block: LessonBlockDto): LessonSlidesSource {
  return block.config.slidesSource === "upload" ? "upload" : "embed";
}

export function lessonSlidesEmbedSrc(block: LessonBlockDto): string | null {
  if (lessonSlidesSource(block) !== "embed") return null;
  const raw = block.config.embedUrl?.trim();
  if (!raw) return null;
  const result = googleSlidesShareToEmbedUrl(raw);
  return result.ok ? result.embedUrl : null;
}

export function lessonSlidesAssetUrl(block: LessonBlockDto): string | null {
  if (lessonSlidesSource(block) !== "upload") return null;
  const url = block.config.assetUrl?.trim();
  return url || null;
}

export function lessonSlidesAssetIsPdf(block: LessonBlockDto): boolean {
  const mime = block.config.assetMimeType?.toLowerCase() ?? "";
  if (mime === "application/pdf") return true;
  const name = block.config.assetFilename?.toLowerCase() ?? block.config.assetUrl?.toLowerCase() ?? "";
  return name.endsWith(".pdf");
}

export function lessonSlidesAssetIsPptx(block: LessonBlockDto): boolean {
  const mime = block.config.assetMimeType?.toLowerCase() ?? "";
  if (mime.includes("presentation") || mime.includes("powerpoint")) return true;
  const name = block.config.assetFilename?.toLowerCase() ?? block.config.assetUrl?.toLowerCase() ?? "";
  return name.endsWith(".ppt") || name.endsWith(".pptx");
}

export function lessonSlidesOpenLabel(block: LessonBlockDto): string {
  return block.config.buttonLabel?.trim() || block.label?.trim() || "Open slides";
}

export function lessonSlidesConfigured(block: LessonBlockDto): boolean {
  return Boolean(lessonSlidesEmbedSrc(block) || lessonSlidesAssetUrl(block));
}
