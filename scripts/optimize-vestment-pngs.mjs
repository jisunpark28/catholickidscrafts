/**
 * Normalize every character PNG to the same canvas, scale, and padding.
 */
import sharp from "sharp";
import { readdir } from "node:fs/promises";
import path from "node:path";

const outDir = path.join("public", "games", "liturgical-vestments");

const CANVAS_W = 960;
const CANVAS_H = 1040;
const FIGURE_W = 880;
const FIGURE_H = 900;
const PAD_BOTTOM = 32;

function isBackground(r, g, b) {
  if (r < 32 && g < 32 && b < 32) return true;
  if (r > 248 && g > 245 && b > 235 && Math.max(r, g, b) - Math.min(r, g, b) < 20)
    return true;
  return false;
}

function flattenAlpha(input) {
  return sharp(input)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true })
    .then(({ data, info }) => {
      const { width, height, channels } = info;
      for (let i = 0; i < data.length; i += channels) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        if (isBackground(r, g, b)) data[i + 3] = 0;
      }
      return sharp(data, { raw: { width, height, channels } }).png();
    });
}

async function processFile(file) {
  if (!file.startsWith("character-") || !file.endsWith(".png")) return;
  if (file === "character-base.png") return;

  const filePath = path.join(outDir, file);

  const figure = await (
    await flattenAlpha(filePath)
  )
    .trim({ threshold: 8 })
    .resize({
      width: FIGURE_W,
      height: FIGURE_H,
      fit: "cover",
      position: "bottom",
    })
    .png()
    .toBuffer();

  const left = Math.floor((CANVAS_W - FIGURE_W) / 2);
  const top = CANVAS_H - PAD_BOTTOM - FIGURE_H;

  await sharp({
    create: {
      width: CANVAS_W,
      height: CANVAS_H,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  })
    .composite([{ input: figure, left, top }])
    .png({ compressionLevel: 9 })
    .toFile(filePath + ".tmp");

  const fs = await import("node:fs/promises");
  await fs.rename(filePath + ".tmp", filePath);
  console.log("normalized", file, `box ${FIGURE_W}x${FIGURE_H} @ ${left},${top}`);
}

async function main() {
  const files = await readdir(outDir);
  for (const f of files) await processFile(f);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
