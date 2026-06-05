import { put } from "@vercel/blob";
import fs from "fs/promises";
import path from "path";

export class UploadConfigurationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "UploadConfigurationError";
  }
}

/** True on Vercel serverless (read-only filesystem except /tmp). */
export function isVercelServerless(): boolean {
  return Boolean(process.env.VERCEL);
}

function blobToken(): string | undefined {
  return process.env.BLOB_READ_WRITE_TOKEN?.trim() || undefined;
}

export function assertUploadConfigured(): void {
  if (isVercelServerless() && !blobToken()) {
    throw new UploadConfigurationError(
      "Admin uploads on Vercel require Vercel Blob. In the Vercel project: Storage → Create Blob → Connect to this project (sets BLOB_READ_WRITE_TOKEN), then redeploy.",
    );
  }
}

export async function saveUploadedFile(
  file: File,
): Promise<{ url: string; filename: string; sizeBytes: number }> {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const unique = `${Date.now()}-${safeName}`;

  const token = blobToken();
  if (token) {
    try {
      const blob = await put(`uploads/${unique}`, buffer, {
        access: "public",
        contentType: file.type || "application/octet-stream",
        token,
      });
      return { url: blob.url, filename: safeName, sizeBytes: buffer.length };
    } catch (e) {
      const detail = e instanceof Error ? e.message : "Blob upload failed";
      throw new UploadConfigurationError(
        `Could not save file to Vercel Blob. Check BLOB_READ_WRITE_TOKEN and that a Blob store is connected. (${detail})`,
      );
    }
  }

  if (isVercelServerless()) {
    throw new UploadConfigurationError(
      "Admin uploads on Vercel require Vercel Blob. Add BLOB_READ_WRITE_TOKEN via Storage → Blob → Connect, then redeploy.",
    );
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
