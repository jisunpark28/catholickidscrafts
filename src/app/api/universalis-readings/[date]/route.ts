import { parseDateParam, todayUniversalis, toDateKey } from "@/lib/dates";
import { fetchUniversalisMassToday } from "@/lib/universalis";
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

  const todayKey = toDateKey(todayUniversalis());
  const requestedKey = toDateKey(date);
  if (requestedKey !== todayKey) {
    return NextResponse.json(
      {
        error: `Only today's readings are available for typing practice (today: ${todayKey}).`,
      },
      { status: 403 },
    );
  }

  try {
    const day = await fetchUniversalisMassToday();
    if (day.date !== requestedKey) {
      return NextResponse.json(
        {
          error: `Universalis readings are for ${day.date}; try again after the liturgical day changes.`,
        },
        { status: 502 },
      );
    }
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
