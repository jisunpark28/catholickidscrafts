import type { LessonBlockDto } from "@/lib/lesson-kit/types";

export type LessonImageSource = "upload" | "url";

export type LessonImageUrlValidation =
  | { valid: true; url: string }
  | { valid: false; error: string };

export function lessonImageSource(block: LessonBlockDto): LessonImageSource {
  return block.config.imageSource === "url" ? "url" : "upload";
}

export function lessonImageSrc(block: LessonBlockDto): string | null {
  const raw = block.config.imageUrl?.trim() || block.config.assetUrl?.trim();
  if (!raw) return null;
  if (lessonImageSource(block) === "url") {
    const result = validateLessonImageUrl(raw);
    return result.valid ? result.url : null;
  }
  return raw;
}

export function lessonImageAlt(block: LessonBlockDto): string {
  const alt = block.config.alt?.trim();
  if (alt) return alt;
  const label = block.label?.trim();
  if (label) return label;
  return "Lesson image";
}

export function lessonImageCaption(block: LessonBlockDto): string | null {
  const caption = block.config.caption?.trim();
  return caption || null;
}

export function validateLessonImageUrl(raw: string): LessonImageUrlValidation {
  const trimmed = raw.trim();
  if (!trimmed) {
    return { valid: false, error: "Image URL is required" };
  }

  try {
    const parsed = new URL(trimmed.startsWith("//") ? `https:${trimmed}` : trimmed);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return { valid: false, error: "Use http or https image links" };
    }
    return { valid: true, url: parsed.href };
  } catch {
    return { valid: false, error: "Enter a valid image URL" };
  }
}
