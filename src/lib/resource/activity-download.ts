// Download handler for /api/resource/activities/[slug]/download. The route passes the real
// session, Plus, rate-limit and file readers; scripts/test-activities.ts passes mocks to check that
// 401 / 402 are answered before any file or Blob access.
import { NextResponse } from "next/server";
import { activityFileName, getActivity, isActivityFreeThisWeek, parseActivityVariant, type ActivityVariant, type ResourceActivity } from "@/lib/resource/activities";
import type { ActivityFile } from "@/lib/resource/activity-files";
import type { RateLimitRule } from "@/lib/rate-limit";

/** Free with sign-in: 60 activity PDFs per hour per family (anti-scraping). */
export const ACTIVITY_DOWNLOAD_RULE: RateLimitRule = {
  max: 60,
  windowMs: 60 * 60 * 1000,
  blockMs: 60 * 60 * 1000,
};

const noStore = { "Cache-Control": "private, no-store" };

export type ActivityDownloadDeps = {
  /** parentApiGuard: 401 signed out, 403 child mode. */
  guard: () => Promise<{ error: NextResponse } | { error?: undefined; session: { familyAccountId: string } }>;
  hasPlus: (familyAccountId: string) => Promise<boolean>;
  /** 402 response. */
  plusRequired: () => Response;
  rateLimitState: (keys: string[]) => Promise<{ blocked: boolean; retryAfterSec?: number }>;
  recordRateLimit: (key: string, rule: RateLimitRule) => Promise<unknown>;
  readPdf: (activity: ResourceActivity, variant: ActivityVariant, opts: { oidcToken: string | null }) => Promise<ActivityFile | null>;
  /** True for "storage not reachable" errors from readPdf (answered 503). */
  isUnavailable: (e: unknown) => boolean;
  /** Clock for the weekly free rule (tests pass a fixed date). Defaults to the request time. */
  now?: () => Date;
};

/**
 * Activity PDF (B&W or colour), checked on every request. Sheets scheduled in this week
 * (isActivityFreeThisWeek, computed per request): any signed-in parent. Everything else: an active
 * Plus pass too, else 402. Signed out: 401. Child mode: 403.
 * Files are read only after those checks; craft PDFs are streamed from the private Blob store, so
 * no storage path, URL or token ever reaches the browser.
 */
export function createActivityDownloadHandler(deps: ActivityDownloadDeps) {
  return async function GET(request: Request, ctx: { params: Promise<{ slug: string }> }): Promise<Response> {
    const { slug } = await ctx.params;
    const activity = getActivity(slug);
    if (!activity) return NextResponse.json({ error: "Not found" }, { status: 404, headers: noStore });
    const variant = parseActivityVariant(new URL(request.url).searchParams.get("variant")) ?? "bw";

    const guard = await deps.guard();
    if (guard.error) {
      guard.error.headers.set("Cache-Control", noStore["Cache-Control"]);
      return guard.error;
    }
    const freeThisWeek = isActivityFreeThisWeek(activity, deps.now ? deps.now() : new Date());
    if (!freeThisWeek && !(await deps.hasPlus(guard.session.familyAccountId))) {
      const res = deps.plusRequired();
      res.headers.set("Cache-Control", noStore["Cache-Control"]);
      return res;
    }

    const limitKey = `activity-dl:${guard.session.familyAccountId}`;
    const limit = await deps.rateLimitState([limitKey]);
    if (limit.blocked) {
      return NextResponse.json(
        { error: "Too many downloads. Please try again later." },
        { status: 429, headers: { ...noStore, "Retry-After": String(limit.retryAfterSec ?? 3600) } },
      );
    }

    let file: ActivityFile | null;
    try {
      file = await deps.readPdf(activity, variant, { oidcToken: request.headers.get("x-vercel-oidc-token") });
    } catch (e) {
      if (deps.isUnavailable(e)) {
        return NextResponse.json({ error: "Downloads are not available right now. Please try again soon." }, { status: 503, headers: noStore });
      }
      throw e;
    }
    if (!file) {
      return NextResponse.json({ error: "This sheet is not available yet." }, { status: 404, headers: noStore });
    }
    await deps.recordRateLimit(limitKey, ACTIVITY_DOWNLOAD_RULE);

    return new NextResponse(Buffer.isBuffer(file.body) ? new Uint8Array(file.body) : file.body, {
      status: 200,
      headers: {
        ...noStore,
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${activityFileName(activity, variant)}"`,
        ...(file.size != null ? { "Content-Length": String(file.size) } : {}),
        "X-Content-Type-Options": "nosniff",
      },
    });
  };
}
