/**
 * Transparent BG, trim empty margins, keep headroom, scale for web.
 */
import sharp from "sharp";
import { readdir } from "node:fs/promises";
import path from "node:path";

const outDir = path.join("public", "games", "liturgical-vestments");
const MAX_HEIGHT = 920;
const BASE_TOP = 32;

/** Extra top padding after trim (these sprites sit higher in the source cell). */
const EXTRA_TOP = {
  green: 28,
  purple: 32,
  lavender: 32,
};

function extraTopFor(file) {
  if (file.includes("character-green")) return EXTRA_TOP.green;
  if (file.includes("character-lavender")) return EXTRA_TOP.lavender;
  if (file.includes("character-purple")) return EXTRA_TOP.purple;
  return 0;
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

async function processFile(file) {
  if (!file.startsWith("character-") || !file.endsWith(".png")) return;
  if (file === "character-base.png") return;

  const filePath = path.join(outDir, file);
  const topPad = BASE_TOP + extraTopFor(file);
  const pipeline = await flattenAlpha(filePath);

  await pipeline
    .trim({ threshold: 12 })
    .extend({
      top: topPad,
      bottom: 12,
      left: 12,
      right: 12,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
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
  console.log("optimized", file, `${meta.width}x${meta.height}`, `top=${topPad}`);
}

async function main() {
  const files = await readdir(outDir);
  for (const f of files) await processFile(f);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
