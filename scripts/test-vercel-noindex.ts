/**
 * Tiny assert script for *.vercel.app noindex helpers (no test runner required).
 * Run: pnpm exec tsx scripts/test-vercel-noindex.ts
 */
import {
  hostnameFromHostHeader,
  isVercelDeploymentHost,
} from "../src/lib/canonical-host";

function assert(cond: unknown, message: string): asserts cond {
  if (!cond) throw new Error(message);
}

assert(hostnameFromHostHeader("catholickidscrafts28.vercel.app:443") === "catholickidscrafts28.vercel.app", "strip port");
assert(isVercelDeploymentHost("catholickidscrafts28.vercel.app"), "production vercel alias");
assert(isVercelDeploymentHost("catholickidscrafts-git-main-xxx.vercel.app"), "preview host");
assert(isVercelDeploymentHost("CatholickidsCrafts28.Vercel.App"), "case insensitive");
assert(!isVercelDeploymentHost("www.catholickidscrafts.com"), "canonical www stays indexable");
assert(!isVercelDeploymentHost("catholickidscrafts.com"), "apex is not vercel");
assert(!isVercelDeploymentHost("localhost:3000"), "local is not vercel");

console.log("ok: vercel noindex host helpers");
