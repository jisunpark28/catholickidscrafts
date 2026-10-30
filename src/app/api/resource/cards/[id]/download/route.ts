import { cookies } from "next/headers";
import { clientIpFromHeaders } from "@/lib/client-ip";
import { parentApiGuard } from "@/lib/family-auth";
import { getRateLimitState, recordRateLimitFailure, type RateLimitRule } from "@/lib/rate-limit";
import { CardOriginalUnavailableError, readCardOriginal } from "@/lib/resource/card-originals";
import { cardFileName, getPictureCard } from "@/lib/resource/cards";
import { isFreeFeaturedCard } from "@/lib/resource/featured-card";
import { COUNTRY_COOKIE, pickCountry } from "@/lib/resource/this-sunday";
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

/** Free featured (This Sunday / today's) card: 30 per hour per IP. */
const FREE_CARD_DOWNLOAD_RULE: RateLimitRule = {
  max: 30,
  windowMs: 60 * 60 * 1000,
  blockMs: 60 * 60 * 1000,
};

const noStore = { "Cache-Control": "private, no-store" };

/**
 * Full-resolution card (1080×1350 PNG, Instagram 4:5).
 * Today's featured card (This Sunday tab) is free for everyone, rate-limited by IP.
 * Every other card needs a signed-in parent + active Plus, checked on every request.
 * Originals never get a public URL. `?inline=1` is used by the Share button.
 */
export async function GET(request: Request, ctx: Ctx) {
  const { id } = await ctx.params;
  const card = getPictureCard(id);
  if (!card) return NextResponse.json({ error: "Not found" }, { status: 404, headers: noStore });

  const cookieStore = await cookies();
  const country = pickCountry(
    undefined,
    cookieStore.get(COUNTRY_COOKIE)?.value,
    request.headers.get("x-vercel-ip-country"),
  );

  let limitKey: string;
  let rule: RateLimitRule;
  if (isFreeFeaturedCard(card.id, country)) {
    limitKey = `card-dl-free:ip:${clientIpFromHeaders(request.headers)}`;
    rule = FREE_CARD_DOWNLOAD_RULE;
  } else {
    const guard = await parentApiGuard();
    if (guard.error) return guard.error;
    if (!(await familyHasPlus(guard.session.familyAccountId))) return plusRequiredResponse();
    limitKey = `card-dl:${guard.session.familyAccountId}`;
    rule = CARD_DOWNLOAD_RULE;
  }

  const limit = await getRateLimitState([limitKey]);
  if (limit.blocked) {
    return NextResponse.json(
      { error: "Too many card downloads. Please try again later." },
      { status: 429, headers: { ...noStore, "Retry-After": String(limit.retryAfterSec) } },
    );
  }

  let original;
  try {
    original = await readCardOriginal(card.id, { oidcToken: request.headers.get("x-vercel-oidc-token") });
  } catch (e) {
    if (e instanceof CardOriginalUnavailableError) {
      return NextResponse.json({ error: e.message }, { status: 503, headers: noStore });
    }
    throw e;
  }
  if (!original) {
    return NextResponse.json({ error: "This card is not available yet." }, { status: 404, headers: noStore });
  }

  await recordRateLimitFailure(limitKey, rule);

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
