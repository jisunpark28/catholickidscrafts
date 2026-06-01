import { getPublishedTypingWords } from "@/lib/typing-words";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const items = await getPublishedTypingWords();
    return NextResponse.json(items, {
      headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" },
    });
  } catch (e) {
    console.error("typing-words:", e);
    return NextResponse.json([], { status: 200 });
  }
}
