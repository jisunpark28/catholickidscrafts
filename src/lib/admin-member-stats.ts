import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { PAST_DUE_GRACE_DAYS } from "@/lib/subscription/status";

const DAY_MS = 24 * 60 * 60 * 1000;

export type MemberStats = {
  totalSignups: number;
  newSignups7Days: number;
  paidMembers: number;
};

/**
 * Same rules as subscriptionGrantsPlus (src/lib/subscription/status.ts), as a DB filter:
 * ACTIVE / TRIALING (with cancelAtPeriodEnd only until the period ends), PAST_DUE within
 * the 7-day grace window, and CANCELED until the paid period ends.
 */
function subscriptionGrantsPlusWhere(now: Date): Prisma.SubscriptionWhereInput {
  const graceStart = new Date(now.getTime() - PAST_DUE_GRACE_DAYS * DAY_MS);
  return {
    OR: [
      {
        status: { in: ["ACTIVE", "TRIALING"] },
        OR: [{ cancelAtPeriodEnd: false }, { currentPeriodEnd: null }, { currentPeriodEnd: { gt: now } }],
      },
      {
        status: "PAST_DUE",
        OR: [
          { pastDueSince: { gt: graceStart } },
          { pastDueSince: null, currentPeriodEnd: null },
          { pastDueSince: null, currentPeriodEnd: { gt: graceStart } },
        ],
      },
      { status: "CANCELED", currentPeriodEnd: { gt: now } },
    ],
  };
}

/**
 * Admin dashboard counts. Server-only, read-only, numbers only (no emails, names or ids).
 * Paid = distinct family accounts with a running, non-refunded PlusPass (same rule as
 * passIsActive) OR a Stripe subscription that currently grants Plus. Counting FamilyAccount
 * rows with an OR filter means an account with both is counted once.
 */
export async function getMemberStats(now: Date = new Date()): Promise<MemberStats | null> {
  const weekAgo = new Date(now.getTime() - 7 * DAY_MS);
  try {
    const [totalSignups, newSignups7Days, paidMembers] = await Promise.all([
      prisma.familyAccount.count(),
      prisma.familyAccount.count({ where: { createdAt: { gte: weekAgo } } }),
      prisma.familyAccount.count({
        where: {
          OR: [
            { plusPasses: { some: { revokedAt: null, startsAt: { lte: now }, expiresAt: { gt: now } } } },
            { billingCustomer: { is: { subscriptions: { some: subscriptionGrantsPlusWhere(now) } } } },
          ],
        },
      }),
    ]);
    return { totalSignups, newSignups7Days, paidMembers };
  } catch (err) {
    console.error("[admin] member stats failed", err instanceof Error ? err.message : "unknown error");
    return null;
  }
}
