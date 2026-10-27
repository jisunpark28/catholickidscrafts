/**
 * Generate Base PNG + layout JSON for Resource editor (Phase 2).
 *
 * Uses Playwright against a running Next app (capture host).
 * Prefer: `npx next dev` then this script (avoids npm `predev` prisma lock issues).
 *
 *   npx playwright install chromium
 *   npx next dev
 *   npx tsx scripts/generate-sheet-bases.ts --key A_OT30
 */
import fs from "node:fs/promises";
import path from "node:path";
import { chromium, type Page } from "playwright";
import { keyToSlug } from "../src/lib/resource/sheets";
import { sheetBasePublicPaths, sheetLayoutSchema } from "../src/lib/resource/sheet-base";
import { listSundaySheetKeys } from "../src/lib/sunday-sheet-content";

const BASE_URL = (process.env.BASE_URL ?? "http://127.0.0.1:3000").replace(/\/$/, "");
const OUT_DIR = path.join(process.cwd(), "public", "sheet-bases");

function parseArgs(argv: string[]) {
  let key: string | null = null;
  let all = false;
  let levels: (1 | 2)[] = [1, 2];
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--all") all = true;
    if (a === "--key") key = argv[++i]?.toUpperCase() ?? null;
    if (a === "--levels") {
      levels = (argv[++i] ?? "1,2")
        .split(",")
        .map((n) => Number(n) as 1 | 2)
        .filter((n) => n === 1 || n === 2);
    }
  }
  return { key, all, levels };
}

async function captureOne(page: Page, key: string, level: 1 | 2) {
  const slug = keyToSlug(key);
  const url = `${BASE_URL}/dev/sheet-base/${slug}?level=${level}`;
  await page.goto(url, { waitUntil: "domcontentloaded", timeout: 90_000 });
  await page.waitForSelector("[data-sheet-page]", { timeout: 60_000 });
  await page.waitForFunction(() => (window as unknown as { __CKC_SHEET_BASE__?: { ready?: boolean } }).__CKC_SHEET_BASE__?.ready === true, {
    timeout: 60_000,
  });

  const handle = await page.waitForSelector("[data-sheet-page]", { timeout: 15_000 });
  const paths = sheetBasePublicPaths(key, level);
  await fs.mkdir(OUT_DIR, { recursive: true });

  const pngPath = path.join(process.cwd(), paths.fsPng);
  await handle.screenshot({ path: pngPath, type: "png" });

  const layoutRaw = await page.evaluate(async () => {
    const api = (window as unknown as { __CKC_SHEET_BASE__?: { capture: () => Promise<{ layout: unknown }> } }).__CKC_SHEET_BASE__;
    if (!api) throw new Error("capture API missing");
    const { layout } = await api.capture();
    return layout;
  });
  const layout = sheetLayoutSchema.parse(layoutRaw);
  const jsonPath = path.join(process.cwd(), paths.fsLayout);
  await fs.writeFile(jsonPath, `${JSON.stringify(layout, null, 2)}\n`, "utf8");

  console.log(`ok ${key} L${level} → ${paths.png} (${layout.boxes.length} boxes), rev=${layout.rev}`);
}

async function main() {
  const { key, all, levels } = parseArgs(process.argv.slice(2));
  const keys = all ? listSundaySheetKeys() : key ? [key] : ["A_OT30"];
  if (!all && key && !listSundaySheetKeys().includes(key)) {
    throw new Error(`Unknown sheet key: ${key}`);
  }

  // Smoke-check the capture host before launching Chromium.
  const probe = await fetch(`${BASE_URL}/dev/sheet-base/${keyToSlug(keys[0]!)}?level=1`).catch(() => null);
  if (!probe || !probe.ok) {
    throw new Error(
      `Capture host not reachable at ${BASE_URL} (status ${probe?.status ?? "fetch failed"}).\n` +
        `Start the app with: npx next dev\n` +
        `Then re-run: npx tsx scripts/generate-sheet-bases.ts --key ${keys[0]}`,
    );
  }

  console.log(`BASE_URL=${BASE_URL}`);
  console.log(`Generating ${keys.length} key(s) × ${levels.length} level(s)…`);

  // Prefer system Chrome/Edge so we do not need `playwright install chromium` downloads.
  const channel = (process.env.PLAYWRIGHT_CHANNEL as "chrome" | "msedge" | undefined) ?? "chrome";
  const browser = await chromium.launch({ headless: true, channel });
  const page = await browser.newPage({ viewport: { width: 1100, height: 1400 }, deviceScaleFactor: 2 });
  try {
    for (const k of keys) {
      for (const level of levels) {
        await captureOne(page, k, level);
      }
    }
  } finally {
    await browser.close();
  }
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : e);
  process.exit(1);
});
