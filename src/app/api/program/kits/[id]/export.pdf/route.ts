import { getFamilySession } from "@/lib/family-auth";
import { canExportLessonKitPdf, lessonKitPdfFilename } from "@/lib/lesson-kit/export-access";
import { generateLessonKitPdf } from "@/lib/lesson-kit/export-pdf";
import { getLessonKitById } from "@/lib/lesson-kit/db";
import { renderLessonKitPrintHtml } from "@/lib/lesson-kit/render-print-html";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 60;

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  const { id } = await params;
  const kit = await getLessonKitById(id);
  if (!kit) {
    return new NextResponse("Not found", { status: 404 });
  }

  const session = await getFamilySession();
  if (!canExportLessonKitPdf(kit, session)) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  try {
    const html = await renderLessonKitPrintHtml(kit);
    const pdf = await generateLessonKitPdf(html);
    const filename = lessonKitPdfFilename(kit);

    return new NextResponse(new Uint8Array(pdf), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "private, no-store",
      },
    });
  } catch (error) {
    console.error("lesson kit pdf export failed", error);
    return NextResponse.json({ error: "PDF export failed" }, { status: 500 });
  }
}
