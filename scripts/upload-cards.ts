/**
 * Upload full-size card PNGs (1080×1350) to Vercel Blob and write src/data/cards/originals-manifest.json.
 * The download API (/api/resource/cards/<id>/download) reads them only for signed-in Plus parents.
 *
 * Recommended: a dedicated PRIVATE Blob store for cards (Vercel → Storage → Create → Blob → Private),
 * connected to the project with the env var prefix CARDS → CARDS_BLOB_READ_WRITE_TOKEN.
 *
 *   # dry run (no upload, no token needed)
 *   .\node_modules\.bin\tsx scripts/upload-cards.ts --src C:\Users\jisun\cpac\mockups\resource\cards --dry-run
 *   # upload (token read from env or .env.local; never printed)
 *   .\node_modules\.bin\tsx scripts/upload-cards.ts --src C:\Users\jisun\cpac\mockups\resource\cards
 *   # re-sync a few edited cards
 *   .\node_modules\.bin\tsx scripts/upload-cards.ts --src <dir> --only LIT-022
 *
 * Options: --access private|public (default private; must match the store),
 *          --force (re-upload even if the file hash is unchanged), --concurrency N (default 4).
 * With --access public the path gets a random suffix and the URL is only kept in the server-side manifest.
 */
import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { put } from "@vercel/blob";
import { config as loadEnv } from "dotenv";
import sharp from "sharp";
import { PICTURE_CARDS } from "../src/lib/resource/cards";
import { argValue, findCardPngs } from "./card-files";

const MANIFEST_PATH = path.join(process.cwd(), "src", "data", "cards", "originals-manifest.json");

type Item = { pathname: string; url: string; size: number; sha256: string };
type Manifest = { version: number; access: "private" | "public" | null; items: Record<string, Item> };

async function readManifest(): Promise<Manifest> {
  try {
    return JSON.parse(await fs.readFile(MANIFEST_PATH, "utf8")) as Manifest;
  } catch {
    return { version: 1, access: null, items: {} };
  }
}

async function writeManifest(m: Manifest) {
  const items = Object.fromEntries(Object.entries(m.items).sort(([a], [b]) => a.localeCompare(b)));
  await fs.writeFile(MANIFEST_PATH, `${JSON.stringify({ ...m, items }, null, 2)}\n`);
}

async function main() {
  const argv = process.argv.slice(2);
  const src = argValue(argv, "--src");
  if (!src) throw new Error("Pass --src <folder with ID.png files>");
  const dryRun = argv.includes("--dry-run");
  const force = argv.includes("--force");
  const access = (argValue(argv, "--access") ?? "private") as "private" | "public";
  if (access !== "private" && access !== "public") throw new Error("--access must be private or public");
  const only = argValue(argv, "--only")?.split(",").map((s) => s.trim().toUpperCase());
  const concurrency = Math.max(1, Math.min(8, Number(argValue(argv, "--concurrency") ?? 4) || 4));

  loadEnv({ path: ".env.local", quiet: true });
  loadEnv({ path: ".env", quiet: true });
  const token = process.env.CARDS_BLOB_READ_WRITE_TOKEN?.trim() || process.env.BLOB_READ_WRITE_TOKEN?.trim();
  const tokenName = process.env.CARDS_BLOB_READ_WRITE_TOKEN?.trim()
    ? "CARDS_BLOB_READ_WRITE_TOKEN"
    : "BLOB_READ_WRITE_TOKEN";
  if (!dryRun && !token) {
    throw new Error("Set CARDS_BLOB_READ_WRITE_TOKEN (or BLOB_READ_WRITE_TOKEN) in your shell or .env.local.");
  }

  const manifest = await readManifest();
  if (manifest.access && manifest.access !== access && !force) {
    throw new Error(
      `Manifest was built with --access ${manifest.access}. Use the same, or pass --force to re-upload everything.`,
    );
  }

  const files = await findCardPngs(src);
  const ids = PICTURE_CARDS.map((c) => c.id).filter((id) => !only || only.includes(id));
  const missing = ids.filter((id) => !files.has(id));
  if (missing.length) console.warn(`Missing originals (${missing.length}): ${missing.join(", ")}`);

  const todo: { id: string; file: string; buf: Buffer; sha: string }[] = [];
  for (const id of ids) {
    const file = files.get(id);
    if (!file) continue;
    const buf = await fs.readFile(file);
    const meta = await sharp(buf).metadata();
    if (meta.format !== "png" || meta.width !== 1080 || meta.height !== 1350) {
      throw new Error(`${id}: expected a 1080×1350 PNG, got ${meta.format} ${meta.width}×${meta.height}`);
    }
    const sha = crypto.createHash("sha256").update(buf).digest("hex");
    if (!force && manifest.access === access && manifest.items[id]?.sha256 === sha) continue;
    todo.push({ id, file, buf, sha });
  }

  console.log(
    `${ids.length - missing.length} originals found · ${todo.length} to upload · access=${access}` +
      (dryRun ? " · DRY RUN" : ` · token from ${tokenName}`),
  );
  if (dryRun || !todo.length) return;

  manifest.access = access;
  let done = 0;
  let failed = 0;
  const queue = todo.slice();
  const worker = async () => {
    for (let job = queue.shift(); job; job = queue.shift()) {
      try {
        const blob = await put(`cards/originals/${job.id}-${job.sha.slice(0, 10)}.png`, job.buf, {
          access,
          contentType: "image/png",
          token,
          addRandomSuffix: access === "public",
          allowOverwrite: true,
          cacheControlMaxAge: 60 * 60 * 24 * 30,
        });
        manifest.items[job.id] = { pathname: blob.pathname, url: blob.url, size: job.buf.length, sha256: job.sha };
        done++;
        if (done % 25 === 0) {
          console.log(`  ${done}/${todo.length}`);
          await writeManifest(manifest);
        }
      } catch (e) {
        failed++;
        console.error(`  ✗ ${job.id}: ${e instanceof Error ? e.message : e}`);
      }
    }
  };
  await Promise.all(Array.from({ length: concurrency }, worker));
  await writeManifest(manifest);
  console.log(`Uploaded ${done}, failed ${failed}. Manifest: src/data/cards/originals-manifest.json (commit it).`);
  if (failed) process.exit(1);
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : e);
  process.exit(1);
});
