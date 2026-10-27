import { parentApiGuard } from "@/lib/family-auth";
import {
  createSheetPhoto,
  getFamilyPhotoUsage,
  SheetPhotoQuotaError,
} from "@/lib/resource/sheet-photo-db";
import {
  processSheetPhoto,
  saveProcessedSheetPhoto,
  validateSheetPhotoFile,
} from "@/lib/resource/sheet-photo";
import { familyHasPlus, plusRequiredResponse } from "@/lib/subscription/entitlements";
import { UploadConfigurationError } from "@/lib/upload";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  const guard = await parentApiGuard();
  if (guard.error) return guard.error;
  if (!(await familyHasPlus(guard.session.familyAccountId))) return plusRequiredResponse();
  try {
    const usage = await getFamilyPhotoUsage(guard.session.familyAccountId);
    return NextResponse.json({ usage });
  } catch (e) {
    console.error("[sheet-photos] usage", e);
    return NextResponse.json({ error: "Database not ready" }, { status: 503 });
  }
}

export async function POST(request: Request) {
  const guard = await parentApiGuard();
  if (guard.error) return guard.error;
  if (!(await familyHasPlus(guard.session.familyAccountId))) return plusRequiredResponse();

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
  }
  const file = formData.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Choose a photo to upload." }, { status: 400 });
  }
  const validation = validateSheetPhotoFile(file);
  if (!validation.ok) {
    return NextResponse.json({ error: validation.error }, { status: 400 });
  }

  try {
    const raw = Buffer.from(await file.arrayBuffer());
    const processed = await processSheetPhoto(raw);
    const saved = await saveProcessedSheetPhoto(guard.session.familyAccountId, processed.buffer);
    const row = await createSheetPhoto({
      familyAccountId: guard.session.familyAccountId,
      url: saved.url,
      sizeBytes: saved.sizeBytes,
      width: processed.width,
      height: processed.height,
    });
    return NextResponse.json(
      {
        photo: {
          id: row.id,
          url: row.url,
          width: row.width,
          height: row.height,
          sizeBytes: row.sizeBytes,
        },
      },
      { status: 201 },
    );
  } catch (e) {
    if (e instanceof SheetPhotoQuotaError) {
      return NextResponse.json({ error: e.message }, { status: 429 });
    }
    if (e instanceof UploadConfigurationError) {
      return NextResponse.json({ error: e.message }, { status: 503 });
    }
    console.error("[sheet-photos] upload", e);
    return NextResponse.json({ error: "Could not upload photo." }, { status: 500 });
  }
}
