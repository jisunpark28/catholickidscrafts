/** Small helpers shared by the Mom's Bible API routes. Server only. */
import { getReaderKey } from "@/lib/bible/reader";
import { douayVerseCount, isDouaySlug, isValidDouayChapter, type DouaySlug } from "@/lib/bible/ref-map";
import { prisma } from "@/lib/prisma";
import { getRateLimitState, recordRateLimitFailure, type RateLimitRule } from "@/lib/rate-limit";
import { NextResponse } from "next/server";
import { MB_LIMITS } from "./constants";
import type { Decision } from "./rules";

export function mbError(status: number, error: string) {
  return NextResponse.json({ error }, { status });
}

export function decisionError(d: Decision): NextResponse | null {
  if (d.ok) return null;
  return NextResponse.json(
    d.status === 402 ? { error: d.error, upgradeUrl: "/subscribe" } : { error: d.error },
    { status: d.status },
  );
}

/** JSON body with a size cap (8 KB). */
export async function readJsonBody<T>(request: Request): Promise<{ ok: true; body: T } | { ok: false; res: NextResponse }> {
  const declared = Number(request.headers.get("content-length") ?? "0");
  if (declared > MB_LIMITS.bodyBytes) return { ok: false, res: mbError(413, "Request too large") };
  const text = await request.text().catch(() => "");
  if (new TextEncoder().encode(text).length > MB_LIMITS.bodyBytes) {
    return { ok: false, res: mbError(413, "Request too large") };
  }
  try {
    const body = JSON.parse(text) as T;
    if (!body || typeof body !== "object" || Array.isArray(body)) throw new Error("not an object");
    return { ok: true, body };
  } catch {
    return { ok: false, res: mbError(400, "Invalid JSON") };
  }
}

/** Writes per author: parents 120 / 10 min, children 30 / 10 min (design section 4). */
export const MB_PARENT_WRITE_RULE: RateLimitRule = { max: 120, windowMs: 10 * 60 * 1000, blockMs: 10 * 60 * 1000 };
export const MB_CHILD_WRITE_RULE: RateLimitRule = { max: 30, windowMs: 10 * 60 * 1000, blockMs: 10 * 60 * 1000 };
export const MB_INVITE_RULE: RateLimitRule = { max: 10, windowMs: 60 * 60 * 1000, blockMs: 60 * 60 * 1000 };

/** Count one write for `key`; returns a 429 once the rule is exceeded. */
export async function writeRateLimit(key: string, rule: RateLimitRule): Promise<NextResponse | null> {
  const state = await getRateLimitState([key]);
  if (state.blocked) {
    return NextResponse.json(
      { error: "Lots of changes in a short time. Please wait a few minutes." },
      { status: 429, headers: { "Retry-After": String(state.retryAfterSec) } },
    );
  }
  await recordRateLimitFailure(key, rule);
  return null;
}

/** The signed-in child (not a parent, not a guest), or null. */
export async function getChildSession(): Promise<{ childId: string; displayName: string } | null> {
  const key = await getReaderKey();
  if (key?.type !== "sub") return null;
  const sub = await prisma.subProfile.findUnique({
    where: { id: key.subProfileId },
    select: { id: true, displayName: true, active: true },
  });
  return sub?.active ? { childId: sub.id, displayName: sub.displayName } : null;
}

export type ChapterRef = { bookSlug: DouaySlug; chapter: number; verseCount: number };

/** Validate a storage (book, chapter) pair against the site's Bible data. */
export function parseChapterRef(book: unknown, chapter: unknown): ChapterRef | null {
  if (typeof book !== "string" || !isDouaySlug(book)) return null;
  const c = Number(chapter);
  if (!Number.isInteger(c) || !isValidDouayChapter(book, c)) return null;
  return { bookSlug: book, chapter: c, verseCount: douayVerseCount(book, c) };
}

export function parseId(raw: unknown): string | null {
  return typeof raw === "string" && /^[a-z0-9]{10,40}$/i.test(raw) ? raw : null;
}
