import { getFamilySession } from "@/lib/family-auth";
import {
  canExportLessonKit,
  lessonKitDocxFilename,
} from "@/lib/lesson-kit/export-access";
import { generateLessonKitDocx } from "@/lib/lesson-kit/export-docx";
import { getLessonKitById } from "@/lib/lesson-kit/db";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 30;

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  const { id } = await params;
  const kit = await getLessonKitById(id);
  if (!kit) {
    return new NextResponse("Not found", { status: 404 });
  }

  const session = await getFamilySession();
  if (!canExportLessonKit(kit, session)) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  try {
    const docx = await generateLessonKitDocx(kit);
    const filename = lessonKitDocxFilename(kit);

    return new NextResponse(new Uint8Array(docx), {
      status: 200,
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "private, no-store",
      },
    });
  } catch (error) {
    console.error("lesson kit docx export failed", error);
    return NextResponse.json({ error: "Word export failed" }, { status: 500 });
  }
}
