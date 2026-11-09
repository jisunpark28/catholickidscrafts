import { mbError, parseChapterRef, parseId } from "@/lib/moms-bible/http";
import { readerPageMomsBible } from "@/lib/moms-bible/page-data";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * GET ?book=psalms&chapters=33,34[&child=<id>]: everything per-user on a Bible chapter page
 * (Mom's Bible view, toolbar, banners, intro card). The chapter page itself is static, so this
 * is the same server code the page used to run (readerPageMomsBible): the viewer comes from the
 * signed session only, a parent only ever gets a linked child (?child= is just a preference),
 * and Plus / Family Pass are resolved here. Never cached.
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const book = url.searchParams.get("book");
  const chapters = (url.searchParams.get("chapters") ?? "").split(",").filter(Boolean).slice(0, 4);
  const refs = chapters.map((c) => parseChapterRef(book, c));
  if (refs.length === 0 || refs.some((r) => !r)) return mbError(400, "Invalid chapter");

  const data = await readerPageMomsBible({
    bookSlug: refs[0]!.bookSlug,
    chapters: refs.map((r) => r!.chapter),
    childParam: parseId(url.searchParams.get("child")),
  });
  const res = NextResponse.json(data);
  res.headers.set("Cache-Control", "private, no-store, max-age=0");
  res.headers.set("Vary", "Cookie");
  return res;
}
