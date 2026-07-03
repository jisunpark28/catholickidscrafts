import { getLessonKitByShareSlug } from "@/lib/lesson-kit/db";
import { NextResponse } from "next/server";

type Params = { params: Promise<{ shareSlug: string }> };

export async function GET(_req: Request, { params }: Params) {
  const { shareSlug } = await params;
  const kit = await getLessonKitByShareSlug(shareSlug);
  if (!kit) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (!kit.published && kit.scope === "GLOBAL_TEMPLATE") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ kit });
}
