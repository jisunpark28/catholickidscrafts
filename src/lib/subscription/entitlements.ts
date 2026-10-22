import type { ReaderKey } from "@/lib/bible/reader";
import { prisma } from "@/lib/prisma";
import { subscriptionGrantsPlus, type SubscriptionSnapshot } from "@/lib/subscription/status";

/**
 * Paid-feature gate. Plus is decided ONLY by the family account behind the signed-in
 * reader (signed ckc_family / ckc_reader session -> familyAccountId): an active Stripe
 * Subscription row or the family's email in PAID_PREVIEW_EMAILS (comma-separated).
 * Admin sessions never grant Plus. Sub profiles inherit their parent family's plan.
 * Server-only: always re-check in API routes. Never cache across requests/users.
 */
export function paidPreviewEmails(): Set<string> {
  const raw = process.env.PAID_PREVIEW_EMAILS ?? "";
  return new Set(
    raw
      .split(/[,\s]+/)
      .map((e) => e.trim().toLowerCase())
      .filter((e) => e.includes("@")),
  );
}

async function familyEmail(familyAccountId: string): Promise<string | null> {
  const row = await prisma.familyAccount.findUnique({
    where: { id: familyAccountId },
    select: { email: true },
  });
  return row?.email?.trim().toLowerCase() ?? null;
}

/** Single source of truth for a family's plan (used by paywalls, /account and the header badge). */
export async function resolveFamilyPlus(
  familyAccountId: string,
): Promise<{ isPlus: boolean; source: "stripe" | "preview" | "free"; sub: Awaited<ReturnType<typeof getFamilySubscription>> }> {
  const sub = await getFamilySubscription(familyAccountId);
  if (sub.grantsPlus) return { isPlus: true, source: "stripe", sub };
  const allow = paidPreviewEmails();
  if (allow.size > 0) {
    const email = await familyEmail(familyAccountId);
    if (email && allow.has(email)) return { isPlus: true, source: "preview", sub };
  }
  return { isPlus: false, source: "free", sub };
}

export async function hasPaidFeatures(key: ReaderKey | null): Promise<boolean> {
  if (!key || key.type === "guest") return false;
  const familyAccountId = await familyAccountIdForReader(key);
  if (!familyAccountId) return false;
  return (await resolveFamilyPlus(familyAccountId)).isPlus;
}

// ─── Stripe subscription (billing owner = parent FamilyAccount) ─────────────

/** Billing owner for any signed-in reader; child profiles resolve to their parent. */
export async function familyAccountIdForReader(key: ReaderKey | null): Promise<string | null> {
  if (!key || key.type === "guest") return null;
  if (key.type === "owner") return key.familyAccountId;
  const row = await prisma.subProfile.findUnique({
    where: { id: key.subProfileId },
    select: { familyAccountId: true },
  });
  return row?.familyAccountId ?? null;
}

/** Most relevant subscription for a family (latest period end first). */
export async function getFamilySubscription(familyAccountId: string) {
  const customer = await prisma.billingCustomer
    .findUnique({
    where: { familyAccountId },
    select: {
      stripeCustomerId: true,
      subscriptions: {
        orderBy: [{ currentPeriodEnd: { sort: "desc", nulls: "last" } }, { updatedAt: "desc" }],
        select: {
          stripeSubscriptionId: true,
          status: true,
          priceId: true,
          currentPeriodEnd: true,
          cancelAtPeriodEnd: true,
          pastDueSince: true,
        },
      },
    },
    })
    // Billing tables may not exist yet (e.g. preview deploys before the migration runs).
    .catch((err: unknown) => {
      console.error("[billing] subscription lookup failed", err);
      return null;
    });
  if (!customer) return { customer: null, subscription: null, grantsPlus: false };
  const granting = customer.subscriptions.find((s) => subscriptionGrantsPlus(s as SubscriptionSnapshot));
  const subscription = granting ?? customer.subscriptions[0] ?? null;
  return {
    customer: { stripeCustomerId: customer.stripeCustomerId },
    subscription,
    grantsPlus: Boolean(granting),
  };
}

export async function hasActiveSubscription(familyAccountId: string): Promise<boolean> {
  return (await getFamilySubscription(familyAccountId)).grantsPlus;
}

/** Plan summary for the parent's /account page and /subscribe. Email is re-read from the DB, not trusted from the caller. */
export async function getFamilyPlan(familyAccountId: string) {
  const { isPlus, source, sub } = await resolveFamilyPlus(familyAccountId);
  const { customer, subscription } = sub;
  return {
    isPlus,
    source,
    hasCustomer: Boolean(customer),
    status: subscription?.status ?? null,
    currentPeriodEnd: subscription?.currentPeriodEnd ?? null,
    cancelAtPeriodEnd: subscription?.cancelAtPeriodEnd ?? false,
  };
}

export const PLUS_REQUIRED_MESSAGE = "This feature needs Catholic Kids Crafts Plus. Upgrade at /subscribe.";

/** 402 response for API routes behind Plus. */
export function plusRequiredResponse() {
  return Response.json({ error: PLUS_REQUIRED_MESSAGE, upgradeUrl: "/subscribe" }, { status: 402 });
}

/** Paywall for parent-only API routes that only have a family session. */
export async function familyHasPlus(familyAccountId: string): Promise<boolean> {
  return (await resolveFamilyPlus(familyAccountId)).isPlus;
}
