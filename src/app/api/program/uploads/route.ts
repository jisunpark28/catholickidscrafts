import { requireFamilySession } from "@/lib/family-auth";
import { validateLessonMediaFile } from "@/lib/lesson-kit/media-upload";
import { saveUploadedFile, UploadConfigurationError } from "@/lib/upload";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const session = await requireFamilySession();
  if (!session) {
    return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  const validation = validateLessonMediaFile(file);
  if (!validation.ok) {
    return NextResponse.json({ error: validation.error }, { status: 400 });
  }

  try {
    const saved = await saveUploadedFile(file, {
      keyPrefix: `lesson-kits/${session.familyAccountId}/`,
    });
    return NextResponse.json({
      assetUrl: saved.url,
      filename: saved.filename,
      mimeType: file.type || null,
      sizeBytes: saved.sizeBytes,
    });
  } catch (e) {
    if (e instanceof UploadConfigurationError) {
      return NextResponse.json({ error: e.message }, { status: 503 });
    }
    const message = e instanceof Error ? e.message : "Upload failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
