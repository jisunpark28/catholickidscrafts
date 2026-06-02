import { fetchMonthCalendar } from "@/lib/mass-source";
import { NextResponse } from "next/server";

type Params = { params: Promise<{ year: string; month: string }> };

export async function GET(_request: Request, { params }: Params) {
  const { year: yearStr, month: monthStr } = await params;
  const year = Number(yearStr);
  const month = Number(monthStr);

  if (
    !Number.isInteger(year) ||
    year < 1970 ||
    year > 2100 ||
    !Number.isInteger(month) ||
    month < 1 ||
    month > 12
  ) {
    return NextResponse.json({ error: "Invalid year or month." }, { status: 400 });
  }

  try {
    const calendar = await fetchMonthCalendar(year, month);
    return NextResponse.json(calendar, {
      headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400" },
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to load calendar.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
