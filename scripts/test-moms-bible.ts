/**
 * Mom's Bible rules: authorization, Family Pass entitlement, reply + child message limits, notification
 * cooldown/digest, invites, situations mapping and verse ownership. No DB, fake clock.
 * Run: npx tsx scripts/test-moms-bible.ts
 */
import { SITUATIONS, SITUATION_GROUPS, getSituation, isSituationKey } from "../src/data/moms-bible/situations";
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
check("15 situations in 4 groups", SITUATIONS.length === 15 && SITUATION_GROUPS.length === 4);
check("situation keys unique", new Set(SITUATIONS.map((s) => s.key)).size === SITUATIONS.length);
check("situation lookup", getSituation("losing-a-pet")?.title === "Losing a Pet" && isSituationKey("anger") && !isSituationKey("nope"));
for (const s of SITUATIONS) {
  for (const r of s.refs) {
    check(`${s.key} ${r.label}: no non-official naming`, !/douay/i.test(r.label));
    for (const v of [r.verse, ...(r.verseEnd ? [r.verseEnd] : [])]) {
      const m = nabreToDouay(r.book, r.chapter, v);
      check(`${s.key} ${r.label} v${v} maps exactly`, Boolean(m) && m!.quality === "exact", m);
    }
    check(`${s.key} ${r.label} label matches numbers`, r.label.includes(`${r.chapter}:${r.verse}`), r);
  }
}

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
