import { parentApiGuard } from "@/lib/family-auth";
import { getRateLimitState, recordRateLimitFailure } from "@/lib/rate-limit";
import { createActivityDownloadHandler } from "@/lib/resource/activity-download";
import { ActivityFileUnavailableError, readActivityPdf } from "@/lib/resource/activity-files";
import { familyHasPlus, plusRequiredResponse } from "@/lib/subscription/entitlements";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * Activity PDF download: parentApiGuard() (401 / 403), then familyHasPlus() for Plus crafts (402),
 * then the rate limit, and only then the file (bundled sheet or private Blob craft).
 * See lib/resource/activity-download.ts.
 */
export const GET = createActivityDownloadHandler({
  guard: parentApiGuard,
  hasPlus: familyHasPlus,
  plusRequired: plusRequiredResponse,
  rateLimitState: getRateLimitState,
  recordRateLimit: recordRateLimitFailure,
  readPdf: readActivityPdf,
  isUnavailable: (e) => e instanceof ActivityFileUnavailableError,
});
