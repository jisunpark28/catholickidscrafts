import { put } from "@vercel/blob";
import fs from "fs/promises";
import path from "path";

export async function saveUploadedFile(
  file: File,
): Promise<{ url: string; filename: string; sizeBytes: number }> {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const unique = `${Date.now()}-${safeName}`;

  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const blob = await put(`uploads/${unique}`, buffer, {
      access: "public",
      contentType: file.type || "application/octet-stream",
    });
    return { url: blob.url, filename: safeName, sizeBytes: buffer.length };
  }

  const uploadDir = path.join(process.cwd(), "public", "uploads");
  await fs.mkdir(uploadDir, { recursive: true });
  await fs.writeFile(path.join(uploadDir, unique), buffer);
  return {
    url: `/uploads/${unique}`,
    filename: safeName,
    sizeBytes: buffer.length,
  };
}
