// Server-only: activity PDFs, never public. Editor-backed sheets are bundled under
// assets/activities/<slug>/ (next.config.ts traces them into the download route); ready-made craft
// PDFs are in the private Blob store (craft-blobs.ts). Never import from a client component.
import { get } from "@vercel/blob";
import fs from "fs/promises";
import path from "path";
import type { ActivityVariant, ResourceActivity } from "@/lib/resource/activities";
import { cardsBlobAuth } from "@/lib/resource/card-originals";
import { craftBlobPathname } from "@/lib/resource/craft-blobs";

export type ActivityFile = { body: Buffer | ReadableStream<Uint8Array>; size: number | null };

/** Blob storage is not configured or not reachable (the route answers 503). */
export class ActivityFileUnavailableError extends Error {}

const SAFE_NAME = /^[a-z0-9-]+\.pdf$/;

type Activity = Pick<ResourceActivity, "slug" | "files" | "storage">;

async function readBundledPdf(activity: Activity, variant: ActivityVariant): Promise<ActivityFile | null> {
  const name = activity.files[variant];
  if (!SAFE_NAME.test(name) || !/^[a-z0-9-]+$/.test(activity.slug)) return null;
  try {
    const body = await fs.readFile(path.join(process.cwd(), "assets", "activities", activity.slug, name));
    return { body, size: body.length };
  } catch (e) {
    console.error("[activities] pdf missing", activity.slug, variant, e instanceof Error ? e.message : e);
    return null;
  }
}

async function readBlobPdf(activity: Activity, variant: ActivityVariant, oidcToken?: string | null): Promise<ActivityFile | null> {
  const pathname = craftBlobPathname(activity, variant);
  if (!pathname) return null;
  const auth = cardsBlobAuth(oidcToken);
  if (!auth) throw new ActivityFileUnavailableError("Craft downloads are not available right now.");
  let res;
  try {
    res = await get(pathname, { access: "private", ...auth });
  } catch (e) {
    console.error("[activities] blob read failed", activity.slug, variant, e instanceof Error ? e.name : "error");
    throw new ActivityFileUnavailableError("Craft downloads are not available right now.");
  }
  if (res && res.statusCode === 200 && res.stream) return { body: res.stream, size: res.blob.size ?? null };
  console.error("[activities] blob pdf missing", activity.slug, variant, res?.statusCode ?? 404);
  return null;
}

/**
 * PDF for an activity that already passed the access checks. `opts.oidcToken`: the request's
 * `x-vercel-oidc-token` header (private Blob store auth on Vercel).
 */
export async function readActivityPdf(
  activity: Activity,
  variant: ActivityVariant,
  opts?: { oidcToken?: string | null },
): Promise<ActivityFile | null> {
  return activity.storage === "blob" ? readBlobPdf(activity, variant, opts?.oidcToken) : readBundledPdf(activity, variant);
}
