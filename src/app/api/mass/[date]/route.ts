import { parseDateParam } from "@/lib/dates";
import { fetchMassDay } from "@/lib/evangelizo";
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
    const mass = await fetchMassDay(date);
    return NextResponse.json(mass, {
      headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400" },
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to load mass readings.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
