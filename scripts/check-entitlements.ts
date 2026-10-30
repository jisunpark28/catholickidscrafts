// Run: node_modules\.bin\tsx scripts/check-entitlements.ts
import assert from "node:assert/strict";
import { subscriptionGrantsPlus, type SubscriptionSnapshot } from "../src/lib/subscription/status";
import {
  addPlanDuration,
  daysLeft,
  nextPassStart,
  passIsActive,
  plusEndsAt,
  rechainPasses,
  reminderDue,
} from "../src/lib/subscription/pass-math";

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

// ─── One-time Plus passes ───────────────────────────────────────────────

const iso = (d: Date) => d.toISOString();
const pass = (id: string, start: Date, end: Date, revokedAt: Date | null = null) => ({ id, startsAt: start, expiresAt: end, revokedAt });

assert.equal(iso(addPlanDuration(new Date("2026-01-31T10:00:00Z"), "month")), "2026-02-28T10:00:00.000Z", "Jan 31 + 1 month clamps");
assert.equal(iso(addPlanDuration(new Date("2026-12-15T00:00:00Z"), "month")), "2027-01-15T00:00:00.000Z", "Dec + 1 month rolls the year");
assert.equal(iso(addPlanDuration(new Date("2028-02-29T00:00:00Z"), "year")), "2029-02-28T00:00:00.000Z", "leap day + 1 year");
console.log("ok - plan durations");

const a = pass("a", at(-10), at(20));
assert.equal(iso(nextPassStart([], now)), iso(now), "no pass: starts now");
assert.equal(iso(nextPassStart([a], now)), iso(at(20)), "early purchase stacks after current pass");
assert.equal(iso(nextPassStart([pass("x", at(-40), at(-10))], now)), iso(now), "expired pass: starts now");
assert.equal(iso(nextPassStart([{ ...a, revokedAt: at(-1) }], now)), iso(now), "refunded pass does not delay");
console.log("ok - stacking");

assert.equal(passIsActive(a, now), true, "running pass active");
assert.equal(passIsActive({ ...a, revokedAt: at(-1) }, now), false, "refunded pass inactive");
assert.equal(passIsActive(pass("f", at(1), at(30)), now), false, "future pass not active yet");
const b = pass("b", at(20), at(50));
assert.equal(iso(plusEndsAt([a, b], now)!), iso(at(50)), "stacked end date");
assert.equal(plusEndsAt([pass("f", at(1), at(30))], now), null, "only future pass: no Plus now");
console.log("ok - active / ends at");

// Refund of the running pass: the stacked one moves up to start now, keeping its 30 days.
const moved = rechainPasses([{ ...a, revokedAt: now }, b], now);
assert.deepEqual(moved.map((m) => [m.id, iso(m.startsAt), iso(m.expiresAt)]), [["b", iso(now), iso(at(30))]], "rechain after refund");
assert.deepEqual(rechainPasses([a, b], now), [], "no change when contiguous");
console.log("ok - refund rechain");

assert.equal(daysLeft(at(6.5), now), 7, "6.5 days rounds up");
assert.equal(daysLeft(at(-1), now), 0, "ended");
assert.equal(reminderDue(at(6.5), now), 7, "7-day reminder window");
assert.equal(reminderDue(at(0.5), now), 1, "1-day reminder window");
assert.equal(reminderDue(at(8), now), null, "too early");
assert.equal(reminderDue(at(-0.1), now), null, "already ended");
console.log("ok - reminders");
console.log("pass checks passed");
