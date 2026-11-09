/**
 * Mom's Bible rules: authorization, Family Pass entitlement, reply + child message limits, notification
 * cooldown/digest, invites, situations mapping and verse ownership. No DB, fake clock.
 * Run: npx tsx scripts/test-moms-bible.ts
 */
import { SITUATIONS, SITUATION_GROUPS, ORIGINAL_SITUATIONS, getSituation, isSituationKey } from "../src/data/moms-bible/situations";
import { SITUATION_SEO, bibleVerseMomentPaths, getSituationSeo } from "../src/data/moms-bible/situation-seo";
import { DATASET_MOMENT_COUNT, OMITTED_DATASET_MOMENTS, PARTIAL_REFS, RENUMBERED_REFS } from "../src/data/moms-bible/situation-coverage";
import { nabreToDouay } from "../src/lib/bible/ref-map";
import { MB_LIMITS, MB_STICKERS, isMbColor, isMbSticker, stickerLabel, formatSeedsLabel } from "../src/lib/moms-bible/constants";
import { hashInviteToken, isInviteTokenShape, newInviteToken } from "../src/lib/moms-bible/invites";
import {
  MB_EMAIL_COOLDOWN_MS,
  MB_INVITE_TTL_MS,
  canAcceptInvite,
  canChildReply,
  canChildStartMessage,
  canParentRead,
  canParentRemove,
  canParentWrite,
  chapterStamp,
  cleanRoleLabel,
  cleanText,
  digestPending,
  parseChildReply,
  parseColor,
  parseVerseRange,
  replyEmailCopy,
  seedCount,
  shouldSendInstantEmail,
  siblingTargets,
} from "../src/lib/moms-bible/rules";
import { charOwnerVerses, ownerVerseMap, ownerVerseTexts } from "../src/lib/moms-bible/verse-text";

let failures = 0;
let checks = 0;
function check(name: string, ok: boolean, detail?: unknown) {
  checks++;
  if (!ok) {
    failures++;
    console.error(`FAIL ${name}`, detail ?? "");
  }
}
const status = (d: { ok: boolean; status?: number }) => (d.ok ? 200 : d.status);

// ── Parent authorization + entitlement ──
check("read: unlinked -> 404", status(canParentRead({ linked: false, familyPass: true })) === 404);
check("read: linked free -> ok", status(canParentRead({ linked: true, familyPass: false })) === 200);
check("write: unlinked -> 404 (even with Plus)", status(canParentWrite({ linked: false, familyPass: true })) === 404);
check("write: linked, no Family Pass -> 402", status(canParentWrite({ linked: true, familyPass: false })) === 402);
check("write: linked + Family Pass (free dad, Plus mom) -> ok", status(canParentWrite({ linked: true, familyPass: true })) === 200);
check("remove: own, no Plus -> ok", status(canParentRemove({ linked: true, familyPass: false, isAuthor: true })) === 200);
check("remove: other parent's -> 404", status(canParentRemove({ linked: true, familyPass: true, isAuthor: false })) === 404);
check("remove: unlinked author -> 404", status(canParentRemove({ linked: false, familyPass: true, isAuthor: true })) === 404);

// ── Child replies ──
const base = { sessionChildId: "kidA", noteChildId: "kidA" };
check("child: other child's note -> 404", status(canChildReply({ ...base, noteChildId: "kidB", familyPass: true, childRepliedAt: null })) === 404);
check("child: Plus, already replied -> ok", status(canChildReply({ ...base, familyPass: true, childRepliedAt: new Date() })) === 200);
check("child: expired, unanswered -> ok", status(canChildReply({ ...base, familyPass: false, childRepliedAt: null })) === 200);
check("child: expired, answered -> 402", status(canChildReply({ ...base, familyPass: false, childRepliedAt: new Date() })) === 402);

// ── Child-started messages ──
check("child message: linked parent + Family Pass -> ok", status(canChildStartMessage({ recipientLinked: true, familyPass: true })) === 200);
check("child message: unlinked parent -> 404", status(canChildStartMessage({ recipientLinked: false, familyPass: true })) === 404);
check("child message: expired Family Pass -> 402 (new threads lock)", status(canChildStartMessage({ recipientLinked: true, familyPass: false })) === 402);
check("child message: unlinked + expired -> 404 first", status(canChildStartMessage({ recipientLinked: false, familyPass: false })) === 404);
// A started message has childRepliedAt set, so after expiry the child can't add more to it.
check("child message thread: expired -> 402", status(canChildReply({ ...base, familyPass: false, childRepliedAt: new Date() })) === 402);
check("child message: same 200-char limit", parseChildReply({ body: "a".repeat(200) }).ok && !parseChildReply({ body: "a".repeat(201) }).ok);
check("child message: sticker + text", parseChildReply({ stickerKey: "prayed", body: "Pray for my test" }).ok);

// ── Also send to ──
const linked = new Set(["kidA", "kidB", "kidC"]);
check("siblings: none", JSON.stringify(siblingTargets("kidA", undefined, linked)) === '["kidA"]');
check("siblings: dedupe", JSON.stringify(siblingTargets("kidA", ["kidB", "kidA", "kidB"], linked)) === '["kidA","kidB"]');
check("siblings: unlinked rejected", siblingTargets("kidA", ["kidZ"], linked) === null);
check("siblings: non-array rejected", siblingTargets("kidA", "kidB", linked) === null);
check("siblings: too many rejected", siblingTargets("kidA", Array(MB_LIMITS.alsoSendTo + 1).fill("kidB"), linked) === null);

// ── Validation ──
check("reply: sticker only", parseChildReply({ stickerKey: "love" }).ok);
check("reply: text only", parseChildReply({ body: "I love you too" }).ok);
check("reply: unknown sticker", !parseChildReply({ stickerKey: "<img>" }).ok);
check("reply: empty", !parseChildReply({ body: "   " }).ok);
check("reply: number body", !parseChildReply({ body: 5 }).ok);
check("reply: 200 emoji ok", parseChildReply({ body: "💛".repeat(200) }).ok);
check("reply: 201 chars rejected", !parseChildReply({ body: "a".repeat(201) }).ok);
const ct = cleanText("hi\u0000\u0007 there\r\nline2 ", 50);
check("cleanText strips control chars, keeps newline", ct.ok && ct.value === "hi there\nline2", ct);
check("cleanText max parent", !cleanText("a".repeat(MB_LIMITS.parentText + 1), MB_LIMITS.parentText).ok);
check("color ok", parseColor("PINK").ok && parseColor(null).ok);
check("color bad", !parseColor("RED").ok && !isMbColor("red"));
check("range letter", JSON.stringify(parseVerseRange(null, null, 20)) === '{"ok":true,"start":null,"end":null}');
check("range single", JSON.stringify(parseVerseRange(3, undefined, 20)) === '{"ok":true,"start":3,"end":3}');
check("range reversed", !parseVerseRange(5, 3, 20).ok);
check("range beyond chapter", !parseVerseRange(19, 21, 20).ok);
check("range zero", !parseVerseRange(0, 1, 20).ok);
check("range end without start", !parseVerseRange(null, 3, 20).ok);
check("role label clean", cleanRoleLabel("  Dad ") === "Dad" && cleanRoleLabel("<b>Mom</b>") === "bMomb");
check("role label too long", cleanRoleLabel("a".repeat(21)) === null && cleanRoleLabel("") === null);
check("stickers whitelisted (3)", Object.keys(MB_STICKERS).length === 3 && isMbSticker("prayed") && !isMbSticker("toString"));
check("sticker label uses role", stickerLabel("love", "Dad").includes("Dad"));

// ── Stamps + seeds ──
const d = new Date("2026-11-01T00:00:00Z");
// Child view: a note to read first, then shared, then highlights only.
check("child stamp waiting first", chapterStamp("child", [{ childRepliedAt: d }, { childRepliedAt: null }], 3) === "waiting");
check("child stamp shared", chapterStamp("child", [{ childRepliedAt: d }], 0) === "shared");
check("child stamp highlights = mine", chapterStamp("child", [], 2) === "mine");
check("child stamp none", chapterStamp("child", [], 0) === null);
// Parent view (mockup legend): unseen reply = waiting, unanswered note = my note, answered = shared.
check("parent stamp unseen reply waiting", chapterStamp("parent", [{ childRepliedAt: d }], 0, 1) === "waiting");
check("parent stamp open note mine", chapterStamp("parent", [{ childRepliedAt: d }, { childRepliedAt: null }], 0) === "mine");
check("parent stamp shared", chapterStamp("parent", [{ childRepliedAt: d }], 0) === "shared");
check("parent stamp highlights mine", chapterStamp("parent", [], 1) === "mine");
check("parent stamp none", chapterStamp("parent", [], 0) === null);
check(
  "seeds count chapters",
  seedCount([
    { bookSlug: "psalms", chapter: 33, childRepliedAt: d },
    { bookSlug: "psalms", chapter: 33, childRepliedAt: d },
    { bookSlug: "psalms", chapter: 22, childRepliedAt: null },
    { bookSlug: "john", chapter: 3, childRepliedAt: d },
  ]) === 2,
);
check(
  "seeds skip child-started messages",
  seedCount([
    { bookSlug: "psalms", chapter: 33, childRepliedAt: d, startedByChild: true },
    { bookSlug: "john", chapter: 3, childRepliedAt: d },
  ]) === 1,
);
check("seeds badge label plural", formatSeedsLabel(14) === "Shared Together: 14 seeds");
check("seeds badge label singular", formatSeedsLabel(1) === "Shared Together: 1 seed");
check("seeds badge label zero", formatSeedsLabel(0) === "Shared Together: 0 seeds");
check("seeds badge label floors", formatSeedsLabel(2.9) === "Shared Together: 2 seeds");

// ── Email cooldown + digest ──
const now = new Date("2026-11-04T12:00:00Z");
const ago = (ms: number) => new Date(now.getTime() - ms);
check("instant: first email", shouldSendInstantEmail("INSTANT", null, now));
check("instant: 59 min later blocked", !shouldSendInstantEmail("INSTANT", ago(59 * 60 * 1000), now));
check("instant: 60 min later ok", shouldSendInstantEmail("INSTANT", ago(MB_EMAIL_COOLDOWN_MS), now));
check("digest mode never instant", !shouldSendInstantEmail("DIGEST", null, now));
check("off never instant", !shouldSendInstantEmail("OFF", null, now));
const notes = [
  { id: 1, createdAt: ago(2 * 3600_000), seenAt: null, emailedAt: null },
  { id: 2, createdAt: ago(10 * 60_000), seenAt: null, emailedAt: null },
  { id: 3, createdAt: ago(3 * 3600_000), seenAt: ago(3600_000), emailedAt: null },
  { id: 4, createdAt: ago(3 * 3600_000), seenAt: null, emailedAt: ago(3600_000) },
];
check("digest picks only old, unseen, unemailed", JSON.stringify(digestPending("DIGEST", notes, now).map((n) => n.id)) === "[1]");
check("digest also for INSTANT leftovers", digestPending("INSTANT", notes, now).length === 1);
check("digest OFF -> nothing", digestPending("OFF", notes, now).length === 0);
const secret = "I miss grandpa so much";
const one = replyEmailCopy("Mia", 1);
const many = replyEmailCopy("Mia", 3);
check("email copy single", one.subject.includes("Mia sent a warm reply") && !one.subject.includes(secret));
check("email copy many", many.lead === "Mia sent 3 warm replies to your notes!");
check("email copy never has reply text or stickers", ![one.subject, one.lead, many.subject, many.lead].some((t) => t.includes(secret) || /Love you|Amen|remember this/.test(t)));
check("email copy blank name", replyEmailCopy(" ", 1).lead.startsWith("Your child"));
const msgOne = replyEmailCopy("Mia", 1, "message");
const msgMany = replyEmailCopy("Mia", 2, "message");
check("message email single", msgOne.subject === "💌 Mia sent you a message" && msgOne.lead === "Mia sent you a message on a Bible verse!");
check("message email many", msgMany.lead === "Mia sent you 2 messages on Bible verses!");
check(
  "message email never has the child's text or stickers",
  ![msgOne.subject, msgOne.lead, msgMany.subject, msgMany.lead].some((t) => t.includes(secret) || /Love you|Amen|remember this/.test(t)),
);

// ── Invites ──
const inv = { expiresAt: new Date(now.getTime() + MB_INVITE_TTL_MS), acceptedAt: null, ownerAccountId: "mom", acceptorId: "dad" };
check("invite ok", canAcceptInvite(inv, now).ok);
check("invite used", !canAcceptInvite({ ...inv, acceptedAt: now }, now).ok);
check("invite expired", !canAcceptInvite({ ...inv, expiresAt: now }, now).ok);
check("invite self", !canAcceptInvite({ ...inv, acceptorId: "mom" }, now).ok);
const t1 = newInviteToken();
const t2 = newInviteToken();
check("token shape", isInviteTokenShape(t1.token) && !isInviteTokenShape("abc") && !isInviteTokenShape(`${t1.token}=`));
check("token unique", t1.token !== t2.token);
check("hash stored, not token", t1.tokenHash === hashInviteToken(t1.token) && t1.tokenHash !== t1.token && /^[0-9a-f]{64}$/.test(t1.tokenHash));
check("invite TTL 7 days", MB_INVITE_TTL_MS === 7 * 24 * 3600_000);

// ── Situations ──
const ORIGINAL_REFS: Record<string, readonly string[]> = {
  "losing-a-pet": ["Psalm 34:19", "Matthew 5:4"],
  "feeling-sad": ["Isaiah 41:10", "Psalm 147:3"],
  lonely: ["Deuteronomy 31:6", "John 15:15"],
  bullying: ["Psalm 34:18–19", "Isaiah 41:13"],
  honesty: ["Ephesians 4:25", "Proverbs 12:22"],
  anger: ["James 1:19", "Ephesians 4:32"],
  sharing: ["Hebrews 13:16", "Luke 6:31"],
  "screen-time": ["Romans 12:2", "Proverbs 4:23"],
  moving: ["Joshua 1:9", "Psalm 23:1–4"],
  nightmares: ["Psalm 4:9", "Philippians 4:6–7"],
  "big-day": ["Philippians 4:13", "Proverbs 3:5–6"],
  anxiety: ["Matthew 6:34", "1 Peter 5:7"],
  celebration: ["Numbers 6:24–26", "Jeremiah 29:11"],
  "just-because": ["Zephaniah 3:17", "1 Corinthians 13:4–7"],
  dreams: ["Matthew 5:16", "Ephesians 2:10"],
};
const GROUP_COUNTS = SITUATION_GROUPS.map((group) => group.situations.length);
check("four groups", SITUATION_GROUPS.length === 4 && SITUATION_GROUPS.map((group) => group.title).join("|") === "Love & Comfort|Wisdom & Growth|Courage & Peace|Mom's Prayer for You");
check("308 moments = 15 original + 293 dataset additions", SITUATIONS.length === 308 && ORIGINAL_SITUATIONS.length === 15 && GROUP_COUNTS.join(",") === "74,91,75,68");
check("situation keys unique", new Set(SITUATIONS.map((s) => s.key)).size === SITUATIONS.length);
check("situation lookup", getSituation("losing-a-pet")?.title === "Losing a Pet" && isSituationKey("anger") && !isSituationKey("nope"));
check("original chips stay first and unchanged", SITUATION_GROUPS.every((group) => ORIGINAL_SITUATIONS.filter((situation) => group.situations.some((item) => item.key === situation.key)).every((situation, index) => group.situations[index]?.key === situation.key)));
for (const situation of ORIGINAL_SITUATIONS) {
  const live = getSituation(situation.key);
  check(`original ${situation.key} title`, live?.title === situation.title);
  check(`original ${situation.key} refs`, JSON.stringify(live?.refs.map((ref) => ref.label)) === JSON.stringify(ORIGINAL_REFS[situation.key]));
}
check("dataset coverage", DATASET_MOMENT_COUNT === 300 && OMITTED_DATASET_MOMENTS.length === 7 && SITUATIONS.length === DATASET_MOMENT_COUNT - OMITTED_DATASET_MOMENTS.length + ORIGINAL_SITUATIONS.length);
for (const omitted of OMITTED_DATASET_MOMENTS) {
  check(`omitted ${omitted.slug} kept`, Boolean(getSituation(omitted.keptAs)) && omitted.reason.length > 20);
  if (omitted.slug !== "losing-a-pet") check(`omitted ${omitted.slug} is not a second chip`, !SITUATIONS.some((situation) => situation.key === omitted.slug));
}
check("Psalm 4:8 corn verse is not linked for sleep", !SITUATIONS.some((situation) => situation.refs.some((ref) => ref.book === "psalms" && ref.chapter === 4 && ref.verse === 8)));
check("nightmares keeps Psalm 4:9", getSituation("nightmares")?.refs.some((ref) => ref.label === "Psalm 4:9") === true);
for (const renumbered of RENUMBERED_REFS) {
  const situation = getSituation(renumbered.key);
  check(`renumber ${renumbered.key}`, situation?.refs[0]?.label === renumbered.to && !situation.refs.some((ref) => ref.label === renumbered.from));
}
const partialKeys = new Set(PARTIAL_REFS.map((item) => item.key));
for (const partial of PARTIAL_REFS) {
  const ref = getSituation(partial.key)?.refs[0];
  const mapped = ref ? nabreToDouay(ref.book, ref.chapter, ref.verse) : null;
  const douay = mapped ? `${mapped.slug} ${mapped.chapter}:${mapped.verse}${mapped.verseEnd ? `–${mapped.verseEnd}` : ""}` : "";
  check(`partial ${partial.key}`, Boolean(mapped) && mapped!.quality === "partial" && douay === partial.douay, { douay, partial });
}
for (const situation of SITUATIONS) {
  check(`${situation.key} has a verse`, situation.refs.length > 0);
  check(`${situation.key} short label`, situation.title.length > 0 && situation.title.length <= 32 && !/seo|search volume/i.test(situation.title));
  for (const ref of situation.refs) {
    check(`${situation.key} ${ref.label}: no non-official naming`, !/douay/i.test(ref.label));
    for (const verse of [ref.verse, ...(ref.verseEnd ? [ref.verseEnd] : [])]) {
      const mapped = nabreToDouay(ref.book, ref.chapter, verse);
      const partialOk = partialKeys.has(situation.key) && verse === ref.verse && !ref.verseEnd && mapped?.quality === "partial";
      check(`${situation.key} ${ref.label} v${verse} maps`, Boolean(mapped) && (partialOk || mapped!.quality === "exact"), mapped);
    }
    check(`${situation.key} ${ref.label} label matches numbers`, ref.label.includes(`${ref.chapter}:${ref.verse}`), ref);
  }
}
const indexedKeys = SITUATIONS.filter((situation) => getSituationSeo(situation.key)).map((situation) => situation.key);
check("public verse pages stay the original 15", indexedKeys.length === 15 && SITUATION_SEO.length === 15 && indexedKeys.every((key) => ORIGINAL_REFS[key]));
check("sitemap does not add new moment urls", JSON.stringify(bibleVerseMomentPaths()) === JSON.stringify(indexedKeys.map((key) => `/bible-verses-for-kids/${key}`)));
check("bullying care does not say to tolerate harm", (getSituation("bullying")?.care ?? "").includes("trusted adult") && !(getSituation("bullying")?.care ?? "").toLowerCase().includes("just pray"));

// ── Verse ownership (continued verses belong to the previous numbered verse) ──
const markers = [
  { verse: 1, start: 0 },
  { verse: 2, start: 6 },
  { verse: 3, start: 12 },
];
const labels = [
  { verse: 1, text: "1", ref: "1:1" },
  { verse: 2, text: "2", ref: "1:2" },
  { verse: 3, text: "2", ref: "1:2", continued: true as const },
];
const owners = ownerVerseMap(markers, labels);
check("owner: continued -> previous", owners.get(3) === 2 && owners.get(1) === 1);
const chars = charOwnerVerses(18, markers, owners);
check("char owners", chars[0] === 1 && chars[7] === 2 && chars[15] === 2);
const texts = ownerVerseTexts("Alpha Bravo Charl.", markers, owners);
check("owner texts merged", texts.get(2) === "Bravo Charl." && texts.get(1) === "Alpha", [...texts]);

console.log(`${checks - failures}/${checks} checks passed`);
if (failures) process.exit(1);
