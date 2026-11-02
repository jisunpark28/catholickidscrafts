// Builds the small blurred greyscale previews shown to free visitors on Plus-locked picture cards.
//   node scripts/build-card-locked-previews.mjs
// In:  public/cards/thumbs/<ID>.webp (432x540 public preview)
// Out: public/cards/locked/<ID>.webp (216x270, greyscale, blurred) - re-run after adding cards.
import { mkdir, readdir } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const root = process.cwd();
const src = path.join(root, "public", "cards", "thumbs");
const out = path.join(root, "public", "cards", "locked");
const ID_RE = /^(FEA|PRY|SNT|MAR|SAC|MAS|LIT|BIB|VIR|FUN|MST)-\d{3}\.webp$/;

await mkdir(out, { recursive: true });
const files = (await readdir(src)).filter((f) => ID_RE.test(f));
let n = 0;
for (const f of files) {
  await sharp(path.join(src, f))
    .resize(216, 270, { fit: "cover" })
    .greyscale()
    .blur(3)
    .webp({ quality: 40 })
    .toFile(path.join(out, f));
  n++;
}
console.log(`locked previews: ${n} written to public/cards/locked`);
