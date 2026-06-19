import {
  BIBLE_GUEST_COOKIE,
  getGuestIdFromCookies,
} from "@/lib/bible/reader";
import { mergeGuestProgressIntoReader } from "@/lib/bible/progress";
import {
  assertFamilyAuthConfigured,
  familyAuthErrorResponse,
} from "@/lib/family-auth-errors";
import {
  hashFamilyPassword,
  setFamilyAndOwnerReaderCookies,
  validateEmail,
  validatePassword,
} from "@/lib/family-auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    assertFamilyAuthConfigured();
  } catch (e) {
    console.error("family signup config", e);
    return NextResponse.json(
      { error: "Account sign-up is temporarily unavailable. Please try again in a few minutes." },
      { status: 503 },
    );
  }

  let body: { email?: string; password?: string; displayName?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const email = body.email?.trim().toLowerCase() ?? "";
  const password = body.password ?? "";
  const displayName = body.displayName?.trim() || null;

  if (!validateEmail(email)) {
    return NextResponse.json({ error: "Enter a valid email address" }, { status: 400 });
  }
  const passwordError = validatePassword(password);
  if (passwordError) {
    return NextResponse.json({ error: passwordError }, { status: 400 });
  }

  try {
    const existing = await prisma.familyAccount.findUnique({ where: { email } });
    if (existing) {
      if (existing.googleId && !existing.passwordHash) {
        return NextResponse.json(
          { error: "This email already uses Google sign-in. Continue with Google instead." },
          { status: 409 },
        );
      }
      return NextResponse.json({ error: "An account with this email already exists" }, { status: 409 });
    }

    const passwordHash = await hashFamilyPassword(password);
    const account = await prisma.familyAccount.create({
      data: { email, passwordHash, displayName },
      select: { id: true, email: true, displayName: true },
    });

    const guestId = (await getGuestIdFromCookies()) ?? null;
    if (guestId) {
      await mergeGuestProgressIntoReader(guestId, {
        type: "owner",
        familyAccountId: account.id,
      }).catch((e) => console.error("merge guest on signup", e));
    }

    const res = NextResponse.json({
      ok: true,
      account: { id: account.id, email: account.email, displayName: account.displayName },
    });
    await setFamilyAndOwnerReaderCookies(res, account.id, account.email);
    if (guestId) {
      res.cookies.set(BIBLE_GUEST_COOKIE, "", { path: "/", maxAge: 0 });
    }
    return res;
  } catch (e) {
    console.error("family signup", e);
    const { message, status } = familyAuthErrorResponse(e, "Could not create account. Please try again.");
    return NextResponse.json({ error: message }, { status });
  }
}
