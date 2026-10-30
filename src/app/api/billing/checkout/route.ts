import { clientIpFromHeaders } from "@/lib/client-ip";
import { prisma } from "@/lib/prisma";
import { CHECKOUT_RULE, getRateLimitState, recordRateLimitFailure } from "@/lib/rate-limit";
import {
  automaticTaxEnabled,
  billingNotConfiguredResponse,
  billingOrigin,
  getStripe,
  isBillingConfigured,
  stripePriceForPlan,
} from "@/lib/stripe";
import { getFamilySubscription } from "@/lib/subscription/entitlements";
import { isPassPlan, PASS_CURRENCY, PASS_PRICE_CENTS, type PassPlan } from "@/lib/subscription/pass-math";
import { requireBillingParent } from "@/lib/subscription/require-parent";

export const dynamic = "force-dynamic";

const MAX_BODY_BYTES = 1024;

/**
 * Starts a one-time Stripe Checkout (payment mode) for a Plus pass: 1 month or 1 year.
 * No auto-renew. Parent-only; the plan is whitelisted and the Stripe Price is checked
 * server-side against the expected USD amount before any session is created.
 */
export async function POST(req: Request) {
  const stripe = getStripe();
  if (!stripe || !isBillingConfigured()) return billingNotConfiguredResponse();

  const parent = await requireBillingParent();
  if ("error" in parent) return parent.error;
  const { session } = parent;

  const rateKeys = [`checkout:family:${session.familyAccountId}`, `checkout:ip:${clientIpFromHeaders(req.headers)}`];
  const limit = await getRateLimitState(rateKeys);
  if (limit.blocked) {
    return Response.json(
      { error: "Too many checkout attempts. Please try again in a few minutes." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfterSec) } },
    );
  }

  const raw = await req.text().catch(() => "");
  if (raw.length > MAX_BODY_BYTES) return Response.json({ error: "Invalid request" }, { status: 400 });
  let body: { plan?: unknown } = {};
  try {
    body = raw ? (JSON.parse(raw) as { plan?: unknown }) : {};
  } catch {
    return Response.json({ error: "Invalid request" }, { status: 400 });
  }
  if (!isPassPlan(body.plan)) return Response.json({ error: "That plan is not available" }, { status: 400 });
  const plan: PassPlan = body.plan;

  // Every attempt counts toward the limit (each one creates a Stripe session).
  await Promise.all(rateKeys.map((k) => recordRateLimitFailure(k, CHECKOUT_RULE)));

  const priceId = stripePriceForPlan(plan);
  if (!priceId) return Response.json({ error: "That plan is not available" }, { status: 400 });

  // Server-side price check: the env price must be an active one-time USD price for the exact amount.
  const price = await stripe.prices.retrieve(priceId).catch(() => null);
  if (
    !price ||
    !price.active ||
    price.type !== "one_time" ||
    price.currency !== PASS_CURRENCY ||
    price.unit_amount !== PASS_PRICE_CENTS[plan]
  ) {
    console.error("[billing] Stripe price does not match the Plus pass", plan);
    return Response.json({ error: "This plan is temporarily unavailable" }, { status: 503 });
  }

  // Legacy fallback: a family on an old live subscription should not pay twice.
  const current = await getFamilySubscription(session.familyAccountId);
  if (current.subscription && current.grantsPlus) {
    return Response.json({ error: "Your family already has Plus through a subscription" }, { status: 409 });
  }

  let stripeCustomerId = current.customer?.stripeCustomerId ?? null;
  if (!stripeCustomerId) {
    const customer = await stripe.customers.create(
      {
        email: session.email,
        name: session.displayName ?? undefined,
        metadata: { familyAccountId: session.familyAccountId },
      },
      { idempotencyKey: `ckc-customer-${session.familyAccountId}` },
    );
    stripeCustomerId = customer.id;
    await prisma.billingCustomer.upsert({
      where: { familyAccountId: session.familyAccountId },
      create: { familyAccountId: session.familyAccountId, stripeCustomerId },
      update: {},
    });
    const row = await prisma.billingCustomer.findUnique({ where: { familyAccountId: session.familyAccountId } });
    stripeCustomerId = row?.stripeCustomerId ?? stripeCustomerId;
  }

  const origin = billingOrigin();
  const metadata = { familyAccountId: session.familyAccountId, plan };
  const tax = automaticTaxEnabled();
  const checkout = await stripe.checkout.sessions.create({
    mode: "payment",
    customer: stripeCustomerId,
    client_reference_id: session.familyAccountId,
    line_items: [{ price: priceId, quantity: 1 }],
    allow_promotion_codes: true,
    ...(tax
      ? { automatic_tax: { enabled: true }, customer_update: { address: "auto" as const, name: "auto" as const } }
      : {}),
    metadata,
    payment_intent_data: { metadata },
    success_url: `${origin}/subscribe/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/subscribe`,
  });
  if (!checkout.url) return Response.json({ error: "Could not start checkout" }, { status: 502 });
  return Response.json({ url: checkout.url });
}
