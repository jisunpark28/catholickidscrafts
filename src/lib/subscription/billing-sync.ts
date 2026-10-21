import type Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import type { SubscriptionStatus } from "@prisma/client";

export function mapStripeStatus(status: Stripe.Subscription.Status): SubscriptionStatus {
  switch (status) {
    case "active":
      return "ACTIVE";
    case "trialing":
      return "TRIALING";
    case "past_due":
      return "PAST_DUE";
    case "canceled":
      return "CANCELED";
    case "incomplete":
      return "INCOMPLETE";
    case "incomplete_expired":
      return "INCOMPLETE_EXPIRED";
    case "unpaid":
      return "UNPAID";
    case "paused":
      return "PAUSED";
    default:
      return "INCOMPLETE";
  }
}

function idOf(v: string | { id: string } | null | undefined): string | null {
  if (!v) return null;
  return typeof v === "string" ? v : v.id;
}

/** Period end lives on subscription items in recent Stripe API versions. */
function periodEnd(sub: Stripe.Subscription): Date | null {
  const legacy = (sub as unknown as { current_period_end?: number }).current_period_end;
  const ends = sub.items?.data?.map((i) => i.current_period_end).filter((n): n is number => typeof n === "number") ?? [];
  const sec = ends.length ? Math.max(...ends) : legacy;
  return typeof sec === "number" ? new Date(sec * 1000) : null;
}

/** Find the family for a Stripe customer: our BillingCustomer row, else customer/subscription metadata. */
async function billingCustomerFor(stripeCustomerId: string, familyAccountIdHint?: string | null) {
  const existing = await prisma.billingCustomer.findUnique({ where: { stripeCustomerId } });
  if (existing) return existing;
  if (!familyAccountIdHint) return null;
  const family = await prisma.familyAccount.findUnique({ where: { id: familyAccountIdHint }, select: { id: true } });
  if (!family) return null;
  return prisma.billingCustomer.upsert({
    where: { familyAccountId: family.id },
    create: { familyAccountId: family.id, stripeCustomerId },
    update: { stripeCustomerId },
  });
}

/** Upsert our Subscription mirror from a Stripe subscription object. */
export async function upsertSubscriptionFromStripe(sub: Stripe.Subscription): Promise<void> {
  const stripeCustomerId = idOf(sub.customer);
  if (!stripeCustomerId) throw new Error(`Subscription ${sub.id} has no customer`);
  const customer = await billingCustomerFor(stripeCustomerId, sub.metadata?.familyAccountId);
  if (!customer) throw new Error(`No family for Stripe customer ${stripeCustomerId}`);

  const status = mapStripeStatus(sub.status);
  const prev = await prisma.subscription.findUnique({
    where: { stripeSubscriptionId: sub.id },
    select: { pastDueSince: true },
  });
  const pastDueSince = status === "PAST_DUE" ? (prev?.pastDueSince ?? new Date()) : null;
  const data = {
    billingCustomerId: customer.id,
    status,
    priceId: sub.items?.data?.[0]?.price?.id ?? null,
    currentPeriodEnd: periodEnd(sub),
    cancelAtPeriodEnd: Boolean(sub.cancel_at_period_end || sub.cancel_at),
    canceledAt: sub.canceled_at ? new Date(sub.canceled_at * 1000) : null,
    pastDueSince,
  };
  await prisma.subscription.upsert({
    where: { stripeSubscriptionId: sub.id },
    create: { stripeSubscriptionId: sub.id, ...data },
    update: data,
  });
}

export async function syncSubscriptionById(stripe: Stripe, subscriptionId: string): Promise<void> {
  const sub = await stripe.subscriptions.retrieve(subscriptionId);
  await upsertSubscriptionFromStripe(sub);
}

/** Subscription id on an invoice (new API: parent.subscription_details; old: invoice.subscription). */
export function invoiceSubscriptionId(invoice: Stripe.Invoice): string | null {
  const fromParent = idOf(invoice.parent?.subscription_details?.subscription ?? null);
  if (fromParent) return fromParent;
  return idOf((invoice as unknown as { subscription?: string | { id: string } | null }).subscription ?? null);
}

/** Link the Checkout customer to the family (client_reference_id = familyAccountId). */
export async function linkCheckoutCustomer(session: Stripe.Checkout.Session): Promise<void> {
  const stripeCustomerId = idOf(session.customer);
  const familyAccountId = session.client_reference_id || session.metadata?.familyAccountId;
  if (!stripeCustomerId || !familyAccountId) return;
  await billingCustomerFor(stripeCustomerId, familyAccountId);
}
