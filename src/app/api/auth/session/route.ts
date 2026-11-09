import { getReaderKey } from "@/lib/bible/reader";
import { refreshFamilySessionIfStale } from "@/lib/family-auth";
import { getHeaderSession } from "@/lib/get-header-session";
import { isHeaderSignedIn, type SiteSessionResponse } from "@/lib/header-session";
import { clearSessionMarker, setSessionMarker, SESSION_MARKER_COOKIE } from "@/lib/session-marker";
import { getSidebarPaidPlus } from "@/lib/sidebar-access";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * One call per page load from the cookie-free site header (components/SiteSessionProvider):
 * header session + sidebar paid-Plus flag. Display data only; access is enforced elsewhere.
 */
export async function GET() {
  const readerKey = await getReaderKey();
  const [session, paidPlus] = await Promise.all([
    getHeaderSession(readerKey),
    getSidebarPaidPlus(readerKey),
  ]);
  const body: SiteSessionResponse = { ...session, paidPlus };
  const res = NextResponse.json(body);
  // Per-user data (Plus badge): never cache in browsers, CDNs or shared proxies.
  res.headers.set("Cache-Control", "private, no-store, max-age=0");
  res.headers.set("Vary", "Cookie");
  // Keep the header's "may be signed in" hint in step with the real session.
  if (isHeaderSignedIn(session)) {
    setSessionMarker(res);
  } else if ((await cookies()).get(SESSION_MARKER_COOKIE)) {
    clearSessionMarker(res);
  }
  // Rolling 30-day parent session.
  await refreshFamilySessionIfStale(res).catch((e) => console.error("session refresh", e));
  return res;
}
