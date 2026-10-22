import {
  BIBLE_GUEST_COOKIE,
  getGuestIdFromCookies,
} from "@/lib/bible/reader";
import { mergeGuestProgressIntoReader } from "@/lib/bible/progress";
import { assertFamilyAuthConfigured, googleAccountFailureReason } from "@/lib/family-auth-errors";
import { findOrCreateFamilyFromGoogle } from "@/lib/family-google";
import {
  clearDeviceLock,
  getDeviceLock,
  setFamilyAndOwnerReaderCookies,
  setFamilyChildModeCookies,
} from "@/lib/family-auth";
import { prisma } from "@/lib/prisma";
import {
  fetchGoogleUserProfile,
  GOOGLE_FRESH_AUTH_MAX_AGE_SEC,
  GOOGLE_OAUTH_NONCE_COOKIE,
  verifyGoogleOAuthState,
  type GoogleOAuthFrom,
} from "@/lib/google-oauth";
import { clientIpFromHeaders } from "@/lib/client-ip";
import { GOOGLE_LOGIN_RULE, recordRateLimitFailure } from "@/lib/rate-limit";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const oauthError = searchParams.get("error");

  let from: GoogleOAuthFrom = "login";

  const failRedirect = (reason: string) => {
    const path = from === "signup" ? "/account/signup" : "/account/login";
    const url = new URL(path, request.url);
    url.searchParams.set("error", reason);
    return NextResponse.redirect(url);
  };

  // DB-backed throttle: counts every callback hit per IP.
  const throttle = await recordRateLimitFailure(
    `google:ip:${clientIpFromHeaders(request.headers)}`,
    GOOGLE_LOGIN_RULE,
  );
  if (throttle.blocked) {
    return failRedirect("google_rate_limited");
  }

  if (oauthError) {
    return failRedirect("google_denied");
  }
  if (!code || !state) {
    return failRedirect("google_missing");
  }

  const statePayload = await verifyGoogleOAuthState(state);
  if (!statePayload) {
    return failRedirect("google_state");
  }
  from = statePayload.from;

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
    return failRedirect(googleAccountFailureReason(e));
  }

  try {
    assertFamilyAuthConfigured();
  } catch (e) {
    console.error("google callback auth secret", e);
    return failRedirect("google_session");
  }

  // Device lock (the device was handed to a child): the parent only gets back in with a
  // verified, fresh Google sign-in from this same browser. Anything less lands in child mode.
  const lock = await getDeviceLock();
  const jar = await cookies();
  const boundNonce = jar.get(GOOGLE_OAUTH_NONCE_COOKIE)?.value ?? null;
  if (lock) {
    const now = Math.floor(Date.now() / 1000);
    const idt = profile.idToken;
    const fresh =
      Boolean(idt) &&
      idt!.sub === profile.googleId &&
      account.googleId === idt!.sub &&
      idt!.nonce === statePayload.nonce &&
      boundNonce === statePayload.nonce &&
      typeof idt!.authTime === "number" &&
      now - idt!.authTime! <= GOOGLE_FRESH_AUTH_MAX_AGE_SEC &&
      idt!.authTime! <= now + 60;
    if (!fresh) {
      let subProfileId: string | null = null;
      if (lock.subProfileId && lock.familyAccountId === account.id) {
        const sub = await prisma.subProfile.findUnique({
          where: { id: lock.subProfileId },
          select: { active: true, familyAccountId: true },
        });
        if (sub?.active && sub.familyAccountId === account.id) subProfileId = lock.subProfileId;
      }
      console.warn(
        `[device-lock] Google sign-in kept in child mode (fresh=${fresh}, auth_time=${idt?.authTime ?? "none"})`,
      );
      const url = new URL("/account/login", request.url);
      url.searchParams.set("error", "google_reauth_required");
      const res = NextResponse.redirect(url);
      await setFamilyChildModeCookies(res, account.id, account.email, subProfileId);
      res.cookies.set(GOOGLE_OAUTH_NONCE_COOKIE, "", { path: "/api/auth/family/google", maxAge: 0 });
      return res;
    }
  }

  const guestId = (await getGuestIdFromCookies()) ?? null;
  if (guestId) {
    await mergeGuestProgressIntoReader(guestId, {
      type: "owner",
      familyAccountId: account.id,
    }).catch((err) => console.error("merge guest on google login", err));
  }

  try {
    const res = NextResponse.redirect(new URL("/account", request.url));
    await setFamilyAndOwnerReaderCookies(res, account.id, account.email);
    res.cookies.set(GOOGLE_OAUTH_NONCE_COOKIE, "", { path: "/api/auth/family/google", maxAge: 0 });
    // A verified fresh parent sign-in (or an unlocked device) clears the child-mode marker.
    clearDeviceLock(res);
    if (guestId) {
      res.cookies.set(BIBLE_GUEST_COOKIE, "", { path: "/", maxAge: 0 });
    }
    return res;
  } catch (e) {
    console.error("google callback cookies", e);
    return failRedirect("google_session");
  }
}
