import assert from "node:assert/strict";
import fs from "node:fs";
import { isPlaceholderLessonCopy } from "../src/lib/lesson-kit/placeholder-copy";
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

const about = fs.readFileSync("src/app/(site)/about/page.tsx", "utf8");
assert.equal(about.includes("getPublicContactEmail"), true, "about should show contact via shared helper");
assert.equal(about.includes("through the contact on our"), false);

console.log("test-public-copy: ok");
