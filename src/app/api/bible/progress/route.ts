import { BIBLE_STICKER_ACCURACY_THRESHOLD } from "@/lib/bible/constants";
import {
  attachGuestProgressIfAny,
  clearGuestProgressCookie,
  saveChapterProgress,
} from "@/lib/bible/progress";
import {
  BIBLE_GUEST_COOKIE,
  getReaderKey,
  guestCookieOptions,
  isSignedInReaderKey,
  newGuestId,
} from "@/lib/bible/reader";
import { ensureOwnerReaderCookie } from "@/lib/family-auth";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const bookSlug = searchParams.get("bookSlug")?.trim();
  if (!bookSlug) {
    return NextResponse.json({ error: "bookSlug is required" }, { status: 400 });
  }

  const key = await getReaderKey();
  if (!key) {
    return NextResponse.json({ chapters: [] });
  }

  const { getCompletedChaptersForBook } = await import("@/lib/bible/progress");
  const chapters = await getCompletedChaptersForBook(bookSlug);
  return NextResponse.json({ chapters });
}

export async function POST(request: Request) {
  let body: { bookSlug?: string; chapter?: number; typingAccuracy?: number };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const bookSlug = body.bookSlug?.trim();
  const chapter = body.chapter;
  const typingAccuracy = body.typingAccuracy;

  if (!bookSlug || !Number.isFinite(chapter) || chapter! < 1) {
    return NextResponse.json({ error: "bookSlug and chapter are required" }, { status: 400 });
  }
  if (!Number.isFinite(typingAccuracy) || typingAccuracy! < 0 || typingAccuracy! > 1) {
    return NextResponse.json({ error: "typingAccuracy must be between 0 and 1" }, { status: 400 });
  }
  if (typingAccuracy! < BIBLE_STICKER_ACCURACY_THRESHOLD) {
    return NextResponse.json(
      {
        error: `Accuracy must be at least ${Math.round(BIBLE_STICKER_ACCURACY_THRESHOLD * 100)}% to unlock a sticker`,
      },
      { status: 400 },
    );
  }

  let key = await getReaderKey();
  let setGuestCookie: string | null = null;

  if (!key) {
    const guestId = newGuestId();
    key = { type: "guest", guestId };
    setGuestCookie = guestId;
  }

  try {
    await saveChapterProgress(key, bookSlug, chapter!, typingAccuracy!);
  } catch (e) {
    console.error("bible progress save", e);
    return NextResponse.json({ error: "Could not save progress" }, { status: 500 });
  }

  const res = NextResponse.json({ ok: true, chapter, bookSlug });

  if (isSignedInReaderKey(key)) {
    const mergedGuest = await attachGuestProgressIfAny(key);
    if (mergedGuest) clearGuestProgressCookie(res);
    if (key.type === "owner") {
      await ensureOwnerReaderCookie(res, key.familyAccountId);
    }
  } else if (setGuestCookie) {
    const opts = guestCookieOptions(setGuestCookie);
    res.cookies.set(opts.name, opts.value, {
      httpOnly: opts.httpOnly,
      sameSite: opts.sameSite,
      secure: opts.secure,
      path: opts.path,
      maxAge: opts.maxAge,
    });
  } else {
    const jar = await cookies();
    if (key.type === "guest" && !jar.get(BIBLE_GUEST_COOKIE)?.value) {
      const opts = guestCookieOptions(key.guestId);
      res.cookies.set(opts.name, opts.value, {
        httpOnly: opts.httpOnly,
        sameSite: opts.sameSite,
        secure: opts.secure,
        path: opts.path,
        maxAge: opts.maxAge,
      });
    }
  }

  return res;
}
