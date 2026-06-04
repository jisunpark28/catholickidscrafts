import { getPublishedPhotoBoothFrames } from "@/lib/photo-booth-frames";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const frames = await getPublishedPhotoBoothFrames();
    return NextResponse.json(frames, {
      headers: { "Cache-Control": "public, s-maxage=300" },
    });
  } catch (e) {
    console.error("photo-booth-frames:", e);
    return NextResponse.json({ error: "Could not load frames." }, { status: 500 });
  }
}
