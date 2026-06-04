import { parseDateParam, todayUtc, toDateKey } from "@/lib/dates";
import { fetchUniversalisMassDay } from "@/lib/universalis";
import { NextResponse } from "next/server";

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

  const todayKey = toDateKey(todayUtc());
  const requestedKey = toDateKey(date);
  if (requestedKey !== todayKey) {
    return NextResponse.json(
      { error: "Only today's readings are available for typing practice." },
      { status: 403 },
    );
  }

  try {
    const day = await fetchUniversalisMassDay(date);
    return NextResponse.json(day, {
      headers: { "Cache-Control": "public, s-maxage=3600" },
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Unable to load Universalis readings.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
