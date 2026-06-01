import { getPublishedChurchDecorations } from "@/lib/church-decorations";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const items = await getPublishedChurchDecorations();
    return NextResponse.json(items, {
      headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" },
    });
  } catch (e) {
    console.error("church-decorations:", e);
    return NextResponse.json([], { status: 200 });
  }
}
