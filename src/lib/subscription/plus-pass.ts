import type Stripe from "stripe";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { planForStripePrice } from "@/lib/stripe";
import { linkCheckoutCustomer } from "@/lib/subscription/billing-sync";
import {
  addPlanDuration,
  nextPassStart,
  PASS_CURRENCY,
  plusEndsAt,
  rechainPasses,
  type PassPlan,
} from "@/lib/subscription/pass-math";

/**
 * One-time Plus passes. Writes happen only from verified Stripe data (webhook, or the
 * success page re-reading the Checkout Session from Stripe). Never from client input.
 */

function idOf(v: string | { id: string } | null | undefined): string | null {
  if (!v) return null;
  return typeof v === "string" ? v : v.id;
}

/** Serialise pass writes per family (stacking + refunds) with a transaction-scoped advisory lock. */
async function lockFamily(tx: Prisma.TransactionClient, familyAccountId: string): Promise<void> {
  const key = `plus-pass:${familyAccountId}`;
  await tx.$queryRaw`SELECT 1 AS locked FROM pg_advisory_xact_lock(hashtext(${key}))`;
}

export type GrantResult =
  | { granted: true; passId: string; duplicate: boolean }
  | { granted: false; reason: string };

/**
 * Grant a pass for a paid Checkout Session (idempotent on the session id).
 * Re-retrieves the session from Stripe so only Stripe's own data is trusted.
 */
export async function grantPassFromCheckoutSession(stripe: Stripe, sessionId: string): Promise<GrantResult> {
  const session = await stripe.checkout.sessions.retrieve(sessionId, { expand: ["line_items"] });
  if (session.mode !== "payment") return { granted: false, reason: "not a payment session" };
  if (session.status !== "complete") return { granted: false, reason: "session not complete" };
  if (session.payment_status !== "paid" && session.payment_status !== "no_payment_required") {
    return { granted: false, reason: `payment ${session.payment_status}` };
  }

  const familyAccountId = session.client_reference_id;
  if (!familyAccountId || session.metadata?.familyAccountId !== familyAccountId) {
    throw new Error(`Checkout ${session.id} has no matching family reference`);
  }
  const items = session.line_items?.data ?? [];
  if (items.length !== 1 || (items[0].quantity ?? 1) !== 1) {
    throw new Error(`Checkout ${session.id} has unexpected line items`);
  }
  const priceId = items[0].price?.id ?? null;
  const plan: PassPlan | null = planForStripePrice(priceId);
  if (!plan || !priceId) throw new Error(`Checkout ${session.id} price is not a Plus pass price`);
  if ((session.currency ?? "").toLowerCase() !== PASS_CURRENCY) {
    throw new Error(`Checkout ${session.id} currency ${session.currency} is not ${PASS_CURRENCY}`);
  }

  const paymentIntentId = idOf(session.payment_intent);
  if (paymentIntentId) {
    // A refund that arrived before the grant: don't hand out Plus for refunded money.
    const pi = await stripe.paymentIntents.retrieve(paymentIntentId, { expand: ["latest_charge"] });
    const charge = pi.latest_charge && typeof pi.latest_charge !== "string" ? pi.latest_charge : null;
    if (charge && (charge.refunded || charge.amount_refunded > 0)) {
      return { granted: false, reason: "payment was refunded" };
    }
  }

  const family = await prisma.familyAccount.findUnique({ where: { id: familyAccountId }, select: { id: true } });
  if (!family) return { granted: false, reason: "family no longer exists" };

  await linkCheckoutCustomer(session);

  return prisma.$transaction(async (tx) => {
    await lockFamily(tx, familyAccountId);
    const existing = await tx.plusPass.findUnique({
      where: { stripeCheckoutSessionId: session.id },
      select: { id: true },
    });
    if (existing) return { granted: true, passId: existing.id, duplicate: true } as const;

    const now = new Date();
    const current = await tx.plusPass.findMany({
      where: { familyAccountId, revokedAt: null, expiresAt: { gt: now } },
      select: { startsAt: true, expiresAt: true, revokedAt: true },
    });
    const startsAt = nextPassStart(current, now);
    const expiresAt = addPlanDuration(startsAt, plan);
    const row = await tx.plusPass.create({
      data: {
        familyAccountId,
        plan,
        stripeCheckoutSessionId: session.id,
        stripePaymentIntentId: paymentIntentId,
        stripePriceId: priceId,
        amountTotal: session.amount_total ?? 0,
        currency: (session.currency ?? PASS_CURRENCY).toLowerCase(),
        startsAt,
        expiresAt,
      },
      select: { id: true },
    });
    return { granted: true, passId: row.id, duplicate: false } as const;
  });
}

/** Refund: turn the pass off right away and move any later stacked passes up to close the gap. */
export async function revokePassForPaymentIntent(paymentIntentId: string, reason: string): Promise<boolean> {
  const pass = await prisma.plusPass.findUnique({
    where: { stripePaymentIntentId: paymentIntentId },
    select: { id: true, familyAccountId: true },
  });
  if (!pass) return false;
  await prisma.$transaction(async (tx) => {
    await lockFamily(tx, pass.familyAccountId);
    const now = new Date();
    await tx.plusPass.updateMany({
      where: { id: pass.id, revokedAt: null },
      data: { revokedAt: now, revokeReason: reason.slice(0, 200) },
    });
    const rest = await tx.plusPass.findMany({
      where: { familyAccountId: pass.familyAccountId, revokedAt: null, expiresAt: { gt: now } },
      select: { id: true, startsAt: true, expiresAt: true, revokedAt: true },
    });
    for (const c of rechainPasses(rest, now)) {
      await tx.plusPass.update({ where: { id: c.id }, data: { startsAt: c.startsAt, expiresAt: c.expiresAt } });
    }
  });
  return true;
}

export type FamilyPassStatus = { active: boolean; endsAt: Date | null; plan: PassPlan | null };

const NO_PASS: FamilyPassStatus = { active: false, endsAt: null, plan: null };

/** Current pass state for a family. Fails closed (no Plus) if the table is missing or the DB errors. */
export async function getFamilyPassStatus(familyAccountId: string, now: Date = new Date()): Promise<FamilyPassStatus> {
  const rows = await prisma.plusPass
    .findMany({
      where: { familyAccountId, revokedAt: null, expiresAt: { gt: now } },
      select: { plan: true, startsAt: true, expiresAt: true, revokedAt: true },
      orderBy: { startsAt: "asc" },
    })
    .catch((err: unknown) => {
      console.error("[billing] pass lookup failed", err);
      return null;
    });
  if (!rows || rows.length === 0) return NO_PASS;
  const endsAt = plusEndsAt(rows, now);
  if (!endsAt) return NO_PASS;
  const running = rows.find((r) => r.startsAt.getTime() <= now.getTime());
  const plan = running?.plan === "year" || running?.plan === "month" ? running.plan : null;
  return { active: true, endsAt, plan };
}
