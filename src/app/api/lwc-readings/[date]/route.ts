import { parseDateParam, todayUniversalis, toDateKey } from "@/lib/dates";
import { fetchMassDayForTyping } from "@/lib/universalis";
import { NextResponse } from "next/server";

/** @deprecated Prefer `/api/universalis-readings/[date]`. Same Universalis JSONP source. */
type Params = { params: Promise<{ date: string }> };

export async function GET(_request: Request, { params }: Params) {
  const { date: dateParam } = await params;
  const date = parseDateParam(dateParam);

  if (!date) {
    return NextResponse.json(
      { error: "Invalid date. Use YYYY-MM-DD." },
      { status: 400 },
    );
  }

  const todayKey = toDateKey(todayUniversalis());
  const requestedKey = toDateKey(date);
  if (requestedKey !== todayKey) {
    return NextResponse.json(
      { error: "Only today's readings are available for typing practice." },
      { status: 403 },
    );
  }

  try {
    const day = await fetchMassDayForTyping();
    return NextResponse.json(day, {
      headers: { "Cache-Control": "public, s-maxage=3600" },
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Unable to load readings.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
