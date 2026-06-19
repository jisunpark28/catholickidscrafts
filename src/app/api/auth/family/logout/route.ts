import { clearFamilyCookies } from "@/lib/family-auth";
import { READER_SESSION_COOKIE } from "@/lib/family-session";
import { NextResponse } from "next/server";

export async function POST() {
  const res = NextResponse.json({ ok: true });
  clearFamilyCookies(res);
  res.cookies.set(READER_SESSION_COOKIE, "", { path: "/", maxAge: 0 });
  return res;
}
