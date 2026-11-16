/**
 * Upload the ready-made craft PDFs to the PRIVATE Vercel Blob store that already holds the card
 * originals (pathnames crafts/<slug>/<slug>.pdf and crafts/<slug>/<slug>-color.pdf). The download
 * route (/api/resource/activities/<slug>/download) streams them only to signed-in Plus parents.
 *
 *   # dry run: checks every file, uploads nothing, needs no token
 *   pnpm exec tsx scripts/activities/crafts/upload_crafts_to_blob.ts --dry-run
 *   # upload (token from the shell or .env.local, never printed)
 *   pnpm exec tsx scripts/activities/crafts/upload_crafts_to_blob.ts
 *
 * Options: --src <folder> (repeatable; default C:\Users\jisun\Downloads\Crafts and ...\Crafts\Crafts2),
 *          --only slug1,slug2, --force (re-upload even when the stored size matches).
 * Token: CARDS_BLOB_READ_WRITE_TOKEN (or CARDS_READ_WRITE_TOKEN) for the private cards store. The
 * project's BLOB_READ_WRITE_TOKEN belongs to the public store and is refused.
 * Idempotent: a PDF whose pathname already exists with the same size is skipped.
 * Prints only pathnames and counts (no URLs, no tokens).
 */
import fs from "node:fs/promises";
import path from "node:path";
import { BlobNotFoundError, head, put } from "@vercel/blob";
import { config as loadEnv } from "dotenv";
import MANIFEST from "../../../src/data/cards/originals-manifest.json";
import { ACTIVITY_VARIANTS, RESOURCE_ACTIVITIES } from "../../../src/lib/resource/activities";
import { craftBlobPathname } from "../../../src/lib/resource/craft-blobs";

const DEFAULT_SRC = ["C:\\Users\\jisun\\Downloads\\Crafts", "C:\\Users\\jisun\\Downloads\\Crafts\\Crafts2"];

function args(argv: string[], name: string): string[] {
  const out: string[] = [];
  argv.forEach((a, i) => {
    if (a === name && argv[i + 1]) out.push(argv[i + 1]!);
    else if (a.startsWith(`${name}=`)) out.push(a.slice(name.length + 1));
  });
  return out;
}

/** Store id of the private cards store (from the committed manifest URL host). */
function cardsStoreId(): string | null {
  const first = Object.values((MANIFEST as { items: Record<string, { url: string }> }).items)[0];
  try {
    return first ? new URL(first.url).hostname.split(".")[0]!.toLowerCase() : null;
  } catch {
    return null;
  }
}

function tokenStoreId(token: string): string | null {
  const m = /^vercel_blob_rw_([A-Za-z0-9]+)_/.exec(token);
  return m ? m[1]!.replace(/^store_/i, "").toLowerCase() : null;
}

async function main() {
  const argv = process.argv.slice(2);
  const dryRun = argv.includes("--dry-run");
  const force = argv.includes("--force");
  const srcDirs = args(argv, "--src");
  const dirs = srcDirs.length ? srcDirs : DEFAULT_SRC;
  const only = args(argv, "--only").flatMap((s) => s.split(",").map((x) => x.trim())).filter(Boolean);

  loadEnv({ path: ".env.local", quiet: true });
  loadEnv({ path: ".env", quiet: true });
  const tokenName = ["CARDS_BLOB_READ_WRITE_TOKEN", "CARDS_READ_WRITE_TOKEN"].find((n) => process.env[n]?.trim());
  const token = tokenName ? process.env[tokenName]!.trim() : undefined;
  if (!dryRun) {
    if (!token) throw new Error("Set CARDS_BLOB_READ_WRITE_TOKEN (private cards store) in your shell or .env.local.");
    const store = cardsStoreId();
    if (store && tokenStoreId(token) !== store) {
      throw new Error(`${tokenName} is not for the private cards store in src/data/cards/originals-manifest.json. Nothing uploaded.`);
    }
  }

  const crafts = RESOURCE_ACTIVITIES.filter((a) => a.storage === "blob" && (!only.length || only.includes(a.slug)));
  if (only.length && crafts.length !== only.length) throw new Error(`Unknown or non-Blob craft in --only: ${only.join(", ")}`);

  type Job = { pathname: string; file: string };
  const jobs: Job[] = [];
  const missing: string[] = [];
  for (const craft of crafts) {
    for (const variant of ACTIVITY_VARIANTS) {
      const pathname = craftBlobPathname(craft, variant)!;
      const sourceName = variant === "color" ? `${craft.slug}-color.pdf` : `${craft.slug}-coloring.pdf`;
      let file: string | null = null;
      for (const dir of dirs) {
        const candidate = path.join(dir, sourceName);
        if (await fs.stat(candidate).then((s) => s.isFile(), () => false)) {
          file = candidate;
          break;
        }
      }
      if (file) jobs.push({ pathname, file });
      else missing.push(`${pathname} (source ${sourceName} not found)`);
    }
  }
  for (const m of missing) console.warn(`missing   ${m}`);

  let uploaded = 0;
  let unchanged = 0;
  let failed = 0;
  for (const job of jobs) {
    const buf = await fs.readFile(job.file);
    if (buf.subarray(0, 5).toString() !== "%PDF-") {
      console.error(`not a PDF ${job.pathname}`);
      failed++;
      continue;
    }
    if (dryRun) {
      console.log(`ready     ${job.pathname}`);
      continue;
    }
    try {
      if (!force) {
        try {
          const existing = await head(job.pathname, { token });
          if (existing.size === buf.length) {
            console.log(`unchanged ${job.pathname}`);
            unchanged++;
            continue;
          }
        } catch (e) {
          if (!(e instanceof BlobNotFoundError)) throw e;
        }
      }
      await put(job.pathname, buf, {
        access: "private",
        contentType: "application/pdf",
        token,
        addRandomSuffix: false,
        allowOverwrite: true,
      });
      console.log(`uploaded  ${job.pathname}`);
      uploaded++;
    } catch (e) {
      console.error(`failed    ${job.pathname}: ${e instanceof Error ? e.name : "error"}`);
      failed++;
    }
  }
  console.log(
    `${crafts.length} crafts · ${jobs.length} PDFs found · ${missing.length} missing` +
      (dryRun ? " · DRY RUN (nothing uploaded)" : ` · uploaded ${uploaded} · unchanged ${unchanged} · failed ${failed} · token from ${tokenName}`),
  );
  if (failed || missing.length) process.exit(1);
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : "upload failed");
  process.exit(1);
});
