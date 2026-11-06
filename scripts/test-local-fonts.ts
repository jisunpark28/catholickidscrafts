import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import provenance from "../src/assets/fonts/provenance.json";

function walk(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const file = path.join(directory, entry.name);
    return entry.isDirectory() ? walk(file) : [file];
  });
}

const hashes = new Set<string>();
for (const family of ["fredoka", "inter"] as const) {
  const file = readFileSync(`src/assets/fonts/${family}-variable.ttf`);
  const hash = createHash("sha256").update(file).digest("hex");
  assert.equal(hash, provenance[family].bundledSha256, `${family} reviewed font changed`);
  hashes.add(hash);
  assert.equal(file.readUInt32BE(0), 0x00010000, `${family} valid TrueType signature`);
  const tables = new Map<string, Buffer>();
  for (let i = 0; i < file.readUInt16BE(4); i++) {
    const offset = 12 + i * 16;
    const start = file.readUInt32BE(offset + 8);
    tables.set(file.toString("ascii", offset, offset + 4), file.subarray(start, start + file.readUInt32BE(offset + 12)));
  }
  const fvar = tables.get("fvar")!;
  assert.ok(fvar, `${family} must remain variable, not synthesize bold`);
  assert.equal(fvar.readUInt16BE(8), 1, "only the weight axis remains; other axes stay at prior defaults");
  const axis = fvar.readUInt16BE(4);
  assert.equal(fvar.toString("ascii", axis, axis + 4), "wght");
  assert.equal(fvar.readInt32BE(axis + 4) / 65536, family === "inter" ? 100 : 300);
  assert.equal(fvar.readInt32BE(axis + 12) / 65536, family === "inter" ? 900 : 700);
  const names = tables.get("name")!;
  const familyNames: string[] = [];
  const strings = names.readUInt16BE(4);
  for (let i = 0; i < names.readUInt16BE(2); i++) {
    const offset = 6 + i * 12;
    if (names.readUInt16BE(offset) === 3 && names.readUInt16BE(offset + 6) === 1) {
      const start = strings + names.readUInt16BE(offset + 10);
      familyNames.push(Buffer.from(names.subarray(start, start + names.readUInt16BE(offset + 8))).swap16().toString("utf16le"));
    }
  }
  assert.ok(familyNames.some((name) => name.toLowerCase().includes(family)), `${family} actual font identity`);
  assert.ok(tables.get("cmap")!.length > 100, `${family} character map retained`);
  const license = readFileSync(`src/assets/fonts/${family}-OFL.txt`, "utf8");
  assert.match(license, /SIL OPEN FONT LICENSE Version 1\.1/);
  assert.match(license, /Copyright/);
  assert.match(provenance[family].url, /^https:\/\/raw\.githubusercontent\.com\/google\/fonts\/[0-9a-f]{40}\//);
  console.log(`PASS ${family}: licensed variable font, preserved weight range, ${file.length} bytes, hash ${hash}`);
}
for (const file of walk("src").filter((file) => /\.(tsx?|css)$/.test(file))) {
  assert.doesNotMatch(readFileSync(file, "utf8"), /next\/font\/google|@import[^;]*fonts\.googleapis\.com/, `${file}: no build-time Google font dependency`);
}
const inter = readFileSync("src/app/layout.tsx", "utf8");
const fredoka = readFileSync("src/components/liturgy/fredoka.ts", "utf8");
assert.match(inter, /next\/font\/local/);
assert.match(inter, /weight: "100 900"/);
assert.match(inter, /--font-inter/);
assert.match(fredoka, /next\/font\/local/);
assert.match(fredoka, /weight: "500 700"/);
assert.match(fredoka, /--font-fredoka/);
assert.match(fredoka, /display: "swap"/);
if (process.argv.includes("--built")) {
  const css = walk(".next/static/css").filter((file) => file.endsWith(".css")).map((file) => readFileSync(file, "utf8")).join("\n");
  assert.match(css, /font-weight:\s*100 900/);
  assert.match(css, /font-weight:\s*500 700/);
  assert.match(css, /--font-inter/);
  assert.match(css, /--font-fredoka/);
  const emitted = new Set(walk(".next/static/media").filter((file) => file.endsWith(".ttf")).map((file) => createHash("sha256").update(readFileSync(file)).digest("hex")));
  for (const hash of hashes) assert.ok(emitted.has(hash), "reviewed font emitted into production media");
  assert.doesNotMatch(css, /https:\/\/fonts\.(googleapis|gstatic)\.com/);
  console.log("PASS built CSS: correct variable weight descriptors and both reviewed self-hosted font assets");
}
console.log("PASS: no next/font/google imports remain in application source.");
