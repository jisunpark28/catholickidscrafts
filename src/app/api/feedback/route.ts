import { getReaderKey } from "@/lib/bible/reader";
import { clientIpFromHeaders } from "@/lib/client-ip";
import { parseFeedback } from "@/lib/feedback";
import { prisma } from "@/lib/prisma";
import { FEEDBACK_RULE, getRateLimitState, recordRateLimitFailure } from "@/lib/rate-limit";
import { after, NextResponse } from "next/server";
import { notifyFeedback, type FeedbackSender } from "@/lib/feedback-notify";

export const dynamic = "force-dynamic";

const MAX_BODY_BYTES = 8 * 1024;

export async function POST(request: Request) {
  const rateKey = `feedback:ip:${clientIpFromHeaders(request.headers)}`;
  const limit = await getRateLimitState([rateKey]);
  if (limit.blocked) {
    return NextResponse.json(
      { error: "Too many messages. Please try again a little later." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfterSec) } },
    );
  }

  const raw = await request.text().catch(() => "");
  if (raw.length > MAX_BODY_BYTES) return NextResponse.json({ error: "Message is too long" }, { status: 413 });
  let body: unknown;
  try {
    body = JSON.parse(raw);
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  // Honeypot: real people never fill the hidden "website" field. Pretend success so bots learn nothing.
  const b = body as Record<string, unknown> | null;
  if (b && typeof b.website === "string" && b.website.trim() !== "") {
    return NextResponse.json({ ok: true });
  }

  const parsed = parseFeedback(body);
  if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 });

  // Every submission counts toward the per-IP limit.
  await recordRateLimitFailure(rateKey, FEEDBACK_RULE);

  // Identity only from the verified session cookies; anything the client sends is ignored.
  let familyAccountId: string | null = null;
  let subProfileId: string | null = null;
  try {
    const key = await getReaderKey();
    if (key?.type === "owner") familyAccountId = key.familyAccountId;
    if (key?.type === "sub") {
      subProfileId = key.subProfileId;
      const sub = await prisma.subProfile.findUnique({
        where: { id: key.subProfileId },
        select: { familyAccountId: true },
      });
      familyAccountId = sub?.familyAccountId ?? null;
    }
  } catch {
    /* anonymous */
  }

  const sender: FeedbackSender = subProfileId ? "child" : familyAccountId ? "parent" : "signed-out visitor";
  let createdAt: Date;
  try {
    const row = await prisma.feedback.create({
      data: { ...parsed.value, familyAccountId, subProfileId },
      select: { createdAt: true },
    });
    createdAt = row.createdAt;
  } catch (e) {
    console.error("feedback create", e);
    return NextResponse.json({ error: "Could not send right now. Please try again later." }, { status: 503 });
  }
  // Email after the response; failures are logged inside and never change the result.
  after(() => notifyFeedback(parsed.value, sender, createdAt));
  return NextResponse.json({ ok: true });
}
