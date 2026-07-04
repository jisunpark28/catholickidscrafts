/** Max upload size for teacher lesson media (10 MB). */
export const LESSON_MEDIA_MAX_BYTES = 10 * 1024 * 1024;

const PPT_MIMES = new Set([
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "application/vnd.ms-powerpoint.presentation.macroenabled.12",
]);

const ALLOWED_EXTENSIONS = new Set([
  "pdf",
  "ppt",
  "pptx",
  "png",
  "jpg",
  "jpeg",
  "gif",
  "webp",
  "svg",
  "bmp",
  "heic",
  "heif",
]);

export type LessonMediaValidation =
  | { ok: true }
  | { ok: false; error: string };

export function lessonMediaExtension(filename: string): string | null {
  const parts = filename.trim().toLowerCase().split(".");
  if (parts.length < 2) return null;
  return parts.pop() ?? null;
}

export function isAllowedLessonMediaMime(mime: string): boolean {
  const type = mime.trim().toLowerCase();
  if (!type) return false;
  if (type.startsWith("image/")) return true;
  if (type === "application/pdf") return true;
  if (PPT_MIMES.has(type)) return true;
  if (type.includes("powerpoint") || type.includes("presentation")) return true;
  return false;
}

export function isAllowedLessonMediaFile(file: File): boolean {
  const mime = file.type?.trim() ?? "";
  if (mime && isAllowedLessonMediaMime(mime)) return true;

  const ext = lessonMediaExtension(file.name);
  if (ext && ALLOWED_EXTENSIONS.has(ext)) return true;

  return false;
}

export function validateLessonMediaFile(file: File): LessonMediaValidation {
  if (!(file instanceof File)) {
    return { ok: false, error: "No file provided" };
  }
  if (file.size <= 0) {
    return { ok: false, error: "File is empty" };
  }
  if (file.size > LESSON_MEDIA_MAX_BYTES) {
    return { ok: false, error: "Max file size is 10MB" };
  }
  if (!isAllowedLessonMediaFile(file)) {
    return {
      ok: false,
      error: "Allowed: images, PDF, and PowerPoint (.ppt, .pptx)",
    };
  }
  return { ok: true };
}

export function formatLessonMediaSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
