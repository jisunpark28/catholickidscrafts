import { recordPublicVisit } from "@/lib/analytics";
import { randomUUID } from "crypto";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const VISITOR_COOKIE = "ckc_vid";
const ONE_YEAR = 60 * 60 * 24 * 365;

export async function POST() {
  const jar = await cookies();
  const hadCookie = Boolean(jar.get(VISITOR_COOKIE)?.value);
  const visitorId = jar.get(VISITOR_COOKIE)?.value ?? randomUUID();

  try {
    await recordPublicVisit(visitorId);
  } catch (e) {
    console.error("analytics visit", e);
    return NextResponse.json({ ok: false }, { status: 500 });
  }

  const res = NextResponse.json({ ok: true });
  if (!hadCookie) {
    res.cookies.set(VISITOR_COOKIE, visitorId, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: ONE_YEAR,
    });
  }
  return res;
}
