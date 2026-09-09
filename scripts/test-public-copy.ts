import assert from "node:assert/strict";
import fs from "node:fs";
import { isPlaceholderLessonCopy } from "../src/lib/lesson-kit/placeholder-copy";
import { resourceDownloadButtonLabel } from "../src/lib/resource-download-label";
import { getPublicContactEmail } from "../src/lib/site-contact";
import { isTeachersPayTeachersUrl, isYoutubeUrl, partnerOutboundLabel } from "../src/lib/tpt";

assert.equal(isPlaceholderLessonCopy("Advent", "test"), true);
assert.equal(isPlaceholderLessonCopy("test", "A real description"), true);
assert.equal(isPlaceholderLessonCopy("Advent warm-up", "Purple time: colors, words, and a short Gospel."), false);

assert.equal(isTeachersPayTeachersUrl("https://www.teacherspayteachers.com/store/catholic-kids-crafts"), true);
assert.equal(isTeachersPayTeachersUrl("https://www.youtube.com/"), false);
assert.equal(isYoutubeUrl("https://www.youtube.com/"), true);
assert.equal(isYoutubeUrl("https://youtu.be/abc"), true);
assert.equal(partnerOutboundLabel("https://www.youtube.com/"), "Watch video →");
assert.equal(
  partnerOutboundLabel("https://www.teacherspayteachers.com/Product/example"),
  "Full classroom pack on TPT →",
);
assert.equal(partnerOutboundLabel("https://example.com/pack"), "Open link →");

assert.equal(
  resourceDownloadButtonLabel({ isFreeSample: true }),
  "Download sample PDF",
);
assert.equal(
  resourceDownloadButtonLabel({ isFreeSample: false }),
  "Download full PDF",
);
assert.equal(
  resourceDownloadButtonLabel({ downloadLabel: "Download PDF", isFreeSample: true }),
  "Download sample PDF",
);
assert.equal(
  resourceDownloadButtonLabel({
    downloadLabel: "Download craft template (sample)",
    isFreeSample: true,
  }),
  "Download craft template (sample)",
);

const homeHub = fs.readFileSync("src/components/HomeLearnHub.tsx", "utf8");
assert.equal(homeHub.includes("<h1"), true, "home hub must render an H1");
assert.equal(homeHub.includes("home.hero"), false);

const dailyMassPanel = fs.readFileSync("src/components/DailyMassPanel.tsx", "utf8");
assert.equal(dailyMassPanel.includes("▼"), false, "mass calendar must not use a menu chevron");
assert.equal(dailyMassPanel.includes("aria-expanded"), true);

const resourcesPage = fs.readFileSync("src/app/(site)/resources/page.tsx", "utf8");
assert.equal(resourcesPage.includes("Check back soon"), false);

const header = fs.readFileSync("src/components/HomeHubHeader.tsx", "utf8");
assert.equal(header.includes("PUBLIC_EXPLORE_NAV"), true);
assert.equal(header.includes("/admin"), false, "header must not link to admin");

const accountMenu = fs.readFileSync("src/components/HomeHubAccountMenu.tsx", "utf8");
assert.equal(accountMenu.includes("/account/login"), true);
assert.equal(accountMenu.includes("/admin"), false, "account menu must not link to admin");

const exploreNav = fs.readFileSync("src/lib/public-explore-nav.ts", "utf8");
assert.equal(exploreNav.includes("/prayers"), true);
assert.equal(exploreNav.includes("/mass"), true);
assert.equal(exploreNav.includes("/play"), true);
assert.equal(exploreNav.includes("/resources"), true);
assert.equal(exploreNav.includes("/curriculum"), true);
assert.equal(exploreNav.includes("/terms"), false, "Terms belongs in the footer, not Explore nav");

const footer = fs.readFileSync("src/components/SiteFooter.tsx", "utf8");
assert.equal(footer.includes("getPublicContactMailto"), true);
assert.equal(footer.includes("/privacy"), true);
assert.equal(footer.includes("/terms"), true);
assert.equal(footer.includes("PUBLIC_EXPLORE_NAV"), true);

const previousContact = process.env.NEXT_PUBLIC_CONTACT_EMAIL;
const previousSiteContact = process.env.SITE_CONTACT_EMAIL;
delete process.env.NEXT_PUBLIC_CONTACT_EMAIL;
delete process.env.SITE_CONTACT_EMAIL;
assert.equal(getPublicContactEmail(), null);

process.env.NEXT_PUBLIC_CONTACT_EMAIL = "NEXT_PUBLIC_CONTACT_EMAIL";
assert.equal(getPublicContactEmail(), null);

process.env.NEXT_PUBLIC_CONTACT_EMAIL = "privacy@catholickidscrafts.com";
assert.equal(getPublicContactEmail(), "privacy@catholickidscrafts.com");

if (previousContact === undefined) delete process.env.NEXT_PUBLIC_CONTACT_EMAIL;
else process.env.NEXT_PUBLIC_CONTACT_EMAIL = previousContact;
if (previousSiteContact === undefined) delete process.env.SITE_CONTACT_EMAIL;
else process.env.SITE_CONTACT_EMAIL = previousSiteContact;

const privacy = fs.readFileSync("src/app/(site)/privacy/page.tsx", "utf8");
assert.equal(privacy.includes("NEXT_PUBLIC_CONTACT_EMAIL"), false, "privacy must not mention the contact env name");
assert.equal(privacy.includes("docs/FAMILY_GOOGLE_SIGNIN.md"), false, "privacy must not mention operator docs");
assert.equal(privacy.includes("we never receive the Google password"), true);
assert.equal(privacy.includes('href="/terms"'), true, "privacy must link to Terms");
assert.equal(privacy.includes("Access ID"), true);
assert.equal(privacy.includes("ckc_vid"), true);
assert.equal(privacy.includes("camera or microphone"), true);

const terms = fs.readFileSync("src/app/(site)/terms/page.tsx", "utf8");
assert.equal(terms.includes("NEXT_PUBLIC_CONTACT_EMAIL"), false, "terms must not mention the contact env name");
assert.equal(terms.includes("getPublicContactEmail"), true);
assert.equal(terms.includes('href="/privacy"'), true, "terms must link to Privacy");
assert.equal(terms.includes('href="/affiliate-disclosure"'), true);
assert.equal(terms.includes("governing law"), false, "do not invent a jurisdiction");
assert.equal(terms.includes("USCCB"), true);

const about = fs.readFileSync("src/app/(site)/about/page.tsx", "utf8");
assert.equal(about.includes("getPublicContactEmail"), true, "about should show contact via shared helper");
assert.equal(about.includes("through the contact on our"), false);

const recCard = fs.readFileSync("src/components/RecommendationCard.tsx", "utf8");
assert.equal(recCard.includes("Amazon Associate"), true, "Amazon outbound cards must match Affiliate disclosure labeling");

console.log("test-public-copy: ok");
