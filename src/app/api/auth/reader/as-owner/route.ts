import { requireFamilySession } from "@/lib/family-auth";
import { readerCookieOptions, signReaderSession } from "@/lib/family-session";
import { NextResponse } from "next/server";

/** Parent uses their own account for Bible reading (owner reader session). */
export async function POST() {
  const session = await requireFamilySession();
  if (!session) {
    return NextResponse.json({ error: "Parent sign-in required" }, { status: 401 });
  }

  const readerToken = await signReaderSession({
    type: "owner",
    familyAccountId: session.familyAccountId,
  });

  const res = NextResponse.json({
    ok: true,
    reader: { type: "owner", familyAccountId: session.familyAccountId },
  });
  const opts = readerCookieOptions(readerToken);
  res.cookies.set(opts.name, opts.value, {
    httpOnly: opts.httpOnly,
    sameSite: opts.sameSite,
    secure: opts.secure,
    path: opts.path,
    maxAge: opts.maxAge,
  });
  return res;
}
