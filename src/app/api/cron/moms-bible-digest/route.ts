import { emailConfigured } from "@/lib/email";
import { runReplyDigest } from "@/lib/moms-bible/notify";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * Vercel Cron (vercel.json, daily 23:00 UTC). Mom's Bible reply digest: one email per parent for
 * child replies not seen in the app and not emailed yet (DIGEST parents, and INSTANT parents whose
 * extra replies arrived during the 1-hour cooldown). Emails never include the child's words.
 */
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET?.trim();
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!emailConfigured()) {
    console.warn("[cron moms-bible-digest] email not configured; skipping");
    return NextResponse.json({ skipped: "email not configured" });
  }
  return NextResponse.json(await runReplyDigest());
}
