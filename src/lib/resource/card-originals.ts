// Server-only: read full-resolution card PNGs (private Vercel Blob in production, local folder in dev).
// Never import from a client component: the manifest holds storage paths.
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

/** "store_aGIc..." / "aGIc..." -> "agic..." (Blob hostnames are lowercase). */
function normalizeStoreId(id: string | undefined | null): string | null {
  const v = id?.trim().replace(/^store_/i, "").toLowerCase();
  return v || null;
}

/** Store id inside a Blob read-write token ("vercel_blob_rw_<storeId>_<secret>"). */
function tokenStoreId(token: string): string | null {
  const m = /^vercel_blob_rw_([A-Za-z0-9]+)_/.exec(token);
  return m ? normalizeStoreId(m[1]) : null;
}

/** The cards store, from a manifest URL ("<storeId>.private.blob.vercel-storage.com"). */
function manifestStoreId(): string | null {
  const first = Object.values(MANIFEST.items)[0];
  if (!first?.url) return null;
  try {
    return normalizeStoreId(new URL(first.url).hostname.split(".")[0]);
  } catch {
    return null;
  }
}

/**
 * Vercel OIDC token for this request: the `x-vercel-oidc-token` request header (Vercel Functions),
 * then the Vercel request context, then VERCEL_OIDC_TOKEN (builds, `vercel env pull` in dev).
 * Same sources @vercel/blob checks itself; read here so we can pass it explicitly.
 */
function vercelOidcToken(fromRequest?: string | null): string | undefined {
  const direct = fromRequest?.trim();
  if (direct) return direct;
  try {
    const ctx = (globalThis as Record<symbol, { get?: () => { headers?: Record<string, string> } } | undefined>)[
      Symbol.for("@vercel/request-context")
    ];
    const header = ctx?.get?.()?.headers?.["x-vercel-oidc-token"]?.trim();
    if (header) return header;
  } catch {
    /* no request context */
  }
  return process.env.VERCEL_OIDC_TOKEN?.trim() || undefined;
}

type BlobAuth = { token: string } | { oidcToken: string; storeId: string };

let warnedNoAuth = false;

/**
 * Credentials for the private cards store, always passed explicitly so @vercel/blob never falls back
 * to the project's BLOB_READ_WRITE_TOKEN (that one belongs to the other, public store).
 *  1. CARDS_BLOB_READ_WRITE_TOKEN (or CARDS_READ_WRITE_TOKEN), only if it is for the cards store.
 *  2. Vercel OIDC (the store's project connection) with CARDS_STORE_ID, else the manifest's store id.
 */
function cardsBlobAuth(oidcFromRequest?: string | null): BlobAuth | null {
  const cardsStore = manifestStoreId();
  for (const name of ["CARDS_BLOB_READ_WRITE_TOKEN", "CARDS_READ_WRITE_TOKEN"] as const) {
    const t = process.env[name]?.trim();
    if (t && (!cardsStore || tokenStoreId(t) === cardsStore)) return { token: t };
  }
  const oidcToken = vercelOidcToken(oidcFromRequest);
  const envStore = normalizeStoreId(process.env.CARDS_STORE_ID);
  if (envStore && cardsStore && envStore !== cardsStore) {
    console.error(`[cards] CARDS_STORE_ID does not match the manifest store "${cardsStore}"; using the manifest store.`);
  }
  const storeId = cardsStore ?? envStore;
  if (oidcToken && storeId) return { oidcToken, storeId };
  if (!warnedNoAuth) {
    warnedNoAuth = true;
    console.error(
      `[cards] no credentials for the cards store "${storeId ?? "?"}": need Vercel OIDC (store connected to this project) or CARDS_BLOB_READ_WRITE_TOKEN.`,
    );
  }
  return null;
}

let localIndex: Map<string, string> | null = null;

/** Dev only: CARDS_ORIGINALS_DIR may hold ID.png directly or one folder down (p1-cards/...). */
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

async function readLocalOriginal(id: string): Promise<CardOriginal | null> {
  const local = await localOriginalPath(id);
  if (!local) return null;
  const buf = await fs.readFile(local);
  return { body: buf, size: buf.length };
}

/** True when a full-size original can be served (uploaded to Blob, or found in the dev folder). */
export async function hasCardOriginal(id: string): Promise<boolean> {
  if (!getPictureCard(id)) return false;
  if (MANIFEST.access && MANIFEST.items[id]) return true;
  return (await localOriginalPath(id)) != null;
}

/**
 * Full 1080x1350 PNG for a card id that already passed `getPictureCard`.
 * `opts.oidcToken`: the request's `x-vercel-oidc-token` header, when the caller has the request.
 */
export async function readCardOriginal(
  id: string,
  opts?: { oidcToken?: string | null },
): Promise<CardOriginal | null> {
  if (!getPictureCard(id)) return null;

  const item = MANIFEST.items[id];
  if (item && MANIFEST.access) {
    const auth = cardsBlobAuth(opts?.oidcToken);
    if (auth) {
      try {
        // Full manifest URL: the request goes to the cards store whatever the credentials resolve to.
        const res = await get(item.url, { access: MANIFEST.access, ...auth });
        if (res && res.statusCode === 200 && res.stream) {
          return { body: res.stream, size: res.blob.size, etag: res.blob.etag };
        }
        console.error("[cards] blob original missing", id, res?.statusCode ?? 404);
      } catch (e) {
        console.error("[cards] blob read failed", id, e instanceof Error ? e.message : e);
        const local = await readLocalOriginal(id);
        if (local) return local;
        throw new CardOriginalUnavailableError("Card image storage is not reachable right now.");
      }
    } else {
      const local = await readLocalOriginal(id);
      if (local) return local;
      throw new CardOriginalUnavailableError("Card image storage is not reachable right now.");
    }
  }

  return readLocalOriginal(id);
}