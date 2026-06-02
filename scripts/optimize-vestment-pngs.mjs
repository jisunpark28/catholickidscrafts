/**
 * Normalize vestment PNGs: same scale for every color, full body (no crop), shared canvas.
 */
import sharp from "sharp";
import { readdir } from "node:fs/promises";
import path from "node:path";

const outDir = path.join("public", "games", "liturgical-vestments");

const CANVAS_W = 960;
const CANVAS_H = 1040;
/** Max painted figure height on the canvas (head to feet). */
const FIGURE_MAX_H = 860;
const PAD_TOP = 56;
const PAD_BOTTOM = 36;

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

async function loadTrimmed(file) {
  const filePath = path.join(outDir, file);
  const buf = await (await flattenAlpha(filePath)).trim({ threshold: 8 }).png().toBuffer();
  const meta = await sharp(buf).metadata();
  return { file, buf, width: meta.width ?? 1, height: meta.height ?? 1 };
}

async function main() {
  const files = (await readdir(outDir)).filter(
    (f) => f.startsWith("character-") && f.endsWith(".png") && f !== "character-base.png",
  );

  const trimmed = [];
  for (const f of files) trimmed.push(await loadTrimmed(f));

  const maxH = Math.max(...trimmed.map((t) => t.height));
  const scale = FIGURE_MAX_H / maxH;

  for (const t of trimmed) {
    const fw = Math.round(t.width * scale);
    const fh = Math.round(t.height * scale);
    const left = Math.floor((CANVAS_W - fw) / 2);
    const top = CANVAS_H - PAD_BOTTOM - fh;

    const figure = await sharp(t.buf)
      .resize(fw, fh, { fit: "fill" })
      .png()
      .toBuffer();

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
      .toFile(path.join(outDir, t.file));

    console.log(t.file, `scaled ${t.width}x${t.height} → ${fw}x${fh}`, `@ ${left},${top}`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
