/**
 * Build static Sunday sheet content from the TOC spreadsheet export.
 *
 * Input:  data/sunday-sheets.source.json  ({ tabs: { [tab]: { header, rows } } },
 *         exported from Google Sheet 1jMkVlmFDBPsDev00uBRrX2uV5Itno0QA3ju0wkT33vI)
 * Output: src/data/sunday-sheets/{KEY}.json + src/data/sunday-sheets/index.ts
 *
 *   tsx scripts/build-sunday-sheets.ts --keys=A_OT30,SOL_ALLSAINTS   (subset)
 *   tsx scripts/build-sunday-sheets.ts --all
 *
 * Exits 1 if a row fails the GospelSheet field limits (gospelSheetLevelSchema),
 * including the per-level activity (type + JSON data, see src/lib/sheet-activities/schema.ts).
 */
import fs from "node:fs";
import path from "node:path";
import { gospelSheetLevelSchema } from "../src/lib/gospel-sheet-schema";
import { isValidSheetKey } from "../src/lib/sheet-keys/keys";

type Tab = { header: string[]; rows: string[][] };
type Source = { tabs: Record<string, Tab> };

const ROOT = path.resolve(__dirname, "..");
const SRC = path.join(ROOT, "data", "sunday-sheets.source.json");
const OUT = path.join(ROOT, "src", "data", "sunday-sheets");

const SEASON_COLOR: Record<string, string> = {
  Advent: "violet",
  Christmas: "white",
  "Ordinary Time": "green",
  Lent: "violet",
  "Holy Week": "red",
  Easter: "white",
};
const SOL_COLOR: Record<string, string> = {
  XMAS2: "white",
  SOL_PRESENTATION: "white",
  SOL_JOHNBAPTIST: "white",
  SOL_PETERPAUL: "red",
  SOL_TRANSFIGURATION: "white",
  SOL_ASSUMPTION: "white",
  SOL_HOLYCROSS: "red",
  SOL_ALLSAINTS: "white",
  SOL_ALLSOULS: "violet",
  SOL_LATERAN: "white",
  SOL_IMMACULATE: "white",
};
// Colour overrides inside a season (Gaudete/Laetare rose, Pentecost red, feasts white).
const KEY_COLOR: Array<[RegExp, string]> = [
  [/_ADV03$/, "rose"],
  [/_LNT04$/, "rose"],
  [/_PENTECOST$/, "red"],
  [/_(TRINITY|CORPUSCHRISTI|OT34|BAPTISM)$/, "white"],
];

// The spreadsheet has no heart-intro column; use the existing sheet's wording
// (only shown when the activity is the heart).
const HEART_INTRO = {
  1: "Draw inside the heart, then color it!",
  2: "Write 3 ways you can do each, then color the border!",
};

function args() {
  const all = process.argv.includes("--all");
  const keysArg = process.argv.find((a) => a.startsWith("--keys="));
  const keys = keysArg ? keysArg.slice(7).split(",").map((k) => k.trim()).filter(Boolean) : [];
  if (!all && keys.length === 0) throw new Error("Pass --keys=KEY1,KEY2 or --all");
  return { all, keys };
}

function cell(tab: Tab, row: string[], startsWith: string): string {
  const i = tab.header.findIndex((h) => h.startsWith(startsWith));
  if (i < 0) throw new Error(`Column "${startsWith}" not found`);
  return (row[i] ?? "").trim();
}

function splitList(v: string, sep: RegExp): string[] {
  return v.split(sep).map((s) => s.trim()).filter(Boolean);
}

/** "Title · A / B" */
function parseHeart(v: string): { title: string; a: string; b: string } {
  const [title, rest = ""] = v.split(" · ");
  const [a = "", b = ""] = rest.split(" / ");
  return { title: title.trim(), a: a.trim(), b: b.trim() };
}

function level(tab: Tab, row: string[], n: 1 | 2) {
  const p = `L${n} `;
  const heart = parseHeart(cell(tab, row, `${p}Heart activity`));
  const qPrefix = n === 1 ? `${p}Let's talk` : `${p}Think about it`;
  const content = {
    title: cell(tab, row, `${p}Title`),
    story: cell(tab, row, `${p}Today's Story`),
    keyLine: cell(tab, row, n === 1 ? `${p}Trace the words` : `${p}Copy the key line`),
    heartTitle: heart.title,
    heartIntro: HEART_INTRO[n],
    heartLabelA: heart.a,
    heartLabelB: heart.b,
    questions: [cell(tab, row, `${qPrefix} Q1`), cell(tab, row, `${qPrefix} Q2`)],
    actions: splitList(cell(tab, row, `${p}This week I will`), /;/),
    prayer: cell(tab, row, `${p}Prayer`),
  };
  return { ...content, activity: activity(tab, row, n), words: splitList(cell(tab, row, `${p}Words`), /·/) };
}

/** "L1 Activity type" + "L1 Activity data" (JSON). Validated later with the level schema. */
function activity(tab: Tab, row: string[], n: 1 | 2): unknown {
  const type = cell(tab, row, `L${n} Activity type`);
  const raw = cell(tab, row, `L${n} Activity data`);
  if (!type) return undefined;
  let data: Record<string, unknown>;
  try {
    data = raw ? (JSON.parse(raw) as Record<string, unknown>) : {};
  } catch {
    throw new Error(`${cell(tab, row, "Sheet key")} L${n}: Activity data is not valid JSON`);
  }
  const idea = Number(cell(tab, row, `L${n} Activity idea #`)) || undefined;
  return { type, ...data, ...(idea ? { idea } : {}) };
}

function colorFor(key: string, season: string): string {
  if (SOL_COLOR[key]) return SOL_COLOR[key];
  for (const [re, c] of KEY_COLOR) if (re.test(key)) return c;
  return SEASON_COLOR[season] ?? "green";
}

function build(tab: Tab, row: string[]) {
  const key = cell(tab, row, "Sheet key");
  const isSol = tab.header.includes("Rank");
  const season = isSol ? cell(tab, row, "Rank") : cell(tab, row, "Season");
  const liturgicalName = isSol
    ? cell(tab, row, "Celebration").replace(/\s*\([^)]*\)\s*$/, "")
    : cell(tab, row, "Sunday");
  const icons = splitList(cell(tab, row, "Spot icons"), /,/).map((i) => `icon_${i}.png`);
  return {
    key,
    liturgicalName,
    season,
    gospelRef: displayRef(cell(tab, row, "Gospel reference")),
    keyVerseDR: cell(tab, row, "Key verse"),
    color: colorFor(key, season),
    levels: { level1: level(tab, row, 1), level2: level(tab, row, 2) },
    art: {
      main: `${key}_main.png`,
      heart: `${key}_heart.png`,
      icons,
      mainBrief: cell(tab, row, "Main illustration"),
      heartBrief: cell(tab, row, "Heart activity art"),
    },
  };
}

function writeIndex() {
  const keys = fs
    .readdirSync(OUT)
    .filter((f) => f.endsWith(".json"))
    .map((f) => f.slice(0, -5))
    .sort();
  const ident = (k: string) => `s_${k}`;
  const lines = [
    "// GENERATED by scripts/build-sunday-sheets.ts - do not edit by hand.",
    'import type { SundaySheetContent } from "@/lib/sunday-sheet-content";',
    ...keys.map((k) => `import ${ident(k)} from "./${k}.json";`),
    "",
    "export const SUNDAY_SHEETS: Record<string, SundaySheetContent> = {",
    ...keys.map((k) => `  ${k}: ${ident(k)} as SundaySheetContent,`),
    "};",
    "",
  ];
  fs.writeFileSync(path.join(OUT, "index.ts"), lines.join("\n"));
  return keys.length;
}

function main() {
  const { all, keys } = args();
  const source = JSON.parse(fs.readFileSync(SRC, "utf8")) as Source;
  fs.mkdirSync(OUT, { recursive: true });
  const wanted = new Set(keys);
  const problems: string[] = [];
  const warnings: string[] = [];
  let written = 0;
  for (const [tabName, tab] of Object.entries(source.tabs)) {
    for (const row of tab.rows) {
      const key = cell(tab, row, "Sheet key");
      if (!key || (!all && !wanted.has(key))) continue;
      wanted.delete(key);
      if (!isValidSheetKey(key)) {
        problems.push(`${tabName} ${key}: not a valid sheet key`);
        continue;
      }
      const sheet = build(tab, row);
      for (const n of [1, 2] as const) {
        const lv = n === 1 ? sheet.levels.level1 : sheet.levels.level2;
        const parsed = gospelSheetLevelSchema.safeParse(lv);
        if (parsed.success) Object.assign(lv, { activity: parsed.data.activity });
        if (!parsed.success) {
          for (const issue of parsed.error.issues) {
            problems.push(`${key} L${n} ${issue.path.join(".")}: ${issue.message}`);
          }
        }
        if (lv.heartLabelA.length > 30 || lv.heartLabelB.length > 30) {
          warnings.push(`${key} L${n}: heart label over 30 chars (font shrinks)`);
        }
        if (n === 1 && lv.keyLine.length > 28) {
          warnings.push(`${key} L1: trace line ${lv.keyLine.length} chars (may wrap at 30px)`);
        }
      }
      fs.writeFileSync(path.join(OUT, `${key}.json`), `${JSON.stringify(sheet, null, 2)}\n`);
      written++;
    }
  }
  for (const k of wanted) problems.push(`${k}: not found in source`);
  const total = writeIndex();
  console.log(`build-sunday-sheets: wrote ${written}, index has ${total} keys`);
  for (const w of warnings) console.log(`warn: ${w}`);
  if (problems.length) {
    for (const p of problems) console.error(`error: ${p}`);
    process.exit(1);
  }
}

main();

/** Keep long sheet notes out of the printed header: drop "(...)" notes and option lists. */
function displayRef(raw: string): string {
  if (raw.length <= 60) return raw;
  let r = raw.split(/\. Options include/)[0].replace(/\s*\([^)]*\)/g, "").trim();
  const m = r.match(/^Varies by cycle:\s*A (.+?); B (.+?); C (.+)$/);
  if (m) r = `${m[1]} / ${m[2]} / ${m[3]}`;
  return r;
}
