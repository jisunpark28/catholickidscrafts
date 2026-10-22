import { parentApiGuard } from "@/lib/family-auth";
import { readerCookieOptions, signReaderSession } from "@/lib/family-session";
import { NextResponse } from "next/server";

/** Parent uses their own account for Bible reading (owner reader session). */
export async function POST() {
  // Child mode cannot be left from here: grown-ups sign out and sign in with Google again.
  const guard = await parentApiGuard();
  if (guard.error) return guard.error;
  const { session } = guard;

  const readerToken = await signReaderSession({
    type: "owner",
    familyAccountId: session.familyAccountId,
    sessionVersion: session.sessionVersion,
  });

  const res = NextResponse.json({
    ok: true,
    reader: { type: "owner", familyAccountId: session.familyAccountId },
  });
  const opts = readerCookieOptions(readerToken, "owner");
  res.cookies.set(opts.name, opts.value, {
    httpOnly: opts.httpOnly,
    sameSite: opts.sameSite,
    secure: opts.secure,
    path: opts.path,
    maxAge: opts.maxAge,
  });
  return res;
}
