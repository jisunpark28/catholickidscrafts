// Server-only: private Vercel Blob pathnames of the ready-made craft PDFs. Never import from a
// client component or a page; only the download route (via activity-files) and the upload script use it.
import type { ActivityVariant, ResourceActivity } from "@/lib/resource/activities";

/** Folder of the craft PDFs inside the private store (shared with the card originals). */
export const CRAFT_BLOB_PREFIX = "crafts";

const SAFE_SLUG = /^[a-z0-9-]+$/;
const SAFE_NAME = /^[a-z0-9-]+\.pdf$/;

/** "crafts/<slug>/<slug>-color.pdf" for a Blob-stored craft, else null (bundled sheets). */
export function craftBlobPathname(
  activity: Pick<ResourceActivity, "slug" | "files" | "storage">,
  variant: ActivityVariant,
): string | null {
  if (activity.storage !== "blob") return null;
  const name = activity.files[variant];
  if (!SAFE_SLUG.test(activity.slug) || !SAFE_NAME.test(name)) return null;
  return `${CRAFT_BLOB_PREFIX}/${activity.slug}/${name}`;
}
