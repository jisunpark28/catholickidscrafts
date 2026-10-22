import { getAdmin } from "@/lib/admin-auth";
import type { ReaderKey } from "@/lib/bible/reader";
import { prisma } from "@/lib/prisma";
import { subscriptionGrantsPlus, type SubscriptionSnapshot } from "@/lib/subscription/status";

/**
 * Paid-feature gate. There is no payment system yet, so this is false for everyone
 * except signed-in site admins and family accounts listed in PAID_PREVIEW_EMAILS
 * (comma-separated). Sub profiles inherit from their parent family account's email.
 * Server-only: always re-check in API routes.
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

async function isAdminSignedIn(): Promise<boolean> {
  try {
    // getAdmin() is DB-backed and refuses child-mode browsers.
    return Boolean(await getAdmin());
  } catch {
    return false;
  }
}

async function familyEmailForReader(key: ReaderKey): Promise<string | null> {
  if (key.type === "owner") {
    const row = await prisma.familyAccount.findUnique({
      where: { id: key.familyAccountId },
      select: { email: true },
    });
    return row?.email?.toLowerCase() ?? null;
  }
  if (key.type === "sub") {
    const row = await prisma.subProfile.findUnique({
      where: { id: key.subProfileId },
      select: { familyAccount: { select: { email: true } } },
    });
    return row?.familyAccount.email?.toLowerCase() ?? null;
  }
  return null;
}

export async function hasPaidFeatures(key: ReaderKey | null): Promise<boolean> {
  if (await isAdminSignedIn()) return true;
  if (!key || key.type === "guest") return false;
  const familyAccountId = await familyAccountIdForReader(key);
  if (familyAccountId && (await hasActiveSubscription(familyAccountId))) return true;
  const allow = paidPreviewEmails();
  if (allow.size === 0) return false;
  const email = await familyEmailForReader(key);
  return Boolean(email && allow.has(email));
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

/** Plan summary for the parent's /account page and /subscribe. */
export async function getFamilyPlan(familyAccountId: string, email: string) {
  const { customer, subscription, grantsPlus } = await getFamilySubscription(familyAccountId);
  const preview = paidPreviewEmails().has(email.toLowerCase());
  return {
    isPlus: grantsPlus || preview,
    source: grantsPlus ? ("stripe" as const) : preview ? ("preview" as const) : ("free" as const),
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
  return hasPaidFeatures({ type: "owner", familyAccountId });
}
