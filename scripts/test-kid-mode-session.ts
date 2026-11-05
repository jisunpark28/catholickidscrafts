/**
 * Child-mode cookies, Google re-auth decision and the emailed unlock code (no DB, fake clock).
 * Run: npx tsx scripts/test-kid-mode-session.ts
 */
process.env.AUTH_SECRET ||= "test-secret-for-kid-mode-session-checks-only";

import { NextResponse } from "next/server";
import {
  clearChildSignOutCookies,
  clearDeviceLockCookie,
  shouldClearFamilyOnChildSignOut,
} from "../src/lib/child-mode-cookies";
import {
  checkUnlockCode,
  createUnlockChallenge,
  DEVICE_UNLOCK_COOKIE,
  DEVICE_UNLOCK_PATH,
  DEVICE_UNLOCK_TTL_SEC,
  deviceUnlockCookieOptions,
  isFreshGoogleReauth,
  isUnlockCodeFormat,
  maskEmail,
  readUnlockChallenge,
} from "../src/lib/device-unlock";
import {
  DEVICE_LOCK_COOKIE,
  deviceLockCookieOptions,
  FAMILY_SESSION_COOKIE,
  familyCookieOptions,
  READER_SESSION_COOKIE,
  readerCookieOptions,
  signDeviceLock,
  signFamilySession,
  verifyDeviceLock,
  verifyFamilySession,
} from "../src/lib/family-session";
import { GOOGLE_FRESH_AUTH_MAX_AGE_SEC, GOOGLE_OAUTH_NONCE_COOKIE } from "../src/lib/google-oauth";

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
  check("device lock 1 year", deviceLockCookieOptions("x").maxAge === 60 * 60 * 24 * 365);
  const u = deviceUnlockCookieOptions("x");
  check("unlock cookie httpOnly", u.httpOnly === true);
  check("unlock cookie strict", u.sameSite === "strict");
  check("unlock cookie path scoped", u.path === DEVICE_UNLOCK_PATH && u.name === DEVICE_UNLOCK_COOKIE);
  check("unlock cookie 10 min", u.maxAge === DEVICE_UNLOCK_TTL_SEC);
  check("oauth nonce cookie name", GOOGLE_OAUTH_NONCE_COOKIE === "ckc_oauth_nonce");

  // --- Clearing uses the same name + path the cookies were set with.
  {
    const res = NextResponse.json({});
    clearChildSignOutCookies(res, { clearFamily: true });
    check("child sign-out clears reader", cleared(res, READER_SESSION_COOKIE));
    check("child sign-out clears child-mode family", cleared(res, FAMILY_SESSION_COOKIE));
    check("child sign-out keeps the device lock", res.cookies.get(DEVICE_LOCK_COOKIE) === undefined);
  }
  {
    const res = NextResponse.json({});
    clearChildSignOutCookies(res, { clearFamily: false });
    check("reader-only sign-out clears reader", cleared(res, READER_SESSION_COOKIE));
    check("reader-only sign-out keeps parent", res.cookies.get(FAMILY_SESSION_COOKIE) === undefined);
  }
  {
    const res = NextResponse.json({});
    clearDeviceLockCookie(res);
    check("device lock clear", cleared(res, DEVICE_LOCK_COOKIE));
  }
  check("no family cookie: nothing to clear", !shouldClearFamilyOnChildSignOut({ familyCookiePresent: false, familyMode: null }));
  check("child-mode family cleared", shouldClearFamilyOnChildSignOut({ familyCookiePresent: true, familyMode: "sub" }));
  check("invalid family cleared", shouldClearFamilyOnChildSignOut({ familyCookiePresent: true, familyMode: null }));
  check("active parent kept", !shouldClearFamilyOnChildSignOut({ familyCookiePresent: true, familyMode: "owner" }));

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

  console.log(`test-kid-mode-session: ${checks - failures}/${checks} passed`);
  if (failures) process.exit(1);
}

void main();
