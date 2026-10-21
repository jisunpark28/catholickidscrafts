import { prisma } from "@/lib/prisma";
import {
  automaticTaxEnabled,
  billingNotConfiguredResponse,
  billingOrigin,
  getStripe,
  isBillingConfigured,
  stripePriceAnnual,
  stripePriceMonthly,
} from "@/lib/stripe";
import { getFamilySubscription } from "@/lib/subscription/entitlements";
import { requireBillingParent } from "@/lib/subscription/require-parent";
import { isLiveStripeStatus } from "@/lib/subscription/status";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const stripe = getStripe();
  if (!stripe || !isBillingConfigured()) return billingNotConfiguredResponse();

  const parent = await requireBillingParent();
  if ("error" in parent) return parent.error;
  const { session } = parent;

  const body = (await req.json().catch(() => ({}))) as { interval?: string };
  const price = body.interval === "year" ? stripePriceAnnual() : stripePriceMonthly();
  if (!price) return Response.json({ error: "That plan is not available" }, { status: 400 });

  const origin = billingOrigin();
  const current = await getFamilySubscription(session.familyAccountId);
  if (current.subscription && isLiveStripeStatus(current.subscription.status)) {
    // Already subscribed: send them to the portal instead of creating a 2nd subscription.
    if (current.customer) {
      const portal = await stripe.billingPortal.sessions.create({
        customer: current.customer.stripeCustomerId,
        return_url: `${origin}/account`,
      });
      return Response.json({ url: portal.url, alreadySubscribed: true });
    }
    return Response.json({ error: "You already have Plus" }, { status: 409 });
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

  const tax = automaticTaxEnabled();
  const checkout = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: stripeCustomerId,
    client_reference_id: session.familyAccountId,
    line_items: [{ price, quantity: 1 }],
    currency: "cad",
    allow_promotion_codes: true,
    ...(tax
      ? { automatic_tax: { enabled: true }, customer_update: { address: "auto" as const, name: "auto" as const } }
      : {}),
    metadata: { familyAccountId: session.familyAccountId },
    subscription_data: { metadata: { familyAccountId: session.familyAccountId } },
    success_url: `${origin}/subscribe/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/account`,
  });
  if (!checkout.url) return Response.json({ error: "Could not start checkout" }, { status: 502 });
  return Response.json({ url: checkout.url });
}
