import {
  accessCodeLookupKey,
  isValidAccessCodeFormat,
  normalizeAccessCode,
  verifyAccessCode,
} from "@/lib/access-code";
import {
  BIBLE_GUEST_COOKIE,
  getGuestIdFromCookies,
} from "@/lib/bible/reader";
import { mergeGuestProgressIntoReader } from "@/lib/bible/progress";
import { readerCookieOptions, signReaderSession } from "@/lib/family-session";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  let body: { accessId?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const normalized = normalizeAccessCode(body.accessId ?? "");
  if (!isValidAccessCodeFormat(normalized)) {
    return NextResponse.json(
      { error: "Enter a valid Access ID (format CKC-XXXX-XXXX)" },
      { status: 400 },
    );
  }

  const lookup = accessCodeLookupKey(normalized);
  const sub = await prisma.subProfile.findFirst({
    where: { accessCodeLookup: lookup, active: true },
    select: {
      id: true,
      displayName: true,
      accessCodeHash: true,
      familyAccountId: true,
    },
  });

  if (!sub) {
    return NextResponse.json({ error: "Access ID not found" }, { status: 401 });
  }

  const valid = await verifyAccessCode(normalized, sub.accessCodeHash);
  if (!valid) {
    return NextResponse.json({ error: "Access ID not found" }, { status: 401 });
  }

  const guestId = (await getGuestIdFromCookies()) ?? null;
  if (guestId) {
    await mergeGuestProgressIntoReader(guestId, {
      type: "sub",
      subProfileId: sub.id,
    }).catch((e) => console.error("merge guest on reader login", e));
  }

  const readerToken = await signReaderSession({
    type: "sub",
    subProfileId: sub.id,
    familyAccountId: sub.familyAccountId,
  });

  const res = NextResponse.json({
    ok: true,
    reader: { type: "sub", displayName: sub.displayName, subProfileId: sub.id },
  });
  const opts = readerCookieOptions(readerToken);
  res.cookies.set(opts.name, opts.value, {
    httpOnly: opts.httpOnly,
    sameSite: opts.sameSite,
    secure: opts.secure,
    path: opts.path,
    maxAge: opts.maxAge,
  });
  if (guestId) {
    res.cookies.set(BIBLE_GUEST_COOKIE, "", { path: "/", maxAge: 0 });
  }
  return res;
}
