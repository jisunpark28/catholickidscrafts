import { clientIpFromHeaders } from "@/lib/client-ip";
import { prisma } from "@/lib/prisma";
import { getRateLimitState, recordRateLimitFailure, type RateLimitRule } from "@/lib/rate-limit";
import { SUBSCRIBER_STATUS, newToken, sendConfirmEmail } from "@/lib/subscribers";
import { NextResponse } from "next/server";
import { z } from "zod";

/** 8 sign-up attempts per IP per hour. */
const SUBSCRIBE_RULE: RateLimitRule = { max: 8, windowMs: 60 * 60 * 1000, blockMs: 60 * 60 * 1000 };

const bodySchema = z.object({
  email: z.string().trim().toLowerCase().max(254).email("Please enter a valid email."),
  consent: z.literal(true, { message: "Please tick the box to agree to receive the email." }),
  source: z
    .string()
    .trim()
    .max(40)
    .regex(/^[a-z0-9-]*$/)
    .optional(),
});

export async function POST(request: Request) {
  const ip = clientIpFromHeaders(request.headers);
  const key = `subscribe:ip:${ip}`;
  const state = await getRateLimitState([key]);
  if (state.blocked) {
    return NextResponse.json(
      { error: "Too many attempts. Please try again later." },
      { status: 429, headers: { "Retry-After": String(state.retryAfterSec) } },
    );
  }
  await recordRateLimitFailure(key, SUBSCRIBE_RULE);

  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }
  const { email, source } = parsed.data;

  const existing = await prisma.emailSubscriber.findUnique({ where: { email } });
  // Already confirmed: answer the same way so the endpoint doesn't reveal who is subscribed.
  if (existing?.status === SUBSCRIBER_STATUS.confirmed) return NextResponse.json({ ok: true });

  const confirmToken = newToken();
  const consent = { consentAt: new Date(), consentIp: ip, source: source ?? "" };
  if (existing) {
    await prisma.emailSubscriber.update({
      where: { id: existing.id },
      data: { status: SUBSCRIBER_STATUS.pending, confirmToken, unsubscribedAt: null, ...consent },
    });
  } else {
    await prisma.emailSubscriber.create({
      data: { email, status: SUBSCRIBER_STATUS.pending, confirmToken, unsubscribeToken: newToken(), ...consent },
    });
  }

  await sendConfirmEmail(email, confirmToken);
  return NextResponse.json({ ok: true });
}
