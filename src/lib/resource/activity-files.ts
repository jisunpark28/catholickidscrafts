// Server-only: reads the bundled activity PDFs (assets/activities/<slug>/), which are never
// public. next.config.ts traces them into the download route. Never import from a client component.
import fs from "fs/promises";
import path from "path";
import { getActivity, type ActivityVariant } from "@/lib/resource/activities";

export type ActivityFile = { body: Buffer; size: number };

const SAFE_NAME = /^[a-z0-9-]+\.pdf$/;

export async function readActivityPdf(slug: string, variant: ActivityVariant): Promise<ActivityFile | null> {
  const activity = getActivity(slug);
  if (!activity) return null;
  const name = activity.files[variant];
  if (!SAFE_NAME.test(name) || !/^[a-z0-9-]+$/.test(activity.slug)) return null;
  try {
    const body = await fs.readFile(path.join(process.cwd(), "assets", "activities", activity.slug, name));
    return { body, size: body.length };
  } catch (e) {
    console.error("[activities] pdf missing", slug, variant, e instanceof Error ? e.message : e);
    return null;
  }
}
