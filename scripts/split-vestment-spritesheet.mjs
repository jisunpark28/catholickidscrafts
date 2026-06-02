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

/** [color, col, row] — 3 columns × 2 rows */
const CELLS = [
  ["white", 0, 0],
  ["rose", 1, 0],
  ["red", 2, 0],
  ["green", 0, 1],
  ["purple", 1, 1],
] ;

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
    const left = col * cellW;
    const top = row * cellH;
    const outPath = path.join(outDir, `character-${color}.png`);
    await img
      .clone()
      .extract({ left, top, width: cellW, height: cellH })
      .resize(480, 960, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png()
      .toFile(outPath);
    console.log("wrote", outPath);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
