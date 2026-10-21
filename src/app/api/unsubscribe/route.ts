import { prisma } from "@/lib/prisma";
import { SUBSCRIBER_STATUS, isToken } from "@/lib/subscribers";
import { NextResponse } from "next/server";

/**
 * One-click unsubscribe. Accepts the button on /unsubscribe (form POST) and
 * mail clients' RFC 8058 List-Unsubscribe-Post requests (?token=...).
 */
export async function POST(request: Request) {
  const url = new URL(request.url);
  let token = url.searchParams.get("token");
  if (!token) {
    const form = await request.formData().catch(() => null);
    const value = form?.get("token");
    token = typeof value === "string" ? value : null;
  }
  if (isToken(token)) {
    await prisma.emailSubscriber.updateMany({
      where: { unsubscribeToken: token },
      data: { status: SUBSCRIBER_STATUS.unsubscribed, unsubscribedAt: new Date(), confirmToken: null },
    });
  }
  const contentType = request.headers.get("content-type") ?? "";
  if (contentType.includes("form")) {
    return NextResponse.redirect(new URL("/newsletter?status=unsubscribed", url), 303);
  }
  return NextResponse.json({ ok: true });
}
