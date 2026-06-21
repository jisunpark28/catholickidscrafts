import {
  BIBLE_GUEST_COOKIE,
  getReaderKey,
  guestCookieOptions,
  newGuestId,
} from "@/lib/bible/reader";
import { ensureOwnerReaderCookie } from "@/lib/family-auth";
import {
  deleteTypingDraft,
  getTypingDraft,
  isValidDraftKey,
  saveTypingDraft,
} from "@/lib/typing-draft";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const draftKey = new URL(request.url).searchParams.get("draftKey")?.trim() ?? "";
  if (!isValidDraftKey(draftKey)) {
    return NextResponse.json({ error: "draftKey is required" }, { status: 400 });
  }

  const key = await getReaderKey();
  if (!key) {
    return NextResponse.json({ typedText: "", elapsedMs: null, updatedAt: null });
  }

  const draft = await getTypingDraft(key, draftKey);
  if (!draft) {
    return NextResponse.json({ typedText: "", elapsedMs: null, updatedAt: null });
  }

  return NextResponse.json(draft);
}

export async function POST(request: Request) {
  let body: { draftKey?: string; typedText?: string; elapsedMs?: number };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const draftKey = body.draftKey?.trim() ?? "";
  if (!isValidDraftKey(draftKey)) {
    return NextResponse.json({ error: "draftKey is required" }, { status: 400 });
  }

  const typedText = typeof body.typedText === "string" ? body.typedText : "";
  const elapsedMs = body.elapsedMs;

  let key = await getReaderKey();
  let setGuestCookie: string | null = null;

  if (!key) {
    const guestId = newGuestId();
    key = { type: "guest", guestId };
    setGuestCookie = guestId;
  }

  try {
    await saveTypingDraft(key, draftKey, typedText, elapsedMs);
  } catch (e) {
    console.error("typing draft save", e);
    return NextResponse.json({ error: "Could not save draft" }, { status: 500 });
  }

  const res = NextResponse.json({ ok: true });
  if (setGuestCookie) {
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
    if (key.type === "owner") {
      await ensureOwnerReaderCookie(res, key.familyAccountId);
    }
  }

  return res;
}

export async function DELETE(request: Request) {
  const draftKey = new URL(request.url).searchParams.get("draftKey")?.trim() ?? "";
  if (!isValidDraftKey(draftKey)) {
    return NextResponse.json({ error: "draftKey is required" }, { status: 400 });
  }

  const key = await getReaderKey();
  if (key) {
    try {
      await deleteTypingDraft(key, draftKey);
    } catch (e) {
      console.error("typing draft delete", e);
      return NextResponse.json({ error: "Could not clear draft" }, { status: 500 });
    }
  }

  return NextResponse.json({ ok: true });
}
