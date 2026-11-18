import { zipSync } from "fflate";
import { parentApiGuard } from "@/lib/family-auth";
import {
  packActivitySlugsForScope,
  parsePackDownloadScope,
} from "@/lib/advent-complete-2026";
import { getRateLimitState, recordRateLimitFailure, type RateLimitRule } from "@/lib/rate-limit";
import { ACTIVITY_VARIANTS, activityFileName, getActivity } from "@/lib/resource/activities";
import { ActivityFileUnavailableError, readActivityPdf, type ActivityFile } from "@/lib/resource/activity-files";
import { familyHasPlus, plusRequiredResponse } from "@/lib/subscription/entitlements";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/** Pack ZIP: a few downloads per hour per family (each zip packs many PDFs). */
const PACK_ZIP_RULE: RateLimitRule = {
  max: 12,
  windowMs: 60 * 60 * 1000,
  blockMs: 60 * 60 * 1000,
};

const noStore = { "Cache-Control": "private, no-store" };

async function fileToBuffer(file: ActivityFile): Promise<Buffer> {
  if (Buffer.isBuffer(file.body)) return file.body;
  const reader = file.body.getReader();
  const chunks: Uint8Array[] = [];
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    if (value) chunks.push(value);
  }
  return Buffer.concat(chunks.map((c) => Buffer.from(c)));
}

/**
 * Plus-only ZIP of Advent Complete activity PDFs (BW + colour) for `scope=all|w1|w2|w3|w4|ic`.
 * Gospel sheets stay HTML print routes (opened by the client Download-all control).
 */
export async function GET(request: Request): Promise<Response> {
  const scope = parsePackDownloadScope(new URL(request.url).searchParams.get("scope"));
  if (!scope) {
    return NextResponse.json({ error: "Unknown pack scope." }, { status: 400, headers: noStore });
  }

  const guard = await parentApiGuard();
  if (guard.error) {
    guard.error.headers.set("Cache-Control", noStore["Cache-Control"]);
    return guard.error;
  }
  if (!(await familyHasPlus(guard.session.familyAccountId))) {
    const res = plusRequiredResponse();
    res.headers.set("Cache-Control", noStore["Cache-Control"]);
    return res;
  }

  const limitKey = `advent-pack-zip:${guard.session.familyAccountId}`;
  const limit = await getRateLimitState([limitKey]);
  if (limit.blocked) {
    return NextResponse.json(
      { error: "Too many downloads. Please try again later." },
      { status: 429, headers: { ...noStore, "Retry-After": String(limit.retryAfterSec ?? 3600) } },
    );
  }

  const slugs = packActivitySlugsForScope(scope);
  if (!slugs.length) {
    return NextResponse.json({ error: "Nothing to download for this scope." }, { status: 404, headers: noStore });
  }

  const files: Record<string, Uint8Array> = {};
  const oidcToken = request.headers.get("x-vercel-oidc-token");
  try {
    for (const slug of slugs) {
      const activity = getActivity(slug);
      if (!activity) continue;
      for (const variant of ACTIVITY_VARIANTS) {
        const pdf = await readActivityPdf(activity, variant, { oidcToken });
        if (!pdf) continue;
        const buf = await fileToBuffer(pdf);
        files[activityFileName(activity, variant)] = new Uint8Array(buf);
      }
    }
  } catch (e) {
    if (e instanceof ActivityFileUnavailableError) {
      return NextResponse.json(
        { error: "Downloads are not available right now. Please try again soon." },
        { status: 503, headers: noStore },
      );
    }
    throw e;
  }

  if (!Object.keys(files).length) {
    return NextResponse.json({ error: "No PDFs available for this pack yet." }, { status: 404, headers: noStore });
  }

  await recordRateLimitFailure(limitKey, PACK_ZIP_RULE);

  const zipped = zipSync(files, { level: 0 });
  const filename =
    scope === "all" ? "catholickidscrafts-advent-complete-2026.zip" : `catholickidscrafts-advent-complete-2026-${scope}.zip`;

  return new NextResponse(Buffer.from(zipped), {
    status: 200,
    headers: {
      ...noStore,
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Content-Length": String(zipped.byteLength),
      "X-Content-Type-Options": "nosniff",
    },
  });
}
