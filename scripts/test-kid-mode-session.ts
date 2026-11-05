/**
 * Child-mode cookies, Google re-auth decision, the emailed unlock code and the session
 * time limits (parent 30d rolling / 90d absolute, kid 7d, device lock 30d, admin 8h + 30 min idle,
 * PIN lockout from 5 failures) and the full reset every sign-out runs. No DB, fake clock where the code allows it.
 * Run: npx tsx scripts/test-kid-mode-session.ts
 */
process.env.AUTH_SECRET ||= "test-secret-for-kid-mode-session-checks-only";

import { SignJWT } from "jose";
import { NextResponse } from "next/server";
import {
  ADMIN_ACTIVITY_COOKIE,
  ADMIN_IDLE_TIMEOUT_SEC,
  ADMIN_SESSION_MAX_AGE_SEC,
  adminActivityCookieOptions,
  isAdminActivityPath,
  isAdminIdleExpired,
  isAdminLoginExpired,
  readAdminLastActivity,
  signAdminActivity,
} from "../src/lib/admin-session-policy";
import { authConfig } from "../src/auth.config";
import { readFileSync } from "fs";
import { join } from "path";
import { clearDeviceLockCookie } from "../src/lib/child-mode-cookies";
import {
  applySessionReset,
  AUTH_COOKIE_RE,
  CLEAR_SITE_DATA_COOKIES,
  CLEAR_SITE_DATA_HEADER,
  resetSessionOnResponse,
  sessionResetCookieSpecs,
} from "../src/lib/session-reset";
import {
  checkUnlockCode,
  createUnlockChallenge,
  DEVICE_UNLOCK_COOKIE,
  DEVICE_UNLOCK_PATH,
  DEVICE_UNLOCK_TTL_SEC,
  deviceUnlockCookieOptions,
  isFreshGoogleReauth,
  DEVICE_UNLOCK_MAX_TRIES,
  isUnlockCodeFormat,
  maskEmail,
  newestUnlockNonce,
  readUnlockChallenge,
  unlockCurrentPrefix,
} from "../src/lib/device-unlock";
import {
  DEVICE_LOCK_COOKIE,
  DEVICE_LOCK_MAX_AGE_SEC,
  deviceLockCookieOptions,
  FAMILY_SESSION_ABSOLUTE_MAX_SEC,
  FAMILY_SESSION_COOKIE,
  FAMILY_SESSION_MAX_AGE_SEC,
  familyCookieOptions,
  familySessionTimesValid,
  familyTokenExpiry,
  KID_SESSION_MAX_AGE_SEC,
  READER_SESSION_COOKIE,
  readerCookieOptions,
  signDeviceLock,
  signFamilySession,
  signReaderSession,
  verifyDeviceLock,
  verifyFamilySession,
  verifyReaderSession,
} from "../src/lib/family-session";
import { pinFailureOutcome } from "../src/lib/kids/kid-pin";
import { GOOGLE_FRESH_AUTH_MAX_AGE_SEC, GOOGLE_OAUTH_NONCE_COOKIE, GOOGLE_OAUTH_NONCE_PATH } from "../src/lib/google-oauth";

let failures = 0;
let checks = 0;
function check(name: string, ok: boolean, detail?: unknown) {
  checks++;
  if (!ok) {
    failures++;
    console.error(`FAIL ${name}`, detail ?? "");
  }
}

function cleared(res: NextResponse, name: string): boolean {
  const c = res.cookies.get(name);
  return Boolean(c && c.value === "" && c.maxAge === 0 && c.path === "/");
}

async function main() {
  // --- Cookie flags: every session cookie is HttpOnly, SameSite=Lax, host-only, path "/".
  for (const [label, opts] of [
    ["family", familyCookieOptions("x")],
    ["reader owner", readerCookieOptions("x", "owner")],
    ["reader sub", readerCookieOptions("x", "sub")],
    ["device lock", deviceLockCookieOptions("x")],
  ] as const) {
    check(`${label} httpOnly`, opts.httpOnly === true);
    check(`${label} sameSite lax`, opts.sameSite === "lax");
    check(`${label} path /`, opts.path === "/");
    check(`${label} no domain (host-only)`, !("domain" in opts));
    check(`${label} secure only off outside production`, opts.secure === (process.env.NODE_ENV === "production"));
  }
  check("family 30 days", familyCookieOptions("x").maxAge === 60 * 60 * 24 * 30);
  check("device lock 30 days", deviceLockCookieOptions("x").maxAge === 60 * 60 * 24 * 30);
  check("kid reader 7 days", readerCookieOptions("x", "sub").maxAge === 60 * 60 * 24 * 7);
  check("child-mode family cookie 7 days", familyCookieOptions("x", KID_SESSION_MAX_AGE_SEC).maxAge === 60 * 60 * 24 * 7);
  const u = deviceUnlockCookieOptions("x");
  check("unlock cookie httpOnly", u.httpOnly === true);
  check("unlock cookie strict", u.sameSite === "strict");
  check("unlock cookie path scoped", u.path === DEVICE_UNLOCK_PATH && u.name === DEVICE_UNLOCK_COOKIE);
  check("unlock cookie 10 min", u.maxAge === DEVICE_UNLOCK_TTL_SEC);
  check("oauth nonce cookie name", GOOGLE_OAUTH_NONCE_COOKIE === "ckc_oauth_nonce");

  // --- Clearing uses the same name + path the cookies were set with.
  {
    const res = NextResponse.json({});
    clearDeviceLockCookie(res);
    check("device lock clear", cleared(res, DEVICE_LOCK_COOKIE));
  }

  // --- Any sign-out is a full reset: every session cookie, the device lock included.
  {
    const present = [
      FAMILY_SESSION_COOKIE,
      READER_SESSION_COOKIE,
      DEVICE_LOCK_COOKIE,
      "ckc_some_future_cookie",
      "__Secure-authjs.session-token.0",
      "__Secure-authjs.session-token.1",
      "__Host-authjs.csrf-token",
      "other_site_cookie",
    ];
    const res = NextResponse.json({ ok: true });
    resetSessionOnResponse(res, present);
    const expired = (name: string, path = "/") => {
      const c = res.cookies.get(name);
      return Boolean(c && c.value === "" && c.maxAge === 0 && c.path === path && !("domain" in c && c.domain));
    };
    check("reset clears ckc_family", expired(FAMILY_SESSION_COOKIE));
    check("reset clears ckc_reader", expired(READER_SESSION_COOKIE));
    check("reset clears the device lock", expired(DEVICE_LOCK_COOKIE));
    check("reset clears ckc_unlock on its own path", expired(DEVICE_UNLOCK_COOKIE, DEVICE_UNLOCK_PATH));
    check("reset clears ckc_oauth_nonce on its own path", expired(GOOGLE_OAUTH_NONCE_COOKIE, GOOGLE_OAUTH_NONCE_PATH));
    check("nonce path is the Google route", GOOGLE_OAUTH_NONCE_PATH === "/api/auth/family/google");
    check("reset clears ckc_admin_activity", expired(ADMIN_ACTIVITY_COOKIE));
    check("reset clears guest/visitor/mb cookies", expired("ckc_bible_reader") && expired("ckc_vid") && expired("ckc_mb_child"));
    check("reset clears any other ckc_ cookie sent", expired("ckc_some_future_cookie"));
    check("reset clears Auth.js session + chunks", expired("authjs.session-token") && expired("__Secure-authjs.session-token") && expired("__Secure-authjs.session-token.0") && expired("__Secure-authjs.session-token.1"));
    check("reset clears legacy next-auth session", expired("next-auth.session-token") && expired("__Secure-next-auth.session-token"));
    check("reset clears Auth.js csrf/callback", expired("__Host-authjs.csrf-token") && expired("authjs.callback-url"));
    check("reset leaves other sites' cookies alone", res.cookies.get("other_site_cookie") === undefined);
    check("reset never writes a value", res.cookies.getAll().every((c) => c.value === "" && c.maxAge === 0));
    check("prefixed cookies cleared with Secure", res.cookies.getAll().filter((c) => /^__(Secure|Host)-/.test(c.name)).every((c) => c.secure === true));
    check("__Host- cleared on path / without domain", res.cookies.get("__Host-authjs.csrf-token")?.path === "/");
    check("reset sends Clear-Site-Data cookies", res.headers.get(CLEAR_SITE_DATA_HEADER) === CLEAR_SITE_DATA_COOKIES);
    check("reset response not cached", res.headers.get("Cache-Control") === "private, no-store");
    const setCookie = res.headers.getSetCookie();
    check("Set-Cookie for device lock expires it", setCookie.some((h) => h.startsWith(`${DEVICE_LOCK_COOKIE}=;`) && /Path=\/(;|$)/.test(h) && /Max-Age=0/i.test(h)));
    check("auth cookie regex", AUTH_COOKIE_RE.test("authjs.pkce.code_verifier") && !AUTH_COOKIE_RE.test("authjs") && !AUTH_COOKIE_RE.test("ckc_family"));
  }
  {
    // Same flags as when set (secure in production, strict for the unlock cookie).
    const env = process.env as Record<string, string | undefined>;
    const before = env.NODE_ENV;
    env.NODE_ENV = "production";
    try {
      const specs = new Map(sessionResetCookieSpecs().map((s) => [s.name, s]));
      check("prod: family cleared Secure", specs.get(FAMILY_SESSION_COOKIE)?.secure === true);
      check("prod: device lock cleared Secure+Lax", specs.get(DEVICE_LOCK_COOKIE)?.secure === true && specs.get(DEVICE_LOCK_COOKIE)?.sameSite === "lax");
      check("prod: unlock cleared Strict", specs.get(DEVICE_UNLOCK_COOKIE)?.sameSite === "strict" && specs.get(DEVICE_UNLOCK_COOKIE)?.secure === true);
      check("prod: unprefixed authjs cleared Secure", specs.get("authjs.session-token")?.secure === true);
      check("browser-set ckc_mb_child cleared like it was set", specs.get("ckc_mb_child")?.httpOnly === false && specs.get("ckc_mb_child")?.secure === false);
    } finally {
      env.NODE_ENV = before;
    }
  }
  {
    // Server actions use the cookies() store; the same writer works there.
    const written = new Map<string, { value: string; path: string; maxAge: number }>();
    applySessionReset({ set: (name, value, o) => written.set(name, { value, path: o.path, maxAge: o.maxAge }) }, ["ckc_x"]);
    check("action store gets the device lock cleared", written.get(DEVICE_LOCK_COOKIE)?.maxAge === 0);
    check("action store gets extra ckc_ cookie cleared", written.get("ckc_x")?.value === "");
  }
  {
    // Every sign-out entry point runs the full reset.
    const src = (p: string) => readFileSync(join(process.cwd(), p), "utf8");
    for (const p of [
      "src/app/api/auth/family/logout/route.ts",
      "src/app/api/auth/family/logout-all/route.ts",
      "src/app/api/auth/reader/logout/route.ts",
    ]) {
      const s = src(p);
      check(`${p} runs the full reset`, s.includes("resetSessionOnResponse(") && !/cookies\.set\(/.test(s));
    }
    const logoutAll = src("src/app/api/auth/family/logout-all/route.ts");
    check("logout-all resets even when the guard refuses", /if \(guard\.error\) \{\s*resetSessionOnResponse\(guard\.error/.test(logoutAll));
    const admin = src("src/app/admin/(dashboard)/page.tsx");
    check("admin sign-out runs the full reset before signOut", /applySessionReset\([\s\S]*?\);\s*await signOut\(/.test(admin));
    for (const p of ["src/components/HomeHubAccountMenu.tsx", "src/components/ReaderStatusBar.tsx", "src/components/FamilyLogoutButton.tsx"]) {
      const s = src(p);
      const posts = s.match(/fetch\("\/api\/auth\/(family|reader)\/logout(-all)?", \{ method: "POST" \}\)/g) ?? [];
      check(`${p} signs out through the server route`, posts.length > 0);
    }
  }

  // --- Signed tokens keep child mode.
  const famSub = await signFamilySession({
    familyAccountId: "fam1",
    email: "p@example.com",
    sessionVersion: 0,
    readerMode: { type: "sub", subProfileId: "kid1" },
  });
  const famSubV = await verifyFamilySession(famSub);
  check("family token keeps child mode", famSubV?.readerMode?.type === "sub");
  const lockTok = await signDeviceLock({ familyAccountId: "fam1", subProfileId: "kid1" });
  const lock = await verifyDeviceLock(lockTok);
  check("device lock verifies", lock?.familyAccountId === "fam1" && lock.subProfileId === "kid1");
  check("tampered lock rejected", (await verifyDeviceLock(lockTok.slice(0, -2) + "xx")) === null);

  // --- Google re-auth decision on a locked device.
  const now = 1_800_000_000;
  const base = {
    nowSec: now,
    idToken: { sub: "g1", nonce: "n1", authTime: now - 30 },
    profileGoogleId: "g1",
    accountGoogleId: "g1",
    stateNonce: "n1",
    boundNonce: "n1",
  };
  check("fresh password sign-in unlocks", isFreshGoogleReauth(base));
  check("old Google session stays child", !isFreshGoogleReauth({ ...base, idToken: { ...base.idToken, authTime: now - GOOGLE_FRESH_AUTH_MAX_AGE_SEC - 1 } }));
  check("missing auth_time stays child", !isFreshGoogleReauth({ ...base, idToken: { ...base.idToken, authTime: null } }));
  check("no id_token stays child", !isFreshGoogleReauth({ ...base, idToken: null }));
  check("future auth_time stays child", !isFreshGoogleReauth({ ...base, idToken: { ...base.idToken, authTime: now + 120 } }));
  check("nonce mismatch stays child", !isFreshGoogleReauth({ ...base, idToken: { ...base.idToken, nonce: "other" } }));
  check("missing id_token nonce stays child", !isFreshGoogleReauth({ ...base, idToken: { ...base.idToken, nonce: null } }));
  check("other browser (no bound nonce) stays child", !isFreshGoogleReauth({ ...base, boundNonce: null }));
  check("sub mismatch stays child", !isFreshGoogleReauth({ ...base, profileGoogleId: "g2" }));
  check("account mismatch stays child", !isFreshGoogleReauth({ ...base, accountGoogleId: "g2" }));

  // --- Emailed unlock code.
  const ref = { familyAccountId: "fam1", lockedAt: now - 3600 };
  const ch = await createUnlockChallenge(ref, now);
  check("code is 6 digits", isUnlockCodeFormat(ch.code), ch.code);
  check("token does not contain the code", !ch.token.includes(ch.code) || ch.code === "000000");
  const read = await readUnlockChallenge(ch.token, now);
  check("challenge hash is not the code", Boolean(read) && read!.hash !== ch.code);
  const ok = await checkUnlockCode(ch.token, ch.code, ref, now + 60);
  check("right code unlocks", ok.ok === true && ok.familyAccountId === "fam1", ok);
  const wrongCode = ch.code === "123456" ? "654321" : "123456";
  const bad = await checkUnlockCode(ch.token, wrongCode, ref, now + 60);
  check("wrong code rejected", !bad.ok && bad.reason === "wrong_code" && bad.nonce === ch.nonce, bad);
  const fmt = await checkUnlockCode(ch.token, "12ab", ref, now + 60);
  check("bad format rejected", !fmt.ok);
  const late = await checkUnlockCode(ch.token, ch.code, ref, now + DEVICE_UNLOCK_TTL_SEC + 5);
  check("expired challenge rejected", !late.ok && late.reason === "expired", late);
  const relocked = await checkUnlockCode(ch.token, ch.code, { ...ref, lockedAt: ref.lockedAt + 10 }, now + 60);
  check("new kid sign-in (new lock) voids the code", !relocked.ok && relocked.reason === "lock_changed", relocked);
  const otherFam = await checkUnlockCode(ch.token, ch.code, { ...ref, familyAccountId: "fam2" }, now + 60);
  check("code only unlocks its own family", !otherFam.ok && otherFam.reason === "lock_changed");
  const tampered = await checkUnlockCode(ch.token.slice(0, -3) + "abc", ch.code, ref, now + 60);
  check("tampered challenge rejected", !tampered.ok && tampered.reason === "expired");
  check("missing challenge rejected", !(await checkUnlockCode(null, ch.code, ref, now)).ok);
  const ch2 = await createUnlockChallenge(ref, now);
  check("fresh nonce per challenge", ch2.nonce !== ch.nonce);
  check("old code does not open a new challenge", ch2.code === ch.code || !(await checkUnlockCode(ch2.token, ch.code, ref, now)).ok);
  check("mask email", maskEmail("jisun@gmail.com") === "j\u2022\u2022\u2022@gmail.com");
  check("unlock code 10 min, 5 tries", DEVICE_UNLOCK_TTL_SEC === 600 && DEVICE_UNLOCK_MAX_TRIES === 5);

  // --- Only the newest code of a family counts.
  {
    const prefix = unlockCurrentPrefix("fam1");
    const t0 = new Date(1_800_000_000_000);
    const t1 = new Date(1_800_000_060_000);
    check("no record: no code is valid", newestUnlockNonce([], prefix) === null);
    check(
      "newest code wins",
      newestUnlockNonce([{ key: `${prefix}old`, windowStart: t0 }, { key: `${prefix}new`, windowStart: t1 }], prefix) === "new",
    );
    check(
      "other family's rows ignored",
      newestUnlockNonce([{ key: `${unlockCurrentPrefix("fam2")}x`, windowStart: t1 }, { key: `${prefix}a`, windowStart: t0 }], prefix) === "a",
    );
    check("prefix is per family", !unlockCurrentPrefix("fam12").startsWith(unlockCurrentPrefix("fam1")));
  }

  // --- Parent session: 30 days rolling, 90 days absolute; child mode 7 days, not extended.
  const DAY = 24 * 60 * 60;
  check("parent constants", FAMILY_SESSION_MAX_AGE_SEC === 30 * DAY && FAMILY_SESSION_ABSOLUTE_MAX_SEC === 90 * DAY);
  check("kid constant", KID_SESSION_MAX_AGE_SEC === 7 * DAY && DEVICE_LOCK_MAX_AGE_SEC === 30 * DAY);
  check("fresh parent token: 30 days", familyTokenExpiry({ nowSec: now, authTime: now, childMode: false }) === now + 30 * DAY);
  check(
    "refresh at day 80 stops at day 90",
    familyTokenExpiry({ nowSec: now + 80 * DAY, authTime: now, childMode: false }) === now + 90 * DAY,
  );
  check("child mode token: 7 days", familyTokenExpiry({ nowSec: now, authTime: now, childMode: true }) === now + 7 * DAY);
  const tv = (o: Partial<Parameters<typeof familySessionTimesValid>[0]>) =>
    familySessionTimesValid({ nowSec: now, issuedAt: now, authTime: now, childMode: false, ...o });
  check("active refreshed session at day 89 ok", tv({ nowSec: now + 89 * DAY, issuedAt: now + 88 * DAY }));
  check("day 91 after sign-in: sign in again", !tv({ nowSec: now + 91 * DAY, issuedAt: now + 90 * DAY }));
  check("31 days without activity: sign in again", !tv({ nowSec: now + 31 * DAY }));
  check("child mode day 6 ok", tv({ nowSec: now + 6 * DAY, childMode: true }));
  check("child mode day 8 ends", !tv({ nowSec: now + 8 * DAY, childMode: true }));
  check("auth time after issue rejected", !tv({ authTime: now + 3600 }));
  check("future token rejected", !tv({ issuedAt: now + 3600, authTime: now + 3600 }));

  // Real tokens (real clock). Legacy tokens signed with long exp are cut off server-side.
  const secret = new TextEncoder().encode(process.env.AUTH_SECRET);
  const real = Math.floor(Date.now() / 1000);
  const legacy = (claims: Record<string, unknown>, iat: number) =>
    new SignJWT(claims).setProtectedHeader({ alg: "HS256" }).setIssuedAt(iat).setExpirationTime(real + 365 * DAY).sign(secret);
  const fam = { familyAccountId: "fam1", email: "p@example.com", sv: 0, kind: "family" };
  {
    const t = await signFamilySession({ familyAccountId: "fam1", email: "p@example.com", sessionVersion: 0, readerMode: { type: "owner" } });
    const v = await verifyFamilySession(t);
    check("new parent token carries sign-in time", v !== null && Math.abs(v.authTime - real) <= 2 && v.authTime === v.issuedAt, v);
    const carried = await signFamilySession({
      familyAccountId: "fam1",
      email: "p@example.com",
      sessionVersion: 0,
      readerMode: { type: "owner" },
      authTime: real - 50 * DAY,
    });
    const cv = await verifyFamilySession(carried);
    check("refresh keeps the original sign-in time", cv?.authTime === real - 50 * DAY, cv);
    const tooOld = await signFamilySession({
      familyAccountId: "fam1",
      email: "p@example.com",
      sessionVersion: 0,
      readerMode: { type: "owner" },
      authTime: real - 91 * DAY,
    });
    check("refresh past 90 days does not revive", (await verifyFamilySession(tooOld)) === null);
  }
  check("legacy parent token (no sign-in time) within 30d ok", (await verifyFamilySession(await legacy({ ...fam, rm: "owner" }, real - 10 * DAY))) !== null);
  check("legacy parent token older than 30d rejected", (await verifyFamilySession(await legacy({ ...fam, rm: "owner" }, real - 31 * DAY))) === null);
  check("parent token 91 days after sign-in rejected", (await verifyFamilySession(await legacy({ ...fam, rm: "owner", at: real - 91 * DAY }, real - DAY))) === null);
  check("parent token 89 days after sign-in ok", (await verifyFamilySession(await legacy({ ...fam, rm: "owner", at: real - 89 * DAY }, real - DAY))) !== null);
  check("child-mode parent token older than 7d rejected", (await verifyFamilySession(await legacy({ ...fam, rm: "sub", rsub: "kid1" }, real - 8 * DAY))) === null);
  check("child-mode parent token 6d ok", (await verifyFamilySession(await legacy({ ...fam, rm: "sub", rsub: "kid1" }, real - 6 * DAY))) !== null);

  // Reader cookies.
  {
    const owner = await signReaderSession({ type: "owner", familyAccountId: "fam1", sessionVersion: 0, authTime: real - 20 * DAY });
    const ov = await verifyReaderSession(owner);
    check("owner reader keeps sign-in time", ov?.type === "owner" && ov.authTime === real - 20 * DAY, ov);
    const ownerOld = await signReaderSession({ type: "owner", familyAccountId: "fam1", sessionVersion: 0, authTime: real - 91 * DAY });
    check("owner reader past 90 days rejected", (await verifyReaderSession(ownerOld)) === null);
    const kid = await signReaderSession({ type: "sub", subProfileId: "kid1", familyAccountId: "fam1", sessionVersion: 0 });
    check("kid reader verifies", (await verifyReaderSession(kid))?.type === "sub");
    const rd = { kind: "reader", type: "sub", subProfileId: "kid1", familyAccountId: "fam1", sv: 0 };
    check("legacy 1-year kid reader older than 7d rejected", (await verifyReaderSession(await legacy(rd, real - 8 * DAY))) === null);
    check("kid reader 6d ok", (await verifyReaderSession(await legacy(rd, real - 6 * DAY))) !== null);
  }
  // Device lock.
  {
    const dl = { kind: "device-lock", fid: "fam1", sid: "kid1" };
    check("legacy 1-year device lock older than 30d rejected", (await verifyDeviceLock(await legacy(dl, real - 31 * DAY))) === null);
    check("device lock 29d ok", (await verifyDeviceLock(await legacy(dl, real - 29 * DAY))) !== null);
  }

  // --- Kid PIN: from 5 wrong PINs the child is locked for a while.
  check("4 wrong PINs: not locked yet", pinFailureOutcome(4, new Date(now * 1000)).lockedUntil === null);
  check("5 wrong PINs: locked", pinFailureOutcome(5, new Date(now * 1000)).lockedUntil !== null);

  // --- Admin: 8 hours absolute, 30 minutes idle.
  check("admin constants", ADMIN_SESSION_MAX_AGE_SEC === 8 * 3600 && ADMIN_IDLE_TIMEOUT_SEC === 30 * 60);
  check("admin Auth.js maxAge 8h", authConfig.session.maxAge === 8 * 3600);
  check("admin login 7h59m ok", !isAdminLoginExpired(now - 8 * 3600 + 60, now));
  check("admin login 8h01m expired", isAdminLoginExpired(now - 8 * 3600 - 60, now));
  check("admin token without sign-in time expired", isAdminLoginExpired(undefined, now));
  check("admin future sign-in time rejected", isAdminLoginExpired(now + 3600, now));
  {
    const jwtCb = authConfig.callbacks.jwt as (p: { token: Record<string, unknown>; user?: unknown }) => unknown;
    const realSec = Math.floor(Date.now() / 1000);
    const signedIn = jwtCb({ token: {}, user: { id: "a1", email: "a@example.com", role: "SUPER_ADMIN" } }) as Record<string, unknown> | null;
    check("admin sign-in stamps loginAt", typeof signedIn?.loginAt === "number" && Math.abs((signedIn!.loginAt as number) - realSec) <= 2);
    check("admin token 9h old is dropped (cookie cleared)", jwtCb({ token: { id: "a1", loginAt: realSec - 9 * 3600 } }) === null);
    check("admin token 1h old is kept", jwtCb({ token: { id: "a1", loginAt: realSec - 3600 } }) !== null);
    check("old admin token without loginAt is dropped", jwtCb({ token: { id: "a1" } }) === null);
  }
  {
    const ref = { adminId: "a1", loginAt: now - 3600 };
    const act = await signAdminActivity(ref, now);
    check("activity read back", (await readAdminLastActivity(act, ref, now + 60)) === now);
    check("29 min idle ok", !(await isAdminIdleExpired({ token: act, ref, now: now + 29 * 60 })));
    check("31 min idle expired", await isAdminIdleExpired({ token: act, ref, now: now + 31 * 60 }));
    check("activity from another admin ignored", await isAdminIdleExpired({ token: act, ref: { ...ref, adminId: "a2" }, now: now + 60 }));
    check("activity from an older sign-in ignored", await isAdminIdleExpired({ token: act, ref: { ...ref, loginAt: ref.loginAt - 10 }, now: now + 60 }));
    check("tampered activity ignored", await isAdminIdleExpired({ token: act.slice(0, -2) + "xx", ref, now: now + 60 }));
    check("no activity cookie: idle counts from sign-in", await isAdminIdleExpired({ token: null, ref, now }));
    check("just signed in, no cookie yet: ok", !(await isAdminIdleExpired({ token: null, ref: { adminId: "a1", loginAt: now - 60 }, now })));
    const lateRef = { adminId: "a1", loginAt: now - 8 * 3600 + 120 };
    const lateAct = await signAdminActivity(lateRef, now);
    check("fresh activity cannot extend past 8h", await isAdminIdleExpired({ token: lateAct, ref: lateRef, now: now + 300 }));
    check("grace only for the server re-check", !(await isAdminIdleExpired({ token: act, ref, now: now + 30 * 60 + 30, graceSec: 60 })));
    const ac = adminActivityCookieOptions("x");
    check("activity cookie flags", ac.name === ADMIN_ACTIVITY_COOKIE && ac.httpOnly && ac.sameSite === "lax" && ac.path === "/" && ac.maxAge === 30 * 60 + 120);
    check("admin paths count as activity", isAdminActivityPath("/admin") && isAdminActivityPath("/admin/cards") && isAdminActivityPath("/api/admin/upload"));
    check("login page and public pages do not", !isAdminActivityPath("/admin/login") && !isAdminActivityPath("/") && !isAdminActivityPath("/administer") && !isAdminActivityPath("/api/auth/session"));
  }

  console.log(`test-kid-mode-session: ${checks - failures}/${checks} passed`);
  if (failures) process.exit(1);
}

void main();
