/**
 * Transparent BG, trim margins, generous transparent top pad on green / purple / lavender.
 */
import sharp from "sharp";
import { readdir } from "node:fs/promises";
import path from "node:path";

const outDir = path.join("public", "games", "liturgical-vestments");
const MAX_HEIGHT = 1000;

const HEADROOM_COLORS = new Set(["green", "purple", "lavender"]);

function colorFromFile(file) {
  return file.replace("character-", "").replace(".png", "");
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
        const isBg =
          r > 248 && g > 245 && b > 235 && Math.max(r, g, b) - Math.min(r, g, b) < 18;
        if (isBg) data[i + 3] = 0;
      }
      return sharp(data, { raw: { width, height, channels } }).png();
    });
}

/** Trim left/right/bottom only — keep full height so hair at the top is not clipped. */
async function trimSidesAndBottom(pipeline) {
  const { data, info } = await pipeline
    .clone()
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { width, height, channels } = info;
  let minX = width;
  let maxX = 0;
  let maxY = 0;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (data[(y * width + x) * channels + (channels - 1)] > 30) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y > maxY) maxY = y;
      }
    }
  }

  if (maxX < minX) return pipeline;

  const pad = 8;
  const extractW = Math.min(width, maxX - minX + 1 + pad * 2);
  const extractH = Math.min(height, maxY + 1 + pad);
  const left = Math.max(0, minX - pad);

  return sharp(data, { raw: { width, height, channels } }).extract({
    left,
    top: 0,
    width: Math.min(extractW, width - left),
    height: extractH,
  });
}

async function processFile(file) {
  if (!file.startsWith("character-") || !file.endsWith(".png")) return;
  if (file === "character-base.png") return;

  const color = colorFromFile(file);
  const needsHeadroom = HEADROOM_COLORS.has(color);
  const filePath = path.join(outDir, file);

  let pipeline = await flattenAlpha(filePath);

  if (needsHeadroom) {
    pipeline = await trimSidesAndBottom(pipeline);
    pipeline = pipeline.extend({
      top: 120,
      bottom: 24,
      left: 16,
      right: 16,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    });
  } else {
    pipeline = pipeline
      .trim({ threshold: 10 })
      .extend({
        top: 40,
        bottom: 16,
        left: 16,
        right: 16,
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      });
  }

  await pipeline
    .resize({
      height: MAX_HEIGHT,
      fit: "inside",
      withoutEnlargement: false,
    })
    .png({ compressionLevel: 9 })
    .toFile(filePath + ".tmp");

  const fs = await import("node:fs/promises");
  await fs.rename(filePath + ".tmp", filePath);
  const meta = await sharp(filePath).metadata();
  console.log("optimized", file, `${meta.width}x${meta.height}`, needsHeadroom ? "headroom" : "trim");
}

async function main() {
  const files = await readdir(outDir);
  for (const f of files) await processFile(f);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
