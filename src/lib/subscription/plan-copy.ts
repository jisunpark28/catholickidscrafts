export const PLUS_PRICE_LABEL = "CA$9.99";

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
