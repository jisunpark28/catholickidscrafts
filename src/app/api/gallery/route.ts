import { listApprovedGallerySubmissions } from "@/lib/craft-gallery";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const resourceId = searchParams.get("resourceId")?.trim() || undefined;
  const items = await listApprovedGallerySubmissions({ resourceId, limit: 60 });
  return NextResponse.json({ items });
}
