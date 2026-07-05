const IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);
const MAX_BYTES = 5 * 1024 * 1024;

export function validateCraftGalleryImage(file: File): { ok: true } | { ok: false; error: string } {
  if (!file.size) {
    return { ok: false, error: "Choose a photo to upload." };
  }
  if (file.size > MAX_BYTES) {
    return { ok: false, error: "Photo must be 5 MB or smaller." };
  }
  const type = file.type.toLowerCase();
  if (!IMAGE_TYPES.has(type)) {
    return { ok: false, error: "Use a JPG, PNG, WebP, or GIF image." };
  }
  return { ok: true };
}

export const CRAFT_GALLERY_AUTHOR_MAX = 40;
export const CRAFT_GALLERY_CAPTION_MAX = 200;

export function normalizeGalleryAuthorName(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed || trimmed.length > CRAFT_GALLERY_AUTHOR_MAX) return null;
  return trimmed;
}

export function normalizeGalleryCaption(value: unknown): string | null {
  if (value === undefined || value === null || value === "") return null;
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  if (trimmed.length > CRAFT_GALLERY_CAPTION_MAX) return null;
  return trimmed;
}
