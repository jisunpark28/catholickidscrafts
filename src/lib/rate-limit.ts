import { prisma } from "@/lib/prisma";

/**
 * DB-backed failure counter for sign-in endpoints (shared across serverless
 * instances, unlike an in-memory Map). One row per key in "AuthRateLimit".
 */
export type RateLimitRule = {
  /** Failures allowed inside the window before blocking. */
  max: number;
  windowMs: number;
  blockMs: number;
};

export type RateLimitState = {
  blocked: boolean;
  retryAfterSec: number;
  failures: number;
};

const OPEN: RateLimitState = { blocked: false, retryAfterSec: 0, failures: 0 };

function retryAfter(until: Date | null, now: number): number {
  if (!until) return 0;
  const ms = until.getTime() - now;
  return ms > 0 ? Math.max(1, Math.ceil(ms / 1000)) : 0;
}

/** Is any of these keys currently blocked? Fails open if the DB is unreachable. */
export async function getRateLimitState(keys: string[]): Promise<RateLimitState> {
  const now = Date.now();
  try {
    const rows = await prisma.authRateLimit.findMany({
      where: { key: { in: keys } },
      select: { blockedUntil: true, failures: true },
    });
    let wait = 0;
    let failures = 0;
    for (const row of rows) {
      wait = Math.max(wait, retryAfter(row.blockedUntil, now));
      failures = Math.max(failures, row.failures);
    }
    return { blocked: wait > 0, retryAfterSec: wait, failures };
  } catch (e) {
    console.error("rate limit read", e);
    return OPEN;
  }
}

/** Count one failure for `key`; blocks the key once `rule.max` is reached inside the window. */
export async function recordRateLimitFailure(
  key: string,
  rule: RateLimitRule,
): Promise<RateLimitState> {
  const nowMs = Date.now();
  const now = new Date(nowMs);
  const windowCutoff = new Date(nowMs - rule.windowMs);
  try {
    const rows = await prisma.$queryRaw<{ failures: number }[]>`
      INSERT INTO "AuthRateLimit" ("key", "failures", "windowStart", "blockedUntil", "updatedAt")
      VALUES (${key}, 1, ${now}, NULL, ${now})
      ON CONFLICT ("key") DO UPDATE SET
        "failures" = CASE WHEN "AuthRateLimit"."windowStart" < ${windowCutoff}
                          THEN 1 ELSE "AuthRateLimit"."failures" + 1 END,
        "windowStart" = CASE WHEN "AuthRateLimit"."windowStart" < ${windowCutoff}
                             THEN ${now} ELSE "AuthRateLimit"."windowStart" END,
        "updatedAt" = ${now}
      RETURNING "failures"`;
    const failures = Number(rows[0]?.failures ?? 1);
    let blockedUntil: Date | null = null;
    if (failures >= rule.max) {
      blockedUntil = new Date(nowMs + rule.blockMs);
      await prisma.authRateLimit.update({ where: { key }, data: { blockedUntil } });
    }
    if (Math.random() < 0.02) void pruneRateLimits();
    return { blocked: blockedUntil !== null, retryAfterSec: retryAfter(blockedUntil, nowMs), failures };
  } catch (e) {
    console.error("rate limit write", e);
    return OPEN;
  }
}

export async function clearRateLimit(keys: string[]): Promise<void> {
  try {
    await prisma.authRateLimit.deleteMany({ where: { key: { in: keys } } });
  } catch (e) {
    console.error("rate limit clear", e);
  }
}

async function pruneRateLimits(): Promise<void> {
  try {
    await prisma.authRateLimit.deleteMany({
      where: { updatedAt: { lt: new Date(Date.now() - 24 * 60 * 60 * 1000) } },
    });
  } catch {
    /* best effort */
  }
}

/** Child Access ID sign-in: 10 failures per IP in 15 minutes, then 15 minutes blocked. */
export const READER_LOGIN_RULE: RateLimitRule = {
  max: 10,
  windowMs: 15 * 60 * 1000,
  blockMs: 15 * 60 * 1000,
};

/** Parent Google sign-in callback: 30 attempts per IP in 15 minutes. */
export const GOOGLE_LOGIN_RULE: RateLimitRule = {
  max: 30,
  windowMs: 15 * 60 * 1000,
  blockMs: 15 * 60 * 1000,
};
