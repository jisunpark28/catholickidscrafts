export const PLUS_PRICE_LABEL = "CA$5.99";
export const PLUS_ANNUAL_PRICE_LABEL = "CA$55";

export type PlanInterval = "month" | "year";

export const PLAN_OPTIONS: Record<PlanInterval, { name: string; price: string; unit: string; billed: string; cta: string }> = {
  month: { name: "Monthly", price: PLUS_PRICE_LABEL, unit: "/month", billed: "billed monthly", cta: "Subscribe monthly" },
  year: { name: "Yearly", price: PLUS_ANNUAL_PRICE_LABEL, unit: "/year", billed: "billed yearly", cta: "Subscribe yearly" },
};

export const PLAN_FEATURES: { label: string; plus: boolean }[] = [
  { label: "Bible typing", plus: false },
  { label: "Memos", plus: true },
  { label: "Catechism activities", plus: true },
  { label: "Custom sheets", plus: true },
];

export function formatPlanDate(d: Date): string {
  return d.toLocaleDateString("en-CA", { year: "numeric", month: "long", day: "numeric", timeZone: "America/Toronto" });
}

/** "Renews on ..." / "Plus until ..." line for a Stripe-backed plan. */
export function planRenewalLine(plan: {
  source: string;
  status: string | null;
  currentPeriodEnd: Date | null;
  cancelAtPeriodEnd: boolean;
}): string | null {
  if (plan.source !== "stripe" || !plan.currentPeriodEnd) return null;
  const date = formatPlanDate(plan.currentPeriodEnd);
  if (plan.status === "PAST_DUE") return "Payment failed - please update your card to keep Plus.";
  if (plan.cancelAtPeriodEnd || plan.status === "CANCELED") return `Canceled - Plus until ${date}`;
  return `Renews on ${date}`;
}
