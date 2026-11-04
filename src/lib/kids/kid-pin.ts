/**
 * Kid PIN hashing, verification and lockout steps for Mom's Bible child sign-in.
 * - The hash is bcrypt (cost 10) of "<SubProfile.id>:<PIN>", so a new Kid Code keeps the PIN.
 * - verifyKidPin always runs exactly one bcrypt compare (a dummy hash when the child has no PIN
 *   or the code is unknown), so response time doesn't tell whether a code exists.
 * - Lockout (per child): from 5 failures every wrong PIN locks sign-in for a while
 *   (5-9: 1 min, 10-14: 15 min, 15-19: 1 h); 20 failures disable the PIN until a parent resets it.
 * No DB access here (the routes do that), so this file is safe to import in tests.
 */
import bcrypt from "bcryptjs";
import { randomBytes } from "crypto";

export const PIN_BCRYPT_COST = 10;
export const PIN_DISABLE_AT = 20;
/** Failure count at which the parents get a security email. */
export const PIN_ALERT_AT = 15;

/** Lock length by failure count (highest matching step wins). */
export const PIN_LOCK_STEPS: ReadonlyArray<{ from: number; ms: number }> = [
  { from: 15, ms: 60 * 60 * 1000 },
  { from: 10, ms: 15 * 60 * 1000 },
  { from: 5, ms: 60 * 1000 },
];

function hashInput(childId: string, pin: string): string {
  return `${childId}:${pin}`;
}

/** Hash a PIN that already passed checkPinForChild (pin-policy.ts). Throws on a malformed PIN. */
export async function hashKidPin(childId: string, pin: string): Promise<string> {
  if (!childId || !/^\d{4}$/.test(pin)) throw new Error("Invalid PIN");
  return bcrypt.hash(hashInput(childId, pin), PIN_BCRYPT_COST);
}

let dummyHash: Promise<string> | null = null;
/** A bcrypt hash of a random secret nobody knows (same cost as real PIN hashes). */
function getDummyHash(): Promise<string> {
  if (!dummyHash) {
    dummyHash = bcrypt.hash(randomBytes(32).toString("hex"), PIN_BCRYPT_COST);
  }
  return dummyHash;
}

/**
 * True only when `hash` is a real hash and the PIN matches. Always does one bcrypt compare
 * (bcrypt's compare is constant-time over the hash bytes).
 */
export async function verifyKidPin(
  childId: string | null,
  pin: string,
  hash: string | null | undefined,
): Promise<boolean> {
  const wellFormed = /^\d{4}$/.test(pin) && Boolean(childId);
  const target = hash && wellFormed ? hash : await getDummyHash();
  const ok = await bcrypt.compare(hashInput(childId ?? "", pin), target);
  return ok && Boolean(hash) && wellFormed;
}

export type PinBlock = "no-pin" | "disabled" | "locked" | null;

/** Why this child can't sign in right now (null = may try a PIN). */
export function pinLoginBlock(
  sub: { pinHash: string | null; pinDisabledAt: Date | null; pinLockedUntil: Date | null },
  now: Date,
): PinBlock {
  if (!sub.pinHash) return "no-pin";
  if (sub.pinDisabledAt) return "disabled";
  if (sub.pinLockedUntil && sub.pinLockedUntil.getTime() > now.getTime()) return "locked";
  return null;
}

export type PinFailureOutcome = {
  failCount: number;
  lockedUntil: Date | null;
  disabled: boolean;
  /** Email the linked parents: "locked" at PIN_ALERT_AT, "disabled" at PIN_DISABLE_AT. */
  alert: "locked" | "disabled" | null;
};

/** What a wrong PIN does, given the failure count *after* this failure. */
export function pinFailureOutcome(failCount: number, now: Date): PinFailureOutcome {
  if (failCount >= PIN_DISABLE_AT) {
    return {
      failCount,
      lockedUntil: null,
      disabled: true,
      alert: failCount === PIN_DISABLE_AT ? "disabled" : null,
    };
  }
  const step = PIN_LOCK_STEPS.find((s) => failCount >= s.from);
  return {
    failCount,
    lockedUntil: step ? new Date(now.getTime() + step.ms) : null,
    disabled: false,
    alert: failCount === PIN_ALERT_AT ? "locked" : null,
  };
}

/** Status shown to the parent in Account -> Children. */
export type KidPinStatus = "not_set" | "set" | "locked" | "disabled";

export function kidPinStatus(
  sub: { pinHash: string | null; pinDisabledAt: Date | null; pinLockedUntil: Date | null },
  now: Date,
): KidPinStatus {
  const block = pinLoginBlock(sub, now);
  if (block === "no-pin") return "not_set";
  if (block === "disabled") return "disabled";
  if (block === "locked") return "locked";
  return "set";
}
