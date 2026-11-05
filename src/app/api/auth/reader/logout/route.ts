import { clearChildSignOutCookies, shouldClearFamilyOnChildSignOut } from "@/lib/child-mode-cookies";
import { effectiveReaderMode, getFamilySession } from "@/lib/family-auth";
import { FAMILY_SESSION_COOKIE } from "@/lib/family-session";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

/**
 * Reader sign-out. For a child this also clears the parent cookie when it was only keeping
 * the child reading (child mode) or is no longer valid. The device lock stays: going back to
 * the grown-up account still needs a fresh Google sign-in or the emailed code.
 */
export async function POST() {
  const jar = await cookies();
  const familyCookiePresent = Boolean(jar.get(FAMILY_SESSION_COOKIE)?.value?.trim());
  const family = familyCookiePresent ? await getFamilySession() : null;
  const familyMode = family ? (await effectiveReaderMode(family)).type : null;
  const res = NextResponse.json({ ok: true });
  clearChildSignOutCookies(res, {
    clearFamily: shouldClearFamilyOnChildSignOut({ familyCookiePresent, familyMode }),
  });
  return res;
}
