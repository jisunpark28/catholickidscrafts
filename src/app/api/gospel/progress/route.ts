import { BIBLE_STICKER_ACCURACY_THRESHOLD } from "@/lib/bible/constants";
import { attachGuestProgressIfAny, clearGuestProgressCookie } from "@/lib/bible/progress";
import { getReaderKey, isSignedInReaderKey } from "@/lib/bible/reader";
import { ensureOwnerReaderCookie } from "@/lib/family-auth";
import {
  getGospelCompletedDateKeys,
  isSignedInReader,
  saveGospelDayProgress,
} from "@/lib/gospel/progress";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const year = Number(searchParams.get("year"));
  const month = Number(searchParams.get("month"));

  if (!Number.isFinite(year) || !Number.isFinite(month) || month < 1 || month > 12) {
    return NextResponse.json({ error: "year and month are required" }, { status: 400 });
  }

  const key = await getReaderKey();
  if (!isSignedInReader(key)) {
    return NextResponse.json({ signedIn: false, completedDates: [] });
  }

  const completedDates = await getGospelCompletedDateKeys(year, month);
  return NextResponse.json({ signedIn: true, completedDates });
}

export async function POST(request: Request) {
  const key = await getReaderKey();
  if (!isSignedInReader(key)) {
    return NextResponse.json(
      { error: "Sign in with a family account or Access ID to save stickers." },
      { status: 401 },
    );
  }

  let body: { dateKey?: string; typingAccuracy?: number };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const dateKey = body.dateKey?.trim();
  const typingAccuracy = body.typingAccuracy;

  if (!dateKey || !/^\d{4}-\d{2}-\d{2}$/.test(dateKey)) {
    return NextResponse.json({ error: "dateKey must be YYYY-MM-DD" }, { status: 400 });
  }
  if (!Number.isFinite(typingAccuracy) || typingAccuracy! < BIBLE_STICKER_ACCURACY_THRESHOLD) {
    return NextResponse.json(
      {
        error: `Accuracy must be at least ${Math.round(BIBLE_STICKER_ACCURACY_THRESHOLD * 100)}%`,
      },
      { status: 400 },
    );
  }

  try {
    await saveGospelDayProgress(key, dateKey, typingAccuracy!);
  } catch (e) {
    console.error("gospel progress save", e);
    return NextResponse.json({ error: "Could not save progress" }, { status: 500 });
  }

  const res = NextResponse.json({ ok: true, dateKey });
  const mergedGuest = await attachGuestProgressIfAny(key);
  if (mergedGuest) clearGuestProgressCookie(res);
  if (key.type === "owner") {
    await ensureOwnerReaderCookie(res, key.familyAccountId);
  }
  return res;
}
