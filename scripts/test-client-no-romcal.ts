import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

/** Fail if romcal (lodash templates / `new Function`) leaked into client JS. */
function walk(dir: string, acc: string[] = []): string[] {
  if (!fs.existsSync(dir)) return acc;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const rel = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(rel, acc);
    else if (entry.name.endsWith(".js")) acc.push(rel);
  }
  return acc;
}

const clientDir = ".next/static";
assert.equal(fs.existsSync(clientDir), true, "run next build before this check");

const romcalMarkers = /before Epiphany|calendarFor/;
const hits: string[] = [];
for (const file of walk(clientDir)) {
  const src = fs.readFileSync(file, "utf8");
  if (romcalMarkers.test(src)) hits.push(file);
}

assert.equal(
  hits.length,
  0,
  `romcal must not ship in client chunks (CSP has no 'unsafe-eval'):\n${hits.join("\n")}`,
);

const footerChunk = walk(clientDir).some((file) =>
  fs.readFileSync(file, "utf8").includes("Liturgical calendar: Evangelizo.org"),
);
assert.equal(footerChunk, true, "SiteFooter copy should still be in the client bundle");

console.log("test-client-no-romcal: ok");
