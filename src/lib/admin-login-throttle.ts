/**
 * Temporary throttle for admin credential sign-in.
 * In-memory (per instance). No permanent lockout — windows expire.
 */

type Bucket = {
  failures: number;
  windowStart: number;
  blockedUntil: number;
};

const store = new Map<string, Bucket>();

function maxIdentityFailures(): number {
  const raw = Number(process.env.ADMIN_LOGIN_MAX_FAILURES ?? 5);
  return Number.isFinite(raw) && raw >= 1 ? raw : 5;
}

function maxIpFailures(): number {
  return maxIdentityFailures() * 4;
}

function windowMs(): number {
  const raw = Number(process.env.ADMIN_LOGIN_WINDOW_MS ?? 15 * 60 * 1000);
  return Number.isFinite(raw) && raw >= 1000 ? raw : 15 * 60 * 1000;
}

function blockMs(): number {
  const raw = Number(process.env.ADMIN_LOGIN_BLOCK_MS ?? 15 * 60 * 1000);
  return Number.isFinite(raw) && raw >= 1000 ? raw : 15 * 60 * 1000;
}

function identityKey(ip: string, email: string): string {
  return `id:${ip}|${email.trim().toLowerCase()}`;
}

function ipKey(ip: string): string {
  return `ip:${ip}`;
}

function prune(now: number): void {
  for (const [key, bucket] of store) {
    if (bucket.blockedUntil < now && now - bucket.windowStart > windowMs()) {
      store.delete(key);
    }
  }
}

function readBucket(key: string, now: number): Bucket {
  const existing = store.get(key);
  if (!existing) {
    return { failures: 0, windowStart: now, blockedUntil: 0 };
  }
  if (existing.blockedUntil > now) return existing;
  if (now - existing.windowStart > windowMs()) {
    return { failures: 0, windowStart: now, blockedUntil: 0 };
  }
  return existing;
}

export type AdminLoginThrottle = {
  blocked: boolean;
  retryAfterSec: number;
};

export function getAdminLoginThrottle(ip: string, email: string, now = Date.now()): AdminLoginThrottle {
  prune(now);
  const identity = readBucket(identityKey(ip, email), now);
  const ipBucket = readBucket(ipKey(ip), now);
  const blockedUntil = Math.max(identity.blockedUntil, ipBucket.blockedUntil);
  if (blockedUntil > now) {
    return { blocked: true, retryAfterSec: Math.max(1, Math.ceil((blockedUntil - now) / 1000)) };
  }
  return { blocked: false, retryAfterSec: 0 };
}

export function recordAdminLoginFailure(ip: string, email: string, now = Date.now()): AdminLoginThrottle {
  prune(now);
  const bump = (key: string, max: number) => {
    const bucket = readBucket(key, now);
    bucket.failures += 1;
    if (bucket.failures === 1) bucket.windowStart = now;
    if (bucket.failures >= max) {
      bucket.blockedUntil = now + blockMs();
    }
    store.set(key, bucket);
    return bucket;
  };
  const identity = bump(identityKey(ip, email), maxIdentityFailures());
  const ipBucket = bump(ipKey(ip), maxIpFailures());
  const blockedUntil = Math.max(identity.blockedUntil, ipBucket.blockedUntil);
  if (blockedUntil > now) {
    return { blocked: true, retryAfterSec: Math.max(1, Math.ceil((blockedUntil - now) / 1000)) };
  }
  return { blocked: false, retryAfterSec: 0 };
}

export function recordAdminLoginSuccess(ip: string, email: string): void {
  store.delete(identityKey(ip, email));
  store.delete(ipKey(ip));
}

/** Extra delay after several failures, before the block window. */
export function adminLoginFailureDelayMs(ip: string, email: string, now = Date.now()): number {
  const identity = readBucket(identityKey(ip, email), now);
  if (identity.failures < 3) return 0;
  return Math.min(2000, 250 * 2 ** (identity.failures - 3));
}

export function resetAdminLoginThrottleForTests(): void {
  store.clear();
}
