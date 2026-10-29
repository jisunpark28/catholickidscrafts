import { parentApiGuard } from "@/lib/family-auth";
import { getRateLimitState, recordRateLimitFailure, type RateLimitRule } from "@/lib/rate-limit";
import { CardOriginalUnavailableError, readCardOriginal } from "@/lib/resource/card-originals";
import { cardFileName, getPictureCard } from "@/lib/resource/cards";
import { familyHasPlus, plusRequiredResponse } from "@/lib/subscription/entitlements";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type Ctx = { params: Promise<{ id: string }> };

/** Anti-scraping cap per family: 300 full-size cards per hour (downloads + shares). */
const CARD_DOWNLOAD_RULE: RateLimitRule = {
  max: 300,
  windowMs: 60 * 60 * 1000,
  blockMs: 60 * 60 * 1000,
};

const noStore = { "Cache-Control": "private, no-store" };

/**
 * Plus-only full-resolution card (1080×1350 PNG, Instagram 4:5).
 * Signed-in parent + active Plus, checked on every request; originals never get a public URL.
 * `?inline=1` is used by the Share button (Web Share API needs the file in memory).
 */
export async function GET(request: Request, ctx: Ctx) {
  const guard = await parentApiGuard();
  if (guard.error) return guard.error;
  const { id } = await ctx.params;
  const card = getPictureCard(id);
  if (!card) return NextResponse.json({ error: "Not found" }, { status: 404, headers: noStore });
  if (!(await familyHasPlus(guard.session.familyAccountId))) return plusRequiredResponse();

  const limitKey = `card-dl:${guard.session.familyAccountId}`;
  const limit = await getRateLimitState([limitKey]);
  if (limit.blocked) {
    return NextResponse.json(
      { error: "Too many card downloads. Please try again later." },
      { status: 429, headers: { ...noStore, "Retry-After": String(limit.retryAfterSec) } },
    );
  }

  let original;
  try {
    original = await readCardOriginal(card.id);
  } catch (e) {
    if (e instanceof CardOriginalUnavailableError) {
      return NextResponse.json({ error: e.message }, { status: 503, headers: noStore });
    }
    throw e;
  }
  if (!original) {
    return NextResponse.json({ error: "This card is not available yet." }, { status: 404, headers: noStore });
  }

  await recordRateLimitFailure(limitKey, CARD_DOWNLOAD_RULE);

  const inline = new URL(request.url).searchParams.get("inline") === "1";
  const name = cardFileName(card);
  const headers: Record<string, string> = {
    ...noStore,
    "Content-Type": "image/png",
    "Content-Disposition": `${inline ? "inline" : "attachment"}; filename="${name}"`,
    "X-Content-Type-Options": "nosniff",
  };
  if (original.size) headers["Content-Length"] = String(original.size);
  const body = Buffer.isBuffer(original.body) ? new Uint8Array(original.body) : original.body;
  return new NextResponse(body, { status: 200, headers });
}
