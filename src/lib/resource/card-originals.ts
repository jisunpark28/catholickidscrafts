// Server-only: read full-resolution card PNGs (Vercel Blob in production, local folder in dev).
// Never import from a client component — the manifest holds storage paths.
import { get } from "@vercel/blob";
import fs from "fs/promises";
import path from "path";
import MANIFEST_JSON from "@/data/cards/originals-manifest.json";
import { getPictureCard } from "@/lib/resource/cards";

type ManifestItem = { pathname: string; url: string; size: number; sha256: string };
type Manifest = { version: number; access: "private" | "public" | null; items: Record<string, ManifestItem> };

const MANIFEST = MANIFEST_JSON as Manifest;

export class CardOriginalUnavailableError extends Error {}

export type CardOriginal = { body: ReadableStream<Uint8Array> | Buffer; size: number | null; etag?: string };

/**
 * Token for the Blob store that holds card originals. A dedicated private store is recommended
 * (its env var gets a custom prefix when a project links two stores); falls back to the default.
 */
function cardsBlobToken(): string | undefined {
  return (
    process.env.CARDS_BLOB_READ_WRITE_TOKEN?.trim() || process.env.BLOB_READ_WRITE_TOKEN?.trim() || undefined
  );
}

let localIndex: Map<string, string> | null = null;

/** Dev only: CARDS_ORIGINALS_DIR may hold ID.png directly or one folder down (p1-cards/…). */
async function localOriginalPath(id: string): Promise<string | null> {
  const dir = process.env.CARDS_ORIGINALS_DIR?.trim();
  if (!dir || process.env.VERCEL || process.env.NODE_ENV === "production") return null;
  if (!localIndex) {
    const index = new Map<string, string>();
    const scan = async (d: string, depth: number) => {
      const entries = await fs.readdir(d, { withFileTypes: true }).catch(() => []);
      for (const e of entries) {
        const full = path.join(d, e.name);
        if (e.isDirectory() && depth < 1) await scan(full, depth + 1);
        else if (e.isFile() && /^[A-Z]{3}-\d{3}\.png$/.test(e.name)) index.set(e.name.slice(0, 7), full);
      }
    };
    await scan(path.resolve(dir), 0);
    localIndex = index;
  }
  return localIndex.get(id) ?? null;
}

/** True when a full-size original can be served (uploaded to Blob, or found in the dev folder). */
export async function hasCardOriginal(id: string): Promise<boolean> {
  if (!getPictureCard(id)) return false;
  if (MANIFEST.access && MANIFEST.items[id]) return true;
  return (await localOriginalPath(id)) != null;
}

/** Full 1080×1350 PNG for a card id that already passed `getPictureCard`. */
export async function readCardOriginal(id: string): Promise<CardOriginal | null> {
  if (!getPictureCard(id)) return null;

  const item = MANIFEST.items[id];
  if (item && MANIFEST.access) {
    const token = cardsBlobToken();
    try {
      const res = await get(MANIFEST.access === "private" ? item.pathname : item.url, {
        access: MANIFEST.access,
        ...(token ? { token } : {}),
      });
      if (!res || res.statusCode !== 200) return null;
      return { body: res.stream, size: res.blob.size, etag: res.blob.etag };
    } catch (e) {
      console.error("[cards] blob read failed", id, e instanceof Error ? e.message : e);
      throw new CardOriginalUnavailableError("Card image storage is not reachable right now.");
    }
  }

  const local = await localOriginalPath(id);
  if (local) {
    const buf = await fs.readFile(local);
    return { body: buf, size: buf.length };
  }
  return null;
}
