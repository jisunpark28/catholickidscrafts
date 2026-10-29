import sharp from "sharp";
import { del, put } from "@vercel/blob";
import fs from "fs/promises";
import path from "path";
import { isVercelBlobLinked, isVercelServerless, UploadConfigurationError } from "@/lib/upload";

/**
 * Vercel functions reject request bodies over 4.5 MB, so the editor downsizes photos in the
 * browser first; keep the server cap just under that limit.
 */
export const SHEET_PHOTO_MAX_BYTES = 4 * 1024 * 1024;
export const SHEET_PHOTO_MAX_EDGE = 2400;
export const SHEET_PHOTO_FAMILY_QUOTA_BYTES = 200 * 1024 * 1024;
export const SHEET_PHOTO_DAILY_LIMIT = 30;
export const SHEET_PHOTO_ALLOWED = new Set(["image/jpeg", "image/png", "image/webp"]);

export function validateSheetPhotoFile(file: File): { ok: true } | { ok: false; error: string } {
  if (!file.size) return { ok: false, error: "Choose a photo to upload." };
  if (file.size > SHEET_PHOTO_MAX_BYTES) {
    return { ok: false, error: "Photo must be 4 MB or smaller after resizing." };
  }
  const type = file.type.toLowerCase();
  if (!SHEET_PHOTO_ALLOWED.has(type)) {
    return { ok: false, error: "Use a JPG, PNG, or WebP image." };
  }
  return { ok: true };
}

/** Resize longest edge ≤ 2400px, strip EXIF/metadata, output WebP. */
export async function processSheetPhoto(buffer: Buffer): Promise<{ buffer: Buffer; width: number; height: number }> {
  const image = sharp(buffer, { failOn: "none" }).rotate(); // honor orientation then strip
  const meta = await image.metadata();
  const w = meta.width ?? 0;
  const h = meta.height ?? 0;
  const longest = Math.max(w, h);
  let pipeline = image;
  if (longest > SHEET_PHOTO_MAX_EDGE) {
    pipeline = pipeline.resize({
      width: w >= h ? SHEET_PHOTO_MAX_EDGE : undefined,
      height: h > w ? SHEET_PHOTO_MAX_EDGE : undefined,
      fit: "inside",
      withoutEnlargement: true,
    });
  }
  // Default sharp output strips EXIF/GPS; do not call withMetadata().
  const out = await pipeline.webp({ quality: 82 }).toBuffer({ resolveWithObject: true });
  return {
    buffer: out.data,
    width: out.info.width,
    height: out.info.height,
  };
}

async function storeProcessed(
  key: string,
  buffer: Buffer,
): Promise<string> {
  if (isVercelBlobLinked() || isVercelServerless()) {
    if (isVercelServerless() && !isVercelBlobLinked()) {
      throw new UploadConfigurationError(
        "Photo uploads on Vercel require a linked Blob store. Open Project → Storage and connect Blob, then redeploy.",
      );
    }
    const token = process.env.BLOB_READ_WRITE_TOKEN?.trim() || undefined;
    try {
      const blob = await put(key, buffer, {
        access: "public",
        contentType: "image/webp",
        ...(token ? { token } : {}),
      });
      return blob.url;
    } catch (e) {
      const detail = e instanceof Error ? e.message : "Blob upload failed";
      throw new UploadConfigurationError(`Could not save photo to Blob. (${detail})`);
    }
  }

  // Local dev: keep the family folder so URLs can be ownership-checked like Blob keys.
  const [, familyDir, filename] = key.split("/");
  const uploadDir = path.join(process.cwd(), "public", "uploads", "sheet-photos", familyDir!);
  await fs.mkdir(uploadDir, { recursive: true });
  await fs.writeFile(path.join(uploadDir, filename!), buffer);
  return `/uploads/sheet-photos/${familyDir}/${filename}`;
}

/** Remove a stored photo file (Blob or local dev). Best-effort: DB row is the source of truth. */
export async function deleteStoredSheetPhoto(url: string): Promise<void> {
  if (url.startsWith("/uploads/sheet-photos/")) {
    const rel = url.slice("/uploads/".length);
    if (rel.includes("..")) return;
    const file = path.join(process.cwd(), "public", "uploads", rel);
    await fs.unlink(file).catch(() => undefined);
    return;
  }
  if (!/^https:\/\/[a-z0-9-]+\.public\.blob\.vercel-storage\.com\/sheet-photos\//i.test(url)) return;
  const token = process.env.BLOB_READ_WRITE_TOKEN?.trim() || undefined;
  await del(url, token ? { token } : undefined);
}

export async function saveProcessedSheetPhoto(
  familyAccountId: string,
  processed: Buffer,
): Promise<{ url: string; sizeBytes: number }> {
  const unique = `${Date.now()}-${crypto.randomUUID().replace(/-/g, "").slice(0, 12)}.webp`;
  // Unpredictable path (family id + random) — no directory listing of other families
  const key = `sheet-photos/${familyAccountId}/${unique}`;
  const url = await storeProcessed(key, processed);
  return { url, sizeBytes: processed.length };
}
