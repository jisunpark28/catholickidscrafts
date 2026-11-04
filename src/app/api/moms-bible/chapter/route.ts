import { linkedChildren } from "@/lib/moms-bible/access";
import { getChildSession, mbError, parseChapterRef, parseId } from "@/lib/moms-bible/http";
import { loadChapterView } from "@/lib/moms-bible/queries";
import { getFamilySession, parentApiGuard } from "@/lib/family-auth";
import { childHasFamilyPass } from "@/lib/subscription/entitlements";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/** GET ?book=psalms&chapters=33,34[&child=<id>]: Mom's Bible data for the reader page. */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const book = url.searchParams.get("book");
  const chapters = (url.searchParams.get("chapters") ?? "").split(",").filter(Boolean).slice(0, 4);
  const refs = chapters.map((c) => parseChapterRef(book, c));
  if (refs.length === 0 || refs.some((r) => !r)) return mbError(400, "Invalid chapter");
  const bookSlug = refs[0]!.bookSlug;
  const chapterNums = refs.map((r) => r!.chapter);

  const child = await getChildSession();
  if (child) {
    const view = await loadChapterView({
      viewer: { kind: "child", childId: child.childId },
      childId: child.childId,
      bookSlug,
      chapters: chapterNums,
      familyPass: await childHasFamilyPass(child.childId),
    });
    return NextResponse.json(view, { headers: { "Cache-Control": "no-store" } });
  }

  if (!(await getFamilySession())) return mbError(401, "Not signed in");
  const guard = await parentApiGuard();
  if (guard.error) return guard.error;
  const parentId = guard.session.familyAccountId;
  const children = await linkedChildren(parentId);
  const wanted = parseId(url.searchParams.get("child"));
  const selected = (wanted && children.find((c) => c.id === wanted)) || null;
  if (!selected) return mbError(404, "Not found");
  const view = await loadChapterView({
    viewer: { kind: "parent", parentId, children: children.map((c) => ({ id: c.id, displayName: c.displayName })) },
    childId: selected.id,
    bookSlug,
    chapters: chapterNums,
    familyPass: await childHasFamilyPass(selected.id),
  });
  return NextResponse.json(view, { headers: { "Cache-Control": "no-store" } });
}
