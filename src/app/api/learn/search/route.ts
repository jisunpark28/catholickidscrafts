import { searchLearnCatalog } from "@/lib/learn-catalog";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim() ?? "";
  if (q.length < 2) {
    return NextResponse.json({ results: [] });
  }

  try {
    const results = await searchLearnCatalog(q);
    return NextResponse.json({ results });
  } catch (e) {
    console.error("learn search", e);
    return NextResponse.json({ error: "Search failed", results: [] }, { status: 500 });
  }
}
