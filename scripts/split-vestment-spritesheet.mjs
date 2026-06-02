/**
 * Split 2×3 vestment reference grid into per-color PNGs.
 */
import sharp from "sharp";
import { mkdir } from "node:fs/promises";
import path from "node:path";

const input =
  process.argv[2] ??
  path.join("public", "games", "liturgical-vestments", "spritesheet-source.png");

const outDir = path.join("public", "games", "liturgical-vestments");

/** Bottom strip often has color name labels (RED, PURPLE, …). */
const BOTTOM_LABEL_RATIO = 0.14;

const CELLS = [
  ["white", 0, 0],
  ["rose", 1, 0],
  ["red", 2, 0],
  ["green", 0, 1],
  ["purple", 1, 1],
  ["lavender", 2, 1],
];

async function main() {
  await mkdir(outDir, { recursive: true });
  const img = sharp(input);
  const { width, height } = await img.metadata();
  if (!width || !height) throw new Error("Could not read image size");

  const cols = 3;
  const rows = 2;
  const cellW = Math.floor(width / cols);
  const cellH = Math.floor(height / rows);
  const extractH = Math.floor(cellH * (1 - BOTTOM_LABEL_RATIO));

  for (const [color, col, row] of CELLS) {
    const left = col * cellW;
    const top = row * cellH;
    const outPath = path.join(outDir, `character-${color}.png`);
    await img
      .clone()
      .extract({ left, top, width: cellW, height: extractH })
      .png()
      .toFile(outPath);
    console.log("wrote", outPath);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
