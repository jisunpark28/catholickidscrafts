import { put } from "@vercel/blob";
import fs from "fs/promises";
import path from "path";

export const UPLOADS_UNAVAILABLE_MESSAGE = "Uploads are temporarily unavailable";

export class UploadConfigurationError extends Error {
  constructor(message: string = UPLOADS_UNAVAILABLE_MESSAGE) {
    super(message);
    this.name = "UploadConfigurationError";
  }
}

/** True on Vercel serverless (read-only filesystem except /tmp). */
export function isVercelServerless(): boolean {
  return Boolean(process.env.VERCEL);
}

function blobReadWriteToken(): string | undefined {
  return process.env.BLOB_READ_WRITE_TOKEN?.trim() || undefined;
}

/** Blob store linked to the Vercel project (OIDC or legacy token). */
export function isVercelBlobLinked(): boolean {
  return Boolean(blobReadWriteToken() || process.env.BLOB_STORE_ID?.trim());
}

export function assertUploadConfigured(): void {
  if (isVercelServerless() && !isVercelBlobLinked()) {
    console.error("Admin uploads on Vercel require a linked Blob store.");
    throw new UploadConfigurationError();
  }
}

async function uploadToVercelBlob(
  key: string,
  buffer: Buffer,
  contentType: string,
): Promise<string> {
  const token = blobReadWriteToken();
  const blob = await put(key, buffer, {
    access: "public",
    contentType: contentType || "application/octet-stream",
    ...(token ? { token } : {}),
  });
  return blob.url;
}

export async function saveUploadedFile(
  file: File,
  opts?: { keyPrefix?: string },
): Promise<{ url: string; filename: string; sizeBytes: number }> {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const unique = `${Date.now()}-${safeName}`;
  const prefix = opts?.keyPrefix?.replace(/\/?$/, "/") ?? "uploads/";
  const key = `${prefix}${unique}`;

  if (isVercelBlobLinked() || isVercelServerless()) {
    if (isVercelServerless() && !isVercelBlobLinked()) {
      console.error("Admin uploads on Vercel require a linked Blob store.");
      throw new UploadConfigurationError();
    }

    try {
      const url = await uploadToVercelBlob(key, buffer, file.type || "application/octet-stream");
      return { url, filename: safeName, sizeBytes: buffer.length };
    } catch (e) {
      const detail = e instanceof Error ? e.message : "Blob upload failed";
      console.error("Vercel Blob upload failed", detail);
      throw new UploadConfigurationError();
    }
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
