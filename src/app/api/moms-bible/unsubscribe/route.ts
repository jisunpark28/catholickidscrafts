import { mbError } from "@/lib/moms-bible/http";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

const TOKEN_RE = /^[A-Za-z0-9_-]{20,64}$/;

/**
 * POST: turn off Mom's Bible reply emails. Token in ?token= (RFC 8058 one-click from mail apps,
 * List-Unsubscribe-Post) or in the confirm page's form. No session or Origin check: the random
 * token is the key, and it can only switch emails off.
 */
export async function POST(request: Request) {
  const url = new URL(request.url);
  let token = url.searchParams.get("token");
  let fromPage = false;
  if ((request.headers.get("content-type") ?? "").includes("application/x-www-form-urlencoded")) {
    const form = await request.formData().catch(() => null);
    const t = form?.get("token");
    if (typeof t === "string" && t) token = t;
    fromPage = form?.get("from") === "page";
  }
  if (!token || !TOKEN_RE.test(token)) return mbError(400, "Invalid link");
  const res = await prisma.mbParentSettings.updateMany({ where: { unsubscribeToken: token }, data: { emailMode: "OFF" } });
  if (fromPage) {
    return NextResponse.redirect(new URL(`/moms-bible/unsubscribe?${res.count ? "done=1" : "invalid=1"}`, request.url), 303);
  }
  if (res.count === 0) return mbError(404, "This link is no longer valid.");
  return NextResponse.json({ ok: true });
}

/** GET: people who open the header link land on the confirm page (GET never changes anything). */
export async function GET(request: Request) {
  const token = new URL(request.url).searchParams.get("token") ?? "";
  const safe = TOKEN_RE.test(token) ? token : "";
  return NextResponse.redirect(new URL(`/moms-bible/unsubscribe?token=${encodeURIComponent(safe)}`, request.url));
}
