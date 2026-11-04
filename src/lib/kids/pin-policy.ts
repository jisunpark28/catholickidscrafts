/**
 * 4-digit PIN policy for Mom's Bible child sign-in (checked when a parent sets a PIN).
 * Rejects repeated digits (0000-9999), ascending/descending runs (0123, 1234, 4321, 9876),
 * simple patterns (1212, 1122) and a small list of very common PINs (incl. 1004).
 * Pure helper: no DB, no hashing (hashing lives with the sign-in code).
 */

export type PinCheck = { ok: true } | { ok: false; reason: PinRejectReason; message: string };

export type PinRejectReason = "format" | "repeated" | "sequence" | "pattern" | "common";

/** Very common PINs that the rules below don't already catch. */
export const COMMON_PINS: ReadonlySet<string> = new Set([
  "1004", // "천사" (angel), very common with Korean families
  "2580", // keypad column
  "0852", // keypad column, reversed
  "1379", // keypad corners
  "1397",
  "7777",
  "1010",
  "2000",
  "2020",
  "1999",
  "6969",
  "4200",
  "1984",
  "0007",
  "1001",
  "0101",
  "1314",
  "5683", // "LOVE" on a phone keypad
  "1470", // keypad column with 0
  "0741",
]);

const MESSAGES: Record<PinRejectReason, string> = {
  format: "The PIN must be exactly 4 digits.",
  repeated: "Please don't use the same digit four times (like 1111).",
  sequence: "Please don't use digits in a row (like 1234 or 4321).",
  pattern: "That PIN is too easy to guess (like 1212 or 1122). Try a mix of digits.",
  common: "That PIN is very common and easy to guess. Please choose another one.",
};

function reject(reason: PinRejectReason): PinCheck {
  return { ok: false, reason, message: MESSAGES[reason] };
}

export function checkPin(pin: string): PinCheck {
  if (!/^\d{4}$/.test(pin)) return reject("format");
  const d = pin.split("").map(Number);
  if (d.every((x) => x === d[0])) return reject("repeated");
  const steps = d.slice(1).map((x, i) => x - d[i]!);
  if (steps.every((s) => s === 1) || steps.every((s) => s === -1)) return reject("sequence");
  // Wrap-around runs on a keypad row of digits: 7890, 8901, 9012, 0987, ...
  if (steps.every((s) => s === 1 || s === -9) || steps.every((s) => s === -1 || s === 9)) {
    return reject("sequence");
  }
  const [a, b, c, e] = pin;
  if ((a === c && b === e) || (a === b && c === e)) return reject("pattern"); // ABAB, AABB
  if (COMMON_PINS.has(pin)) return reject("common");
  return { ok: true };
}

export function isAcceptablePin(pin: string): boolean {
  return checkPin(pin).ok;
}
