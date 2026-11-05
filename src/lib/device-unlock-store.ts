import { newestUnlockNonce, unlockCurrentPrefix } from "@/lib/device-unlock";
import { prisma } from "@/lib/prisma";

/**
 * Which emailed unlock code is still usable, kept in "AuthRateLimit" rows keyed
 * "unlock-current:<familyAccountId>:<nonce>" (the code itself is never stored).
 * Only the newest row counts; using a code deletes every row for the family.
 */

/** A new code was issued: void all earlier codes of this family. Throws on DB errors (do not send then). */
export async function recordIssuedUnlockChallenge(familyAccountId: string, nonce: string): Promise<void> {
  const prefix = unlockCurrentPrefix(familyAccountId);
  const now = new Date();
  await prisma.$transaction([
    prisma.authRateLimit.deleteMany({ where: { key: { startsWith: prefix } } }),
    prisma.authRateLimit.create({
      data: { key: `${prefix}${nonce}`, failures: 0, windowStart: now, blockedUntil: null, updatedAt: now },
    }),
  ]);
}

/** True only when this is the family's newest unused code. Fails closed. */
export async function isCurrentUnlockChallenge(familyAccountId: string, nonce: string): Promise<boolean> {
  const prefix = unlockCurrentPrefix(familyAccountId);
  try {
    const rows = await prisma.authRateLimit.findMany({
      where: { key: { startsWith: prefix } },
      select: { key: true, windowStart: true },
    });
    return newestUnlockNonce(rows, prefix) === nonce;
  } catch (e) {
    console.error("unlock challenge read", e);
    return false;
  }
}

/**
 * Use a code: atomically remove its row (only one request can win), then void any other
 * codes of the family. False when it was already used or replaced. Fails closed.
 */
export async function consumeUnlockChallenge(familyAccountId: string, nonce: string): Promise<boolean> {
  const prefix = unlockCurrentPrefix(familyAccountId);
  try {
    const { count } = await prisma.authRateLimit.deleteMany({ where: { key: `${prefix}${nonce}` } });
    await prisma.authRateLimit.deleteMany({ where: { key: { startsWith: prefix } } });
    return count === 1;
  } catch (e) {
    console.error("unlock challenge consume", e);
    return false;
  }
}
