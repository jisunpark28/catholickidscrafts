import {
  BIBLE_GUEST_COOKIE,
  getGuestIdFromCookies,
} from "@/lib/bible/reader";
import { mergeGuestProgressIntoReader } from "@/lib/bible/progress";
import { findOrCreateFamilyFromGoogle } from "@/lib/family-google";
import { setFamilyAndOwnerReaderCookies } from "@/lib/family-auth";
import {
  fetchGoogleUserProfile,
  verifyGoogleOAuthState,
} from "@/lib/google-oauth";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const oauthError = searchParams.get("error");

  const failRedirect = (reason: string) => {
    const url = new URL("/account/login", request.url);
    url.searchParams.set("error", reason);
    return NextResponse.redirect(url);
  };

  if (oauthError) {
    return failRedirect("google_denied");
  }
  if (!code || !state) {
    return failRedirect("google_missing");
  }

  const stateOk = await verifyGoogleOAuthState(state);
  if (!stateOk) {
    return failRedirect("google_state");
  }

  let profile;
  try {
    profile = await fetchGoogleUserProfile(code);
  } catch (e) {
    console.error("google callback profile", e);
    return failRedirect("google_profile");
  }

  let account;
  try {
    account = await findOrCreateFamilyFromGoogle(profile);
  } catch (e) {
    console.error("google callback account", e);
    if (e instanceof Error && e.message === "EMAIL_LINKED_OTHER_GOOGLE") {
      return failRedirect("google_email_conflict");
    }
    return failRedirect("google_account");
  }

  const guestId = (await getGuestIdFromCookies()) ?? null;
  if (guestId) {
    await mergeGuestProgressIntoReader(guestId, {
      type: "owner",
      familyAccountId: account.id,
    }).catch((err) => console.error("merge guest on google login", err));
  }

  const res = NextResponse.redirect(new URL("/account", request.url));
  await setFamilyAndOwnerReaderCookies(res, account.id, account.email);
  if (guestId) {
    res.cookies.set(BIBLE_GUEST_COOKIE, "", { path: "/", maxAge: 0 });
  }
  return res;
}
