/** Pure entitlement rules (no DB / server imports) so they can be unit-checked. */

export const PAST_DUE_GRACE_DAYS = 7;
const DAY_MS = 24 * 60 * 60 * 1000;

export type SubscriptionSnapshot = {
  status:
    | "ACTIVE"
    | "TRIALING"
    | "PAST_DUE"
    | "CANCELED"
    | "INCOMPLETE"
    | "INCOMPLETE_EXPIRED"
    | "UNPAID"
    | "PAUSED";
  currentPeriodEnd: Date | null;
  cancelAtPeriodEnd: boolean;
  pastDueSince: Date | null;
};

/**
 * Plus is granted for ACTIVE / TRIALING (also when cancelAtPeriodEnd, until the period ends),
 * PAST_DUE within a 7-day grace window, and CANCELED until the paid period ends.
 */
export function subscriptionGrantsPlus(s: SubscriptionSnapshot, now: Date = new Date()): boolean {
  const beforePeriodEnd = !s.currentPeriodEnd || s.currentPeriodEnd.getTime() > now.getTime();
  switch (s.status) {
    case "ACTIVE":
    case "TRIALING":
      return s.cancelAtPeriodEnd ? beforePeriodEnd : true;
    case "PAST_DUE": {
      const since = s.pastDueSince ?? s.currentPeriodEnd;
      if (!since) return true;
      return now.getTime() - since.getTime() < PAST_DUE_GRACE_DAYS * DAY_MS;
    }
    case "CANCELED":
      return Boolean(s.currentPeriodEnd && s.currentPeriodEnd.getTime() > now.getTime());
    default:
      return false;
  }
}

/** Statuses that mean the family already has a live Stripe subscription (block a 2nd checkout). */
export function isLiveStripeStatus(status: SubscriptionSnapshot["status"]): boolean {
  return status === "ACTIVE" || status === "TRIALING" || status === "PAST_DUE" || status === "UNPAID" || status === "PAUSED";
}
