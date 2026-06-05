import { getPublishedMassOrderSteps } from "@/lib/mass-order-steps";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const items = await getPublishedMassOrderSteps();
    return NextResponse.json(items, {
      headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" },
    });
  } catch (e) {
    console.error("mass-order-steps:", e);
    return NextResponse.json([], { status: 200 });
  }
}
