/**
 * Browser-side downscale before upload: phone photos are often 5–12 MB, but Vercel functions
 * reject request bodies over 4.5 MB. The server still re-encodes with sharp (EXIF stripped).
 */
export const CLIENT_PHOTO_MAX_EDGE = 2400;
export const CLIENT_PHOTO_TARGET_BYTES = 3.8 * 1024 * 1024;

function canvasToBlob(canvas: HTMLCanvasElement, type: string, quality: number): Promise<Blob | null> {
  return new Promise((resolve) => canvas.toBlob((b) => resolve(b), type, quality));
}

async function decode(file: File): Promise<ImageBitmap | HTMLImageElement> {
  if (typeof createImageBitmap === "function") {
    try {
      return await createImageBitmap(file, { imageOrientation: "from-image" });
    } catch {
      /* fall through (older Safari) */
    }
  }
  const url = URL.createObjectURL(file);
  try {
    const img = new Image();
    img.decoding = "async";
    img.src = url;
    await img.decode();
    return img;
  } finally {
    URL.revokeObjectURL(url);
  }
}

/** Returns a File ≤ ~3.8 MB (WebP, or JPEG where WebP encode is unsupported). */
export async function prepareSheetPhotoUpload(file: File): Promise<File> {
  const small = file.size <= CLIENT_PHOTO_TARGET_BYTES;
  const src = await decode(file);
  const w0 = "naturalWidth" in src ? src.naturalWidth : src.width;
  const h0 = "naturalHeight" in src ? src.naturalHeight : src.height;
  if (small && Math.max(w0, h0) <= CLIENT_PHOTO_MAX_EDGE) {
    if ("close" in src) src.close();
    return file;
  }
  let edge = Math.min(CLIENT_PHOTO_MAX_EDGE, Math.max(w0, h0));
  let quality = 0.88;
  try {
    for (let attempt = 0; attempt < 6; attempt++) {
      const scale = edge / Math.max(w0, h0);
      const w = Math.max(1, Math.round(w0 * scale));
      const h = Math.max(1, Math.round(h0 * scale));
      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d");
      if (!ctx) break;
      ctx.drawImage(src, 0, 0, w, h);
      let blob = await canvasToBlob(canvas, "image/webp", quality);
      let type = "image/webp";
      if (!blob || blob.type !== "image/webp") {
        blob = await canvasToBlob(canvas, "image/jpeg", quality);
        type = "image/jpeg";
      }
      if (blob && blob.size <= CLIENT_PHOTO_TARGET_BYTES) {
        const base = file.name.replace(/\.[^.]+$/, "") || "photo";
        return new File([blob], `${base}.${type === "image/webp" ? "webp" : "jpg"}`, { type });
      }
      quality = Math.max(0.6, quality - 0.08);
      edge = Math.round(edge * 0.85);
    }
  } finally {
    if ("close" in src) src.close();
  }
  throw new Error("This photo is too large. Try a smaller photo.");
}
