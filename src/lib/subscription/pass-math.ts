/** Pure Plus pass rules (no DB / server imports) so they can be unit-checked. */

export type PassPlan = "month" | "year";

export const PASS_PLANS: readonly PassPlan[] = ["month", "year"] as const;

/** Expected one-time prices (USD cents). Checkout refuses a Stripe price that doesn't match. */
export const PASS_PRICE_CENTS: Record<PassPlan, number> = { month: 599, year: 2999 };
export const PASS_CURRENCY = "usd";

export const DAY_MS = 24 * 60 * 60 * 1000;
/** Reminder emails go out this many days before the family's Plus ends. */
export const REMINDER_DAYS = [7, 1] as const;
/** On-site banner shows when Plus ends within this many days. */
export const EXPIRY_BANNER_DAYS = 7;

export function isPassPlan(v: unknown): v is PassPlan {
  return v === "month" || v === "year";
}

/** Calendar add in UTC; the day clamps to the last day of a shorter month (Jan 31 + 1 month = Feb 28/29). */
export function addPlanDuration(start: Date, plan: PassPlan): Date {
  const months = plan === "year" ? 12 : 1;
  const y = start.getUTCFullYear();
  const m = start.getUTCMonth() + months;
  const targetY = y + Math.floor(m / 12);
  const targetM = m % 12;
  const lastDay = new Date(Date.UTC(targetY, targetM + 1, 0)).getUTCDate();
  const d = Math.min(start.getUTCDate(), lastDay);
  return new Date(
    Date.UTC(
      targetY,
      targetM,
      d,
      start.getUTCHours(),
      start.getUTCMinutes(),
      start.getUTCSeconds(),
      start.getUTCMilliseconds(),
    ),
  );
}

export type PassWindow = { startsAt: Date; expiresAt: Date; revokedAt: Date | null };

/** A pass grants Plus while startsAt <= now < expiresAt and it was not refunded. */
export function passIsActive(p: PassWindow, now: Date = new Date()): boolean {
  return !p.revokedAt && p.startsAt.getTime() <= now.getTime() && now.getTime() < p.expiresAt.getTime();
}

/** When a newly bought pass starts: right away, or when the family's latest live pass ends (stacking). */
export function nextPassStart(existing: PassWindow[], now: Date = new Date()): Date {
  let start = now.getTime();
  for (const p of existing) {
    if (p.revokedAt) continue;
    if (p.expiresAt.getTime() > start) start = p.expiresAt.getTime();
  }
  return new Date(start);
}

/** End of the family's Plus across stacked passes (null when none is active now). */
export function plusEndsAt(passes: PassWindow[], now: Date = new Date()): Date | null {
  const live = passes.filter((p) => !p.revokedAt && p.expiresAt.getTime() > now.getTime());
  if (!live.some((p) => passIsActive(p, now))) return null;
  return new Date(Math.max(...live.map((p) => p.expiresAt.getTime())));
}

/**
 * After a refund removes a pass, close the gap: passes that haven't started yet move up so
 * they follow on directly (keeping their own length). Running passes are left alone.
 * Input/output are in purchase order; returns only the passes whose window changed.
 */
export function rechainPasses<T extends PassWindow & { id: string }>(
  passes: T[],
  now: Date = new Date(),
): { id: string; startsAt: Date; expiresAt: Date }[] {
  const live = passes
    .filter((p) => !p.revokedAt && p.expiresAt.getTime() > now.getTime())
    .sort((a, b) => a.startsAt.getTime() - b.startsAt.getTime());
  const changed: { id: string; startsAt: Date; expiresAt: Date }[] = [];
  let cursor = now.getTime();
  for (const p of live) {
    if (p.startsAt.getTime() <= now.getTime()) {
      cursor = Math.max(cursor, p.expiresAt.getTime());
      continue;
    }
    const length = p.expiresAt.getTime() - p.startsAt.getTime();
    const start = cursor;
    const end = start + length;
    if (start !== p.startsAt.getTime()) {
      changed.push({ id: p.id, startsAt: new Date(start), expiresAt: new Date(end) });
    }
    cursor = end;
  }
  return changed;
}

/** Whole days left, rounded up (ends in 2h -> 1 day). */
export function daysLeft(endsAt: Date, now: Date = new Date()): number {
  return Math.max(0, Math.ceil((endsAt.getTime() - now.getTime()) / DAY_MS));
}

/**
 * Which reminder (if any) is due for a pass that is the family's last one.
 * 7-day email: ends in (1, 7] days. 1-day email: ends within the next day.
 */
export function reminderDue(endsAt: Date, now: Date = new Date()): 7 | 1 | null {
  const ms = endsAt.getTime() - now.getTime();
  if (ms <= 0) return null;
  if (ms <= 1 * DAY_MS) return 1;
  if (ms <= 7 * DAY_MS) return 7;
  return null;
}
