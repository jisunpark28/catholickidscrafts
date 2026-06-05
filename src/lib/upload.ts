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

function blobReadWriteToken(): string | undefined {
  return process.env.BLOB_READ_WRITE_TOKEN?.trim() || undefined;
}

/** Blob store linked to the Vercel project (OIDC or legacy token). */
export function isVercelBlobLinked(): boolean {
  return Boolean(blobReadWriteToken() || process.env.BLOB_STORE_ID?.trim());
}

export function assertUploadConfigured(): void {
  if (isVercelServerless() && !isVercelBlobLinked()) {
    throw new UploadConfigurationError(
      "Admin uploads on Vercel require a linked Blob store. Open your project → Storage → connect or create a Blob store for catholickidscrafts, then deploy again.",
    );
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
): Promise<{ url: string; filename: string; sizeBytes: number }> {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const unique = `${Date.now()}-${safeName}`;
  const key = `uploads/${unique}`;

  if (isVercelBlobLinked() || isVercelServerless()) {
    if (isVercelServerless() && !isVercelBlobLinked()) {
      throw new UploadConfigurationError(
        "Admin uploads on Vercel require a linked Blob store. In the catholickidscrafts project, open the Storage tab and connect your Blob store (or create one there), then deploy again.",
      );
    }

    try {
      const url = await uploadToVercelBlob(key, buffer, file.type || "application/octet-stream");
      return { url, filename: safeName, sizeBytes: buffer.length };
    } catch (e) {
      const detail = e instanceof Error ? e.message : "Blob upload failed";
      throw new UploadConfigurationError(
        `Could not save file to Vercel Blob. Link a Blob store under Project → Storage and redeploy. (${detail})`,
      );
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
