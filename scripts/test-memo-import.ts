/**
 * Mom's Bible PR-4 (pure parts, no DB): memo import mapping, PDF ordering and options, PDF/Plus
 * gating, Prayer Starters, mockup sticker labels and the free-preview sample.
 * Run: npx tsx scripts/test-memo-import.ts
 */
import { SAMPLE_BOOK, SAMPLE_CHAPTER, sampleGenesisView } from "../src/data/moms-bible/sample-genesis-1";
import { getSituation } from "../src/data/moms-bible/situations";
import { CATHOLIC_BOOK_NAMES_EN } from "../src/lib/bible/catholic-book-names/locale-data";
import { MB_STAMP_INFO, colorLabel, isMbColor, isMbSticker, prayerStarters, stickerLabel } from "../src/lib/moms-bible/constants";
import { MEMO_COLOR_MAP, memosToImport, shouldOfferImport, type ImportableMemo } from "../src/lib/moms-bible/memo-import";
import { buildPdfEntries, pdfTitle, rolesPhrase, type PdfHighlightIn, type PdfNoteIn } from "../src/lib/moms-bible/pdf-book";
import { MB_PDF_PLUS, canParentPrintPdf } from "../src/lib/moms-bible/rules";

let failures = 0;
let checks = 0;
function check(name: string, ok: boolean, detail?: unknown) {
  checks++;
  if (!ok) {
    failures++;
    console.error(`FAIL ${name}`, detail ?? "");
  }
}

// ── Memo import ──
const t0 = new Date("2025-03-01T12:00:00Z");
const memo = (id: string, over: Partial<ImportableMemo> = {}): ImportableMemo => ({
  id,
  bookSlug: "psalms",
  chapter: 33,
  startVerse: 19,
  endVerse: 19,
  body: "God is close to you.",
  color: "yellow",
  createdAt: t0,
  ...over,
});
check("colour map", MEMO_COLOR_MAP.yellow === "YELLOW" && MEMO_COLOR_MAP.sky === "BLUE" && MEMO_COLOR_MAP.green === "GREEN" && MEMO_COLOR_MAP.pink === "PINK" && MEMO_COLOR_MAP.purple === "PINK");
const imported = memosToImport(
  [memo("a"), memo("b", { color: "sky" }), memo("c", { body: "   " }), memo("d", { color: "weird" }), memo("e", { startVerse: 5, endVerse: 3 })],
  new Set(["b"]),
);
check("skips already imported + empty", imported.map((m) => m.importedFromMemoId).join(",") === "a,d,e", imported);
check("keeps original date", imported[0]!.createdAt === t0);
check("unknown colour -> yellow", imported.find((m) => m.importedFromMemoId === "d")!.color === "YELLOW");
check("reversed range fixed", imported.find((m) => m.importedFromMemoId === "e")!.startVerse === 3 && imported.find((m) => m.importedFromMemoId === "e")!.endVerse === 5);
check("body clipped to 2000", memosToImport([memo("x", { body: "a".repeat(2500) })], new Set())[0]!.body.length === 2000);
check("idempotent: second run imports nothing", memosToImport([memo("a")], new Set(["a"])).length === 0);
check("offer: first time", shouldOfferImport({ count: 3, promptAt: null, doneAt: null }));
check("offer: not after Not now (popup)", !shouldOfferImport({ count: 3, promptAt: t0, doneAt: null }));
check("offer: /account keeps it after Not now", shouldOfferImport({ count: 3, promptAt: t0, doneAt: null }, true));
check("offer: never after done", !shouldOfferImport({ count: 3, promptAt: null, doneAt: t0 }, true));
check("offer: nothing to move", !shouldOfferImport({ count: 0, promptAt: null, doneAt: null }, true));

// ── PDF gating (server-enforced on the page and the dedication API) ──
check("pdf: not linked -> 404", (() => { const d = canParentPrintPdf({ linked: false, ownPlus: true }); return !d.ok && d.status === 404; })());
check("pdf: no own Plus -> 402", (() => { const d = canParentPrintPdf({ linked: true, ownPlus: false }); return !d.ok && d.status === 402 && d.error === MB_PDF_PLUS; })());
check("pdf: linked + own Plus ok", canParentPrintPdf({ linked: true, ownPlus: true }).ok);

// ── PDF entries: Bible order, letters first, options ──
const order = Object.keys(CATHOLIC_BOOK_NAMES_EN);
check("canonical order has genesis before psalms before john", order.indexOf("genesis") < order.indexOf("psalms") && order.indexOf("psalms") < order.indexOf("john"));
const d1 = new Date("2026-11-02T15:00:00Z");
const d2 = new Date("2026-11-04T15:00:00Z");
const note = (id: string, over: Partial<PdfNoteIn>): PdfNoteIn => ({
  id,
  authorParentId: "mom",
  bookSlug: "psalms",
  chapter: 33,
  startVerse: 19,
  endVerse: 19,
  color: "YELLOW",
  situationKey: null,
  createdAt: d1,
  items: [{ authorKind: "PARENT", kind: "TEXT", body: "note", stickerKey: null, createdAt: d1 }],
  ...over,
});
const notes: PdfNoteIn[] = [
  note("n1", {
    items: [
      { authorKind: "PARENT", kind: "TEXT", body: "I know you miss Biscuit", stickerKey: null, createdAt: d1 },
      { authorKind: "CHILD", kind: "STICKER", body: null, stickerKey: "love", createdAt: d2 },
    ],
    situationKey: "losing-a-pet",
  }),
  note("n2", { bookSlug: "john", chapter: 3, startVerse: 16, endVerse: 16 }),
  note("n3", { bookSlug: "genesis", chapter: 1, startVerse: 27, endVerse: 27 }),
  note("n4", { startVerse: null, endVerse: null, color: null }),
  note("n5", { authorParentId: "dad", startVerse: 5, endVerse: 5, color: "BLUE" }),
];
const hls: PdfHighlightIn[] = [
  { authorParentId: "mom", bookSlug: "psalms", chapter: 33, verse: 2, color: null, star: true, underline: false, situationKey: null },
  { authorParentId: "mom", bookSlug: "psalms", chapter: 33, verse: 19, color: "PINK", star: false, underline: false, situationKey: null },
  { authorParentId: "mom", bookSlug: "psalms", chapter: 33, verse: 7, color: null, star: false, underline: false, situationKey: null },
];
const all = buildPdfEntries(notes, hls, order, { me: "mom", others: true, replies: true });
const keys = all.map((e) => `${e.bookSlug}:${e.chapter}:${e.startVerse ?? "L"}`);
check("bible order, letter first, verses ascending", keys.join(" ") === "genesis:1:27 psalms:33:L psalms:33:2 psalms:33:5 psalms:33:19 john:3:16", keys);
const v19 = all.find((e) => e.startVerse === 19)!;
check("highlight + note merged on one verse (my colour wins)", v19.color === "PINK" && v19.notes.length === 1 && v19.situationKey === "losing-a-pet");
check("star-only highlight kept", all.find((e) => e.startVerse === 2)!.star);
check("empty highlight dropped", !all.some((e) => e.startVerse === 7));
const mine = buildPdfEntries(notes, hls, order, { me: "mom", others: false, replies: true });
check("others=0 drops the other parent's notes", !mine.some((e) => e.notes.some((n) => n.authorParentId === "dad")));
const noReplies = buildPdfEntries(notes, hls, order, { me: "mom", others: true, replies: false });
check("replies=0 drops child items", noReplies.every((e) => e.notes.every((n) => n.items.every((i) => i.authorKind === "PARENT"))));
check("title one role", pdfTitle(["Mom"], "Mia Park") === "Mom's Prayer Bible for Mia");
check("title two roles", pdfTitle(["Mom", "Dad", "Mom"], "Mia") === "Mom & Dad's Prayer Bible for Mia");
check("roles phrase three", rolesPhrase(["Mom", "Dad", "Grandma"]) === "Mom, Dad & Grandma");

// ── Mockup copy: stickers, palette, stamps, Prayer Starters ──
check("sticker love", stickerLabel("love", "Mom") === "❤️ Love you, Mom!");
check("sticker amen", stickerLabel("prayed", "Mom") === "🙏 Amen!");
check("sticker remember", stickerLabel("thanks", "Mom") === "⭐ I'll remember this!");
check("palette pink uses role", colorLabel("PINK", "Dad") === "Dad's Prayer" && colorLabel("YELLOW", "Dad") === "Love & Comfort");
check("stamp labels", MB_STAMP_INFO.mine.label === "My Note" && MB_STAMP_INFO.waiting.label === "Waiting for You" && MB_STAMP_INFO.shared.label === "Shared Together");
const starters = prayerStarters("YELLOW", "Mia Park");
check("starters use first name", starters[0] === "Lord, hold Mia close today…", starters);
check("starters for every colour", (["YELLOW", "GREEN", "BLUE", "PINK"] as const).every((c) => prayerStarters(c, "Leo").length === 3));
check("starters default colour", prayerStarters(null, "").length === 3 && !prayerStarters(null, "").some((s) => s.includes("{")));

// ── Free preview sample ──
const sample = sampleGenesisView();
check("sample is genesis 1", SAMPLE_BOOK === "genesis" && SAMPLE_CHAPTER === 1);
check("sample flagged preview", sample.preview === true);
check("sample colours valid", sample.highlights.every((h) => isMbColor(h.color)));
check("sample stickers valid", sample.notes.every((n) => n.items.every((i) => i.stickerKey === null || isMbSticker(i.stickerKey))));
check("sample situations valid", sample.notes.every((n) => n.situationKey === null || Boolean(getSituation(n.situationKey))));
check("sample verses in range", sample.notes.every((n) => n.startVerse === null || (n.startVerse >= 1 && n.startVerse <= 31)));
check("sample never says Douay", !/douay/i.test(JSON.stringify(sample)));

console.log(`${checks - failures}/${checks} checks passed`);
if (failures) process.exit(1);
