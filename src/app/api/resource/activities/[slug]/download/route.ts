import { parentApiGuard } from "@/lib/family-auth";
import { getRateLimitState, recordRateLimitFailure, type RateLimitRule } from "@/lib/rate-limit";
import { activityFileName, getActivity, parseActivityVariant } from "@/lib/resource/activities";
import { readActivityPdf } from "@/lib/resource/activity-files";
import { familyHasPlus, plusRequiredResponse } from "@/lib/subscription/entitlements";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type Ctx = { params: Promise<{ slug: string }> };

/** Free with sign-in: 60 activity PDFs per hour per family (anti-scraping). */
const ACTIVITY_DOWNLOAD_RULE: RateLimitRule = {
  max: 60,
  windowMs: 60 * 60 * 1000,
  blockMs: 60 * 60 * 1000,
};

const noStore = { "Cache-Control": "private, no-store" };

/**
 * Activity PDF (B&W or colour), checked on every request. Free sheets: any signed-in parent.
 * Plus sheets (the craft): an active Plus pass too, else 402.
 * Signed out: 401. Child mode: 403 (parentApiGuard). The PDFs are bundled under assets/, never public.
 */
export async function GET(request: Request, ctx: Ctx) {
  const { slug } = await ctx.params;
  const activity = getActivity(slug);
  if (!activity) return NextResponse.json({ error: "Not found" }, { status: 404, headers: noStore });
  const variant = parseActivityVariant(new URL(request.url).searchParams.get("variant")) ?? "bw";

  const guard = await parentApiGuard();
  if (guard.error) {
    guard.error.headers.set("Cache-Control", noStore["Cache-Control"]);
    return guard.error;
  }
  if (activity.access === "plus" && !(await familyHasPlus(guard.session.familyAccountId))) {
    const res = plusRequiredResponse();
    res.headers.set("Cache-Control", noStore["Cache-Control"]);
    return res;
  }

  const limitKey = `activity-dl:${guard.session.familyAccountId}`;
  const limit = await getRateLimitState([limitKey]);
  if (limit.blocked) {
    return NextResponse.json(
      { error: "Too many downloads. Please try again later." },
      { status: 429, headers: { ...noStore, "Retry-After": String(limit.retryAfterSec) } },
    );
  }

  const file = await readActivityPdf(activity.slug, variant);
  if (!file) {
    return NextResponse.json({ error: "This sheet is not available yet." }, { status: 404, headers: noStore });
  }
  await recordRateLimitFailure(limitKey, ACTIVITY_DOWNLOAD_RULE);

  return new NextResponse(new Uint8Array(file.body), {
    status: 200,
    headers: {
      ...noStore,
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${activityFileName(activity, variant)}"`,
      "Content-Length": String(file.size),
      "X-Content-Type-Options": "nosniff",
    },
  });
}
