import assert from "node:assert/strict";
import fs from "node:fs";
import {
  CSP_REPORT_PATH,
  buildCspReportOnlyValue,
  cspReportOnlyHeaders,
} from "../src/lib/csp";

const prod = buildCspReportOnlyValue({ isDev: false });
const headers = cspReportOnlyHeaders({ isDev: false });
const keys = headers.map((h) => h.key);

assert.equal(keys.includes("Content-Security-Policy"), false, "must not send enforcing CSP");
assert.equal(keys.includes("Content-Security-Policy-Report-Only"), true);
assert.equal(keys.includes("Reporting-Endpoints"), true);
assert.match(prod, /^default-src 'self'/);
assert.match(prod, /base-uri 'self'/);
assert.match(prod, /object-src 'none'/);
assert.match(prod, /frame-ancestors 'self'/);
assert.match(prod, /script-src [^;]*'unsafe-inline'/);
assert.match(prod, /style-src [^;]*'unsafe-inline'/);
assert.match(prod, /https:\/\/universalis\.com/);
assert.match(prod, /https:\/\/www\.youtube\.com/);
assert.match(prod, /https:\/\/cdn\.jsdelivr\.net/);
assert.match(prod, /https:\/\/hangeul\.pstatic\.net/);
assert.match(prod, /https:\/\/justadudewhohacks\.github\.io/);
assert.match(prod, /report-uri \/api\/csp-report/);
assert.match(prod, /'wasm-unsafe-eval'/);
assert.doesNotMatch(prod, /script-src [^;]*'unsafe-eval'/);

const withChurch = buildCspReportOnlyValue({
  isDev: false,
  churchGameUrl: "https://tiny-priest.example.com/index.html",
});
assert.match(withChurch, /https:\/\/tiny-priest\.example\.com/);

const nextConfig = fs.readFileSync("next.config.ts", "utf8");
assert.match(nextConfig, /cspReportOnlyHeaders/);
assert.match(nextConfig, /X-Frame-Options/);
assert.doesNotMatch(
  nextConfig,
  /key:\s*["']Content-Security-Policy["']/,
  "next.config must not set enforcing Content-Security-Policy",
);

const reportRoute = fs.readFileSync("src/app/api/csp-report/route.ts", "utf8");
assert.match(reportRoute, /\[csp-report\]/);
assert.equal(CSP_REPORT_PATH, "/api/csp-report");

console.log("test-csp: ok");
