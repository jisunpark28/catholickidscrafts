/**
 * Normalize every character PNG to the same canvas, scale, and padding.
 */
import sharp from "sharp";
import { readdir } from "node:fs/promises";
import path from "node:path";

const outDir = path.join("public", "games", "liturgical-vestments");

/** Shared output size (all colors identical). */
const CANVAS_W = 960;
const CANVAS_H = 1040;
/** Priest figure height after trim (same visual scale for every color). */
const FIGURE_H = 920;
const PAD_BOTTOM = 28;

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

  const figure = await (
    await flattenAlpha(filePath)
  )
    .trim({ threshold: 10 })
    .resize({
      height: FIGURE_H,
      fit: "inside",
      withoutEnlargement: false,
    })
    .png()
    .toBuffer();

  const meta = await sharp(figure).metadata();
  const fw = meta.width ?? 1;
  const fh = meta.height ?? 1;
  const left = Math.max(0, Math.floor((CANVAS_W - fw) / 2));
  const top = Math.max(0, CANVAS_H - PAD_BOTTOM - fh);

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
  console.log("normalized", file, `${CANVAS_W}x${CANVAS_H}`, `figure ${fw}x${fh} @ top=${top}`);
}

async function main() {
  const files = await readdir(outDir);
  for (const f of files) await processFile(f);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
