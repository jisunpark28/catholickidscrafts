import { daysLeft } from "@/lib/subscription/pass-math";

export const PLUS_PRICE_LABEL = "US$5.99";
export const PLUS_ANNUAL_PRICE_LABEL = "US$29.99";
/** Short "from" price for upsells (the 1-month pass). */
export const PLUS_FROM_LABEL = `from ${PLUS_PRICE_LABEL}`;
export const ONE_TIME_LINE = "One-time payment. No auto-renew.";

export type PlanInterval = "month" | "year";

export const PLAN_OPTIONS: Record<PlanInterval, { name: string; price: string; unit: string; billed: string; cta: string }> = {
  month: { name: "1 month", price: PLUS_PRICE_LABEL, unit: " / 1 month", billed: "one-time payment", cta: "Get 1 month" },
  year: { name: "1 year", price: PLUS_ANNUAL_PRICE_LABEL, unit: " / 1 year", billed: "one-time payment", cta: "Get 1 year" },
};

export const PLAN_FEATURES: { label: string; plus: boolean }[] = [
  { label: "Bible typing", plus: false },
  { label: "Memos", plus: true },
  { label: "Catechism activities", plus: true },
];

export function formatPlanDate(d: Date): string {
  return d.toLocaleDateString("en-CA", { year: "numeric", month: "long", day: "numeric", timeZone: "America/Toronto" });
}

/** "Plus until ... (N days left)" for a pass; legacy "Renews on ..." lines for an old subscription. */
export function planRenewalLine(plan: {
  source: string;
  passEndsAt?: Date | null;
  status: string | null;
  currentPeriodEnd: Date | null;
  cancelAtPeriodEnd: boolean;
}): string | null {
  if (plan.source === "pass" && plan.passEndsAt) {
    const n = daysLeft(plan.passEndsAt);
    return `Plus until ${formatPlanDate(plan.passEndsAt)} (${n} ${n === 1 ? "day" : "days"} left)`;
  }
  if (plan.source !== "stripe" || !plan.currentPeriodEnd) return null;
  const date = formatPlanDate(plan.currentPeriodEnd);
  if (plan.status === "PAST_DUE") return "Payment failed - please update your card to keep Plus.";
  if (plan.cancelAtPeriodEnd || plan.status === "CANCELED") return `Canceled - Plus until ${date}`;
  return `Renews on ${date}`;
}
