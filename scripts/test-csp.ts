import assert from "node:assert/strict";
import fs from "node:fs";
import { CSP_REPORT_PATH, buildCspValue, cspHeaders } from "../src/lib/csp";

const prod = buildCspValue({ isDev: false });
const headers = cspHeaders({ isDev: false });
const keys = headers.map((h) => h.key);

assert.equal(keys.includes("Content-Security-Policy-Report-Only"), false, "must not send Report-Only");
assert.equal(keys.includes("Content-Security-Policy"), true);
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

/** Client UI must not import romcal (lodash templates → `new Function()` / EvalError under CSP). */
function walkTsFiles(dir: string): string[] {
  const out: string[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const rel = `${dir}/${entry.name}`;
    if (entry.isDirectory()) out.push(...walkTsFiles(rel));
    else if (/\.(tsx?|jsx?)$/.test(entry.name)) out.push(rel);
  }
  return out;
}

const clientUnsafeImports =
  /\bfrom\s+["'](?:romcal|@\/lib\/(?:romcal-liturgical|evangelizo|mass-source))["']/;
for (const rel of walkTsFiles("src")) {
  const src = fs.readFileSync(rel, "utf8");
  if (!src.includes('"use client"')) continue;
  assert.doesNotMatch(
    src,
    clientUnsafeImports,
    `${rel} would pull romcal into the client bundle`,
  );
}

const withChurch = buildCspValue({
  isDev: false,
  churchGameUrl: "https://tiny-priest.example.com/index.html",
});
assert.match(withChurch, /https:\/\/tiny-priest\.example\.com/);

const nextConfig = fs.readFileSync("next.config.ts", "utf8");
assert.match(nextConfig, /cspHeaders\(/);
assert.match(nextConfig, /X-Frame-Options/);
assert.match(nextConfig, /Content-Security-Policy/);
assert.doesNotMatch(nextConfig, /Content-Security-Policy-Report-Only/);

const hangmanHtml = fs.readFileSync("public/games/hangman/index.html", "utf8");
assert.doesNotMatch(hangmanHtml, /<script\s*>/, "hangman must not use inline script");
assert.doesNotMatch(hangmanHtml, /\sstyle="/, "hangman must not use inline style attributes");
assert.match(hangmanHtml, /boot\.js/);

const faceHtml = fs.readFileSync("public/games/face-to-emoji/index.html", "utf8");
assert.doesNotMatch(
  faceHtml,
  /<script>\s*if \(new URLSearchParams/,
  "face-to-emoji must not inline embed-mode boot",
);
assert.match(faceHtml, /embed-mode\.js/);

const reportRoute = fs.readFileSync("src/app/api/csp-report/route.ts", "utf8");
assert.match(reportRoute, /\[csp-report\]/);
assert.equal(CSP_REPORT_PATH, "/api/csp-report");

console.log("test-csp: ok");
