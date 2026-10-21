import { prisma } from "@/lib/prisma";
import { SUBSCRIBER_STATUS, isToken } from "@/lib/subscribers";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const token = url.searchParams.get("token");
  const done = (status: string) => NextResponse.redirect(new URL(`/newsletter?status=${status}`, url), 303);
  if (!isToken(token)) return done("invalid");

  const sub = await prisma.emailSubscriber.findUnique({ where: { confirmToken: token } });
  if (!sub) return done("invalid");
  await prisma.emailSubscriber.update({
    where: { id: sub.id },
    data: { status: SUBSCRIBER_STATUS.confirmed, confirmedAt: new Date(), confirmToken: null },
  });
  return done("confirmed");
}
