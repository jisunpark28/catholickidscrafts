import {
  BIBLE_GUEST_COOKIE,
  getGuestIdFromCookies,
} from "@/lib/bible/reader";
import { mergeGuestProgressIntoReader } from "@/lib/bible/progress";
import {
  setFamilyAndOwnerReaderCookies,
  verifyFamilyPassword,
} from "@/lib/family-auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
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

  const account = await prisma.familyAccount.findUnique({ where: { email } });
  if (!account) {
    return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
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
}
