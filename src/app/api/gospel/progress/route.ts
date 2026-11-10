import { BIBLE_STICKER_ACCURACY_THRESHOLD } from "@/lib/bible/constants";
import { parseDateParam, todayInTimeZone, toDateKey } from "@/lib/dates";
import { attachGuestProgressIfAny, clearGuestProgressCookie } from "@/lib/bible/progress";
import { getReaderKey } from "@/lib/bible/reader";
import { ensureOwnerReaderCookie } from "@/lib/family-auth";
import {
  getGospelCompletedDateKeys,
  isSignedInReader,
  saveGospelDayProgress,
} from "@/lib/gospel/progress";
import { UNIVERSALIS_DAYS_AHEAD } from "@/lib/universalis-client";
import { NextResponse } from "next/server";

const DAY_MS = 24 * 60 * 60 * 1000;

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

  const completedDates = await getGospelCompletedDateKeys(year, month, key);
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

  // Stickers can be earned for days that have Universalis text to type: today (Toronto)
  // through UNIVERSALIS_DAYS_AHEAD days ahead. One extra day on each side covers devices
  // whose local date differs from Toronto's (e.g. Hawaii late evening, Asia, Oceania).
  const parsed = parseDateParam(dateKey);
  const torontoToday = todayInTimeZone("America/Toronto").getTime();
  const earliest = toDateKey(new Date(torontoToday - DAY_MS));
  const latest = toDateKey(new Date(torontoToday + (UNIVERSALIS_DAYS_AHEAD + 1) * DAY_MS));
  if (!parsed || dateKey < earliest || dateKey > latest) {
    return NextResponse.json(
      {
        error: `Praise stickers can be saved for today's readings and the next ${UNIVERSALIS_DAYS_AHEAD} days.`,
      },
      { status: 400 },
    );
  }

  if (!Number.isFinite(typingAccuracy) || typingAccuracy! + 1e-9 < BIBLE_STICKER_ACCURACY_THRESHOLD) {
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
