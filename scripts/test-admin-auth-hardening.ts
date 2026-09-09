import assert from "node:assert/strict";
import {
  getAdminLoginThrottle,
  recordAdminLoginFailure,
  recordAdminLoginSuccess,
  resetAdminLoginThrottleForTests,
} from "../src/lib/admin-login-throttle";
import { clientIpFromHeaders } from "../src/lib/client-ip";
import { buildSecurityTxt, SECURITY_TXT_EXPIRES } from "../src/lib/security-txt";

resetAdminLoginThrottleForTests();
process.env.ADMIN_LOGIN_MAX_FAILURES = "3";
process.env.ADMIN_LOGIN_WINDOW_MS = "60000";
process.env.ADMIN_LOGIN_BLOCK_MS = "60000";

const ip = "203.0.113.10";
const email = "ops@example.com";

assert.equal(getAdminLoginThrottle(ip, email).blocked, false);
recordAdminLoginFailure(ip, email);
recordAdminLoginFailure(ip, email);
assert.equal(getAdminLoginThrottle(ip, email).blocked, false);
const afterLimit = recordAdminLoginFailure(ip, email);
assert.equal(afterLimit.blocked, true);
assert.ok(afterLimit.retryAfterSec >= 1);
assert.equal(getAdminLoginThrottle(ip, email).blocked, true);

recordAdminLoginSuccess(ip, email);
assert.equal(getAdminLoginThrottle(ip, email).blocked, false, "success clears throttle");

const headers = new Headers({ "x-forwarded-for": "198.51.100.20, 10.0.0.1" });
assert.equal(clientIpFromHeaders(headers), "198.51.100.20");

const previousContact = process.env.NEXT_PUBLIC_CONTACT_EMAIL;
const previousSite = process.env.NEXT_PUBLIC_SITE_URL;
process.env.NEXT_PUBLIC_CONTACT_EMAIL = "privacy@catholickidscrafts.com";
process.env.NEXT_PUBLIC_SITE_URL = "https://www.catholickidscrafts.com";
const txt = buildSecurityTxt();
assert.match(txt, /^Contact: mailto:privacy@catholickidscrafts.com$/m);
assert.match(txt, /^Preferred-Languages: en, ko$/m);
assert.match(txt, new RegExp(`^Expires: ${SECURITY_TXT_EXPIRES}$`, "m"));
assert.match(txt, /^Canonical: https:\/\/www\.catholickidscrafts\.com\/\.well-known\/security\.txt$/m);
assert.equal(txt.includes("PGP"), false);
assert.equal(txt.includes("BEGIN PGP"), false);

delete process.env.NEXT_PUBLIC_CONTACT_EMAIL;
delete process.env.SITE_CONTACT_EMAIL;
const fallback = buildSecurityTxt();
assert.match(fallback, /^Contact: https:\/\/www\.catholickidscrafts\.com\/privacy$/m);

if (previousContact === undefined) delete process.env.NEXT_PUBLIC_CONTACT_EMAIL;
else process.env.NEXT_PUBLIC_CONTACT_EMAIL = previousContact;
if (previousSite === undefined) delete process.env.NEXT_PUBLIC_SITE_URL;
else process.env.NEXT_PUBLIC_SITE_URL = previousSite;

resetAdminLoginThrottleForTests();
delete process.env.ADMIN_LOGIN_MAX_FAILURES;
delete process.env.ADMIN_LOGIN_WINDOW_MS;
delete process.env.ADMIN_LOGIN_BLOCK_MS;

console.log("test-admin-auth-hardening: ok");
