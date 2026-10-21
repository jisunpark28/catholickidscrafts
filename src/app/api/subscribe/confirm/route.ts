import { clientIpFromHeaders } from "@/lib/client-ip";
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
  const now = new Date();
  await prisma.emailSubscriber.update({
    where: { id: sub.id },
    data: {
      status: SUBSCRIBER_STATUS.confirmed,
      confirmedAt: now,
      confirmToken: null,
      // Express consent (CASL): recorded when the person confirms from their inbox.
      consentAt: now,
      consentIp: clientIpFromHeaders(request.headers),
    },
  });
  return done("confirmed");
}
