import type { LessonBlockDto } from "@/lib/lesson-kit/types";

export type LessonLinkValidation =
  | { valid: true; url: string }
  | { valid: false; error: string };

/** Normalize teacher input to an absolute http(s) URL. */
export function normalizeLessonLinkUrl(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return "";
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

export function validateLessonLinkUrl(raw: string): LessonLinkValidation {
  const normalized = normalizeLessonLinkUrl(raw);
  if (!normalized) {
    return { valid: false, error: "URL is required" };
  }

  try {
    const parsed = new URL(normalized);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return { valid: false, error: "Use http or https links only" };
    }
    return { valid: true, url: parsed.href };
  } catch {
    return { valid: false, error: "Enter a valid URL" };
  }
}

export function lessonLinkHref(block: LessonBlockDto): string | null {
  const raw = block.config.url?.trim();
  if (!raw) return null;
  const result = validateLessonLinkUrl(raw);
  return result.valid ? result.url : null;
}

export function lessonLinkButtonLabel(block: LessonBlockDto): string {
  const fromConfig = block.config.buttonLabel?.trim();
  if (fromConfig) return fromConfig;
  const fromLabel = block.label?.trim();
  if (fromLabel) return fromLabel;
  return "Open link";
}

export function lessonLinkOpensInNewTab(block: LessonBlockDto): boolean {
  return block.config.openInNewTab !== false;
}
