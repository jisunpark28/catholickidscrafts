/**
 * Static checks for SEO P0 cannibalization / robots / RelatedLinks wiring.
 */
import assert from "node:assert/strict";
import fs from "node:fs";

const nextConfig = fs.readFileSync("next.config.ts", "utf8");
assert.match(nextConfig, /source:\s*"\/mass"[\s\S]*?destination:\s*"\/daily-mass"/);
assert.match(nextConfig, /source:\s*"\/liturgy\/saints"[\s\S]*?destination:\s*"\/catholic-saints-for-kids"/);
assert.match(nextConfig, /source:\s*"\/mass\/:date[\s\S]*?destination:\s*"\/daily-mass"/);

const sitemap = fs.readFileSync("src/lib/sitemap-entries.ts", "utf8");
assert.equal(sitemap.includes('["/mass",'), false);
assert.match(sitemap, /\["\/daily-mass"/);
assert.match(sitemap, /\["\/qa-cards"/);
assert.match(sitemap, /topic !== "saints"/);
assert.match(sitemap, /moms-bible\/situations/);

const printResource = fs.readFileSync("src/app/print/resource/[slug]/page.tsx", "utf8");
assert.match(printResource, /robots:\s*\{\s*index:\s*false,\s*follow:\s*true\s*\}/);

const situations = fs.readFileSync("src/app/(site)/moms-bible/situations/page.tsx", "utf8");
assert.match(situations, /robots:\s*\{\s*index:\s*false,\s*follow:\s*true\s*\}/);
assert.match(situations, /Mom's Bible — Moments board/);

const liturgyTopic = fs.readFileSync("src/app/(site)/liturgy/[topic]/page.tsx", "utf8");
assert.match(liturgyTopic, /QaPlainAnswers/);
assert.match(liturgyTopic, /permanentRedirect\("\/catholic-saints-for-kids"\)/);

const qaCards = fs.readFileSync("src/app/(site)/qa-cards/page.tsx", "utf8");
assert.equal(qaCards.includes("index: false"), false, "/qa-cards must stay indexable");

assert.match(fs.readFileSync("src/components/seo/EvergreenWorksheetDetail.tsx", "utf8"), /RelatedLinks/);
assert.match(fs.readFileSync("src/app/(site)/play/page.tsx", "utf8"), /RelatedLinks/);
assert.match(fs.readFileSync("src/app/(site)/daily-mass/page.tsx", "utf8"), /RelatedLinks/);

console.log("test-seo-p0: redirects, robots, RelatedLinks, sitemap excludes ok");
