import { resolveReadRoute } from "@/lib/bible/chapter-pages";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ bookSlug: string; chapter: string }> };

/**
 * Old reader links that use the site's storage chapter numbers (`/bible/read/psalms/33?douay=1&v=19`,
 * still built from saved memos). next.config.ts rewrites only those requests here, so normal chapter
 * pages stay static. Answers one permanent redirect to the official page (and verse anchor).
 */
export async function GET(request: Request, { params }: Ctx) {
  const { bookSlug, chapter } = await params;
  const url = new URL(request.url);
  const verse = Number(url.searchParams.get("v"));
  const route = resolveReadRoute(bookSlug, chapter, {
    douay: true,
    douayVerse: Number.isInteger(verse) && verse > 0 ? verse : undefined,
  });
  if (route.type !== "redirect") return new NextResponse("Not found", { status: 404 });
  const lang = url.searchParams.get("lang");
  const [path, hash] = route.to.split("#");
  const to = `${path}${lang ? `?lang=${encodeURIComponent(lang)}` : ""}${hash ? `#${hash}` : ""}`;
  return NextResponse.redirect(new URL(to, url.origin), 308);
}
