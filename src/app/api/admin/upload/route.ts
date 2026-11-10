import { requireAdminSession } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { saveUploadedFile, UploadConfigurationError, UPLOADS_UNAVAILABLE_MESSAGE } from "@/lib/upload";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const { error } = await requireAdminSession();
  if (error) return error;

  const formData = await request.formData();
  const file = formData.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  if (file.size > 15 * 1024 * 1024) {
    return NextResponse.json({ error: "Max file size is 15MB" }, { status: 400 });
  }

  try {
    const saved = await saveUploadedFile(file);
    const record = await prisma.uploadedFile.create({
      data: {
        filename: saved.filename,
        url: saved.url,
        mimeType: file.type || null,
        sizeBytes: saved.sizeBytes,
      },
    });
    return NextResponse.json(record, { status: 201 });
  } catch (e) {
    if (e instanceof UploadConfigurationError) {
      return NextResponse.json({ error: UPLOADS_UNAVAILABLE_MESSAGE }, { status: 503 });
    }
    console.error("admin upload", e);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
