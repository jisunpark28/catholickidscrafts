/**
 * Writes Tiny Priest mass-participation-lines.js from preview-script.ts
 * Run: pnpm run export:mass-participation
 */
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import {
  MASS_LITURGY_PARTS,
  MASS_PREVIEW_LINES,
} from "../src/lib/mass-participation/preview-script";
import { MASS_ORDER_QUEST_ANCHORS } from "../src/lib/mass-participation/mass-order-quest-anchors";

const header = `/** Auto-generated from src/lib/mass-participation/preview-script.ts — do not edit by hand. */\n`;

const body = `${header}window.MASS_PARTICIPATION_LINES = ${JSON.stringify(MASS_PREVIEW_LINES, null, 2)};\nwindow.MASS_LITURGY_PARTS = ${JSON.stringify(MASS_LITURGY_PARTS, null, 2)};\nwindow.MASS_ORDER_QUEST_ANCHORS = ${JSON.stringify(MASS_ORDER_QUEST_ANCHORS, null, 2)};\n`;

const outPath = join(process.cwd(), "public/games/tiny-priest/mass-participation-lines.js");
writeFileSync(outPath, body, "utf8");
console.log(`Wrote ${outPath} (${MASS_PREVIEW_LINES.length} lines)`);
