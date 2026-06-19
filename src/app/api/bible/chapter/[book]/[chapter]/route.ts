import { fetchBibleChapter } from "@/lib/bible/latinprayer";
import { NextResponse } from "next/server";

type Params = { params: Promise<{ book: string; chapter: string }> };

export async function GET(_request: Request, { params }: Params) {
  const { book, chapter: chapterStr } = await params;
  const chapter = Number(chapterStr);
  if (!Number.isFinite(chapter) || chapter < 1) {
    return NextResponse.json({ error: "Invalid chapter" }, { status: 400 });
  }
  try {
    const data = await fetchBibleChapter(book, chapter);
    return NextResponse.json(data, {
      headers: { "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=604800" },
    });
  } catch {
    return NextResponse.json({ error: "Chapter not found" }, { status: 404 });
  }
}
