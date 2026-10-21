/**
 * Throttle for admin credential sign-in, stored in the DB ("AuthRateLimit")
 * so it holds across serverless instances. No permanent lockout - windows expire.
 */
import {
  clearRateLimit,
  getRateLimitState,
  recordRateLimitFailure,
  type RateLimitRule,
} from "@/lib/rate-limit";

function maxIdentityFailures(): number {
  const raw = Number(process.env.ADMIN_LOGIN_MAX_FAILURES ?? 5);
  return Number.isFinite(raw) && raw >= 1 ? raw : 5;
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
  return `admin:id:${ip}|${email.trim().toLowerCase()}`;
}

function ipKey(ip: string): string {
  return `admin:ip:${ip}`;
}

function rules(): { identity: RateLimitRule; ip: RateLimitRule } {
  const base = { windowMs: windowMs(), blockMs: blockMs() };
  return {
    identity: { ...base, max: maxIdentityFailures() },
    ip: { ...base, max: maxIdentityFailures() * 4 },
  };
}

export type AdminLoginThrottle = {
  blocked: boolean;
  retryAfterSec: number;
  failures: number;
};

export async function getAdminLoginThrottle(ip: string, email: string): Promise<AdminLoginThrottle> {
  return getRateLimitState([identityKey(ip, email), ipKey(ip)]);
}

export async function recordAdminLoginFailure(ip: string, email: string): Promise<AdminLoginThrottle> {
  const r = rules();
  const [identity, ipState] = await Promise.all([
    recordRateLimitFailure(identityKey(ip, email), r.identity),
    recordRateLimitFailure(ipKey(ip), r.ip),
  ]);
  return {
    blocked: identity.blocked || ipState.blocked,
    retryAfterSec: Math.max(identity.retryAfterSec, ipState.retryAfterSec),
    failures: identity.failures,
  };
}

export async function recordAdminLoginSuccess(ip: string, email: string): Promise<void> {
  await clearRateLimit([identityKey(ip, email), ipKey(ip)]);
}

/** Extra delay after several failures, before the block window. */
export function adminLoginFailureDelayMs(failures: number): number {
  if (failures < 3) return 0;
  return Math.min(2000, 250 * 2 ** (failures - 3));
}
