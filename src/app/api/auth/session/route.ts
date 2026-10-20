import { refreshFamilySessionIfStale } from "@/lib/family-auth";
import { getHeaderSession } from "@/lib/get-header-session";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await getHeaderSession();
  const res = NextResponse.json(session);
  // Rolling 30-day parent session.
  await refreshFamilySessionIfStale(res).catch((e) => console.error("session refresh", e));
  return res;
}
