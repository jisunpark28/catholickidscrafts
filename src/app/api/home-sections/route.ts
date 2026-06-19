import { getPublishedHomeSections } from "@/lib/home-sections";
import { NextResponse } from "next/server";

export async function GET() {
  const sections = await getPublishedHomeSections();
  return NextResponse.json(sections, {
    headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" },
  });
}
