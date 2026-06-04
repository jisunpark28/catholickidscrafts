import { parseDateParam } from "@/lib/dates";
import { fetchLivingWithChristDay } from "@/lib/living-with-christ";
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

  try {
    const day = await fetchLivingWithChristDay(date);
    return NextResponse.json(day, {
      headers: { "Cache-Control": "public, s-maxage=3600" },
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Unable to load Living with Christ readings.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
