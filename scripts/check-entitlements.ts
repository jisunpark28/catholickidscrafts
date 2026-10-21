// Run: node_modules\.bin\tsx scripts/check-entitlements.ts
import assert from "node:assert/strict";
import { subscriptionGrantsPlus, type SubscriptionSnapshot } from "../src/lib/subscription/status";

const now = new Date("2026-10-20T12:00:00Z");
const day = 86_400_000;
const at = (d: number) => new Date(now.getTime() + d * day);
const s = (o: Partial<SubscriptionSnapshot>): SubscriptionSnapshot => ({
  status: "ACTIVE",
  currentPeriodEnd: at(20),
  cancelAtPeriodEnd: false,
  pastDueSince: null,
  ...o,
});

const cases: [string, SubscriptionSnapshot, boolean][] = [
  ["active", s({}), true],
  ["trialing", s({ status: "TRIALING" }), true],
  ["active, cancel at period end, before end", s({ cancelAtPeriodEnd: true }), true],
  ["active, cancel at period end, after end", s({ cancelAtPeriodEnd: true, currentPeriodEnd: at(-1) }), false],
  ["past_due 3 days", s({ status: "PAST_DUE", pastDueSince: at(-3) }), true],
  ["past_due 8 days", s({ status: "PAST_DUE", pastDueSince: at(-8) }), false],
  ["canceled before period end", s({ status: "CANCELED", currentPeriodEnd: at(5) }), true],
  ["canceled after period end", s({ status: "CANCELED", currentPeriodEnd: at(-1) }), false],
  ["incomplete", s({ status: "INCOMPLETE" }), false],
  ["unpaid", s({ status: "UNPAID" }), false],
];
for (const [name, snap, want] of cases) {
  assert.equal(subscriptionGrantsPlus(snap, now), want, name);
  console.log(`ok - ${name}`);
}
console.log(`${cases.length} entitlement checks passed`);
