/**
 * Build the public card previews: public/cards/thumbs/<ID>.webp (432×540, 4:5).
 * Full-size PNGs are NOT copied into the repo — they go to Vercel Blob (scripts/upload-cards.ts).
 *
 *   .\node_modules\.bin\tsx scripts/build-card-thumbs.ts --src C:\Users\jisun\cpac\mockups\resource\cards
 *   .\node_modules\.bin\tsx scripts/build-card-thumbs.ts --src <dir> --only LIT-022,FEA-030
 */
import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import { PICTURE_CARDS } from "../src/lib/resource/cards";
import { argValue, findCardPngs } from "./card-files";

const OUT_DIR = path.join(process.cwd(), "public", "cards", "thumbs");
const W = 432;
const H = 540;

async function main() {
  const argv = process.argv.slice(2);
  const src = argValue(argv, "--src");
  if (!src) throw new Error("Pass --src <folder with ID.png files>");
  const only = argValue(argv, "--only")?.split(",").map((s) => s.trim().toUpperCase());

  const files = await findCardPngs(src);
  await fs.mkdir(OUT_DIR, { recursive: true });
  const ids = PICTURE_CARDS.map((c) => c.id).filter((id) => !only || only.includes(id));
  const missing: string[] = [];
  let total = 0;
  for (const id of ids) {
    const file = files.get(id);
    if (!file) {
      missing.push(id);
      continue;
    }
    const meta = await sharp(file).metadata();
    if (meta.width !== 1080 || meta.height !== 1350) {
      console.warn(`! ${id}: expected 1080×1350, got ${meta.width}×${meta.height}`);
    }
    const out = path.join(OUT_DIR, `${id}.webp`);
    const info = await sharp(file).resize(W, H, { fit: "cover" }).webp({ quality: 74, effort: 6 }).toFile(out);
    total += info.size;
  }
  console.log(`Wrote ${ids.length - missing.length} thumbnails to public/cards/thumbs (${(total / 1e6).toFixed(1)} MB)`);
  if (missing.length) console.warn(`Missing originals for ${missing.length}: ${missing.join(", ")}`);
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : e);
  process.exit(1);
});
