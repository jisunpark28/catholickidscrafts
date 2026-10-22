import { refreshFamilySessionIfStale } from "@/lib/family-auth";
import { getHeaderSession } from "@/lib/get-header-session";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getHeaderSession();
  const res = NextResponse.json(session);
  // Per-user data (Plus badge): never cache in browsers, CDNs or shared proxies.
  res.headers.set("Cache-Control", "private, no-store, max-age=0");
  res.headers.set("Vary", "Cookie");
  // Rolling 30-day parent session.
  await refreshFamilySessionIfStale(res).catch((e) => console.error("session refresh", e));
  return res;
}
