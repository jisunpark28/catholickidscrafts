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
  setFamilyAndOwnerReaderCookies,
  validateEmail,
  verifyFamilyPassword,
} from "@/lib/family-auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    assertFamilyAuthConfigured();
  } catch (e) {
    console.error("family login config", e);
    return NextResponse.json(
      { error: "Sign-in is temporarily unavailable. Please try again in a few minutes." },
      { status: 503 },
    );
  }

  let body: { email?: string; password?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const email = body.email?.trim().toLowerCase() ?? "";
  const password = body.password ?? "";
  if (!email || !password) {
    return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
  }
  if (!validateEmail(email)) {
    return NextResponse.json({ error: "Enter a valid email address" }, { status: 400 });
  }

  try {
    const account = await prisma.familyAccount.findUnique({ where: { email } });
    if (!account) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    if (!account.passwordHash) {
      return NextResponse.json(
        { error: "This account uses Google sign-in. Continue with Google instead." },
        { status: 400 },
      );
    }

    const valid = await verifyFamilyPassword(password, account.passwordHash);
    if (!valid) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    const guestId = (await getGuestIdFromCookies()) ?? null;
    if (guestId) {
      await mergeGuestProgressIntoReader(guestId, {
        type: "owner",
        familyAccountId: account.id,
      }).catch((e) => console.error("merge guest on login", e));
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
    console.error("family login", e);
    const { message, status } = familyAuthErrorResponse(e, "Sign-in failed. Please try again.");
    return NextResponse.json({ error: message }, { status });
  }
}
