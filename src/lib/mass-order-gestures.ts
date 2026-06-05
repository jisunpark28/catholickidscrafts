/** Client-safe Mass Order gesture ids (no Prisma). */
export const MASS_ORDER_GESTURES = [
  "idle",
  "signCross",
  "pray",
  "ourFather",
  "point",
  "hold",
  "lift",
] as const;

export type MassOrderGesture = (typeof MASS_ORDER_GESTURES)[number];

export function isValidMassGesture(gesture: string): boolean {
  return (MASS_ORDER_GESTURES as readonly string[]).includes(gesture);
}
