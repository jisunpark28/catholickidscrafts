/**
 * Split 2×3 vestment reference grid into per-color PNGs.
 * Usage: node scripts/split-vestment-spritesheet.mjs [input.png]
 */
import sharp from "sharp";
import { mkdir } from "node:fs/promises";
import path from "node:path";

const input =
  process.argv[2] ??
  path.join("public", "games", "liturgical-vestments", "spritesheet-source.png");

const outDir = path.join("public", "games", "liturgical-vestments");

const OUT_W = 960;
const OUT_H = 1920;

/** [color, col, row] — 3 columns × 2 rows (matches reference sheet). */
const CELLS = [
  ["white", 0, 0],
  ["rose", 1, 0],
  ["red", 2, 0],
  ["green", 0, 1],
  ["purple", 1, 1],
  ["lavender", 2, 1],
];

/** Figures in these cells sit higher — include extra rows above when cropping. */
const HEADROOM_COLORS = new Set(["green", "purple", "lavender"]);

async function main() {
  await mkdir(outDir, { recursive: true });
  const img = sharp(input);
  const { width, height } = await img.metadata();
  if (!width || !height) throw new Error("Could not read image size");

  const cols = 3;
  const rows = 2;
  const cellW = Math.floor(width / cols);
  const cellH = Math.floor(height / rows);

  for (const [color, col, row] of CELLS) {
    const headroom = HEADROOM_COLORS.has(color) ? Math.floor(cellH * 0.18) : 0;
    const left = col * cellW;
    const top = Math.max(0, row * cellH - headroom);
    const extractH = Math.min(cellH + headroom, height - top);

    const outPath = path.join(outDir, `character-${color}.png`);
    await img
      .clone()
      .extract({ left, top, width: cellW, height: extractH })
      .resize(OUT_W, OUT_H, {
        fit: "contain",
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      })
      .png()
      .toFile(outPath);
    console.log("wrote", outPath, headroom ? `(+${headroom}px headroom)` : "");
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
