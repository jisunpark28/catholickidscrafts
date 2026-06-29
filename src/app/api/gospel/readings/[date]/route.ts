import { parseGospelDateParam, fetchGospelReadingsForDate } from "@/lib/gospel-readings";
import { todayUniversalis, toDateKey } from "@/lib/dates";
import { NextResponse } from "next/server";

type Params = { params: Promise<{ date: string }> };

export async function GET(_request: Request, { params }: Params) {
  const { date: dateParam } = await params;
  const date = parseGospelDateParam(dateParam);

  if (!date) {
    return NextResponse.json(
      { error: "Invalid date. Use YYYY-MM-DD." },
      { status: 400 },
    );
  }

  const todayKey = toDateKey(todayUniversalis());
  const requestedKey = toDateKey(date);
  if (requestedKey > todayKey) {
    return NextResponse.json(
      { error: "Future dates are not available." },
      { status: 403 },
    );
  }

  try {
    const day = await fetchGospelReadingsForDate(date);
    return NextResponse.json(day, {
      headers: { "Cache-Control": "public, s-maxage=3600" },
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to load readings.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
