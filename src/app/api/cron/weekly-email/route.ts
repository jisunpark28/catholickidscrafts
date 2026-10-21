import { complianceFooter, emailConfigured, escapeHtml, sendEmailBatch, siteBase, type OutgoingEmail } from "@/lib/email";
import { parseLevels, torontoToday, upcomingSunday } from "@/lib/gospel-sheet";
import { prisma } from "@/lib/prisma";
import { SUBSCRIBER_STATUS, unsubscribeUrl } from "@/lib/subscribers";
import { formatSunday } from "@/lib/weekly-content";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * Vercel Cron (vercel.json, Fridays 11:00 UTC). Sends the coming Sunday's sheet to
 * confirmed subscribers. Only runs on Friday in America/Toronto, and only once per sheet.
 */
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET?.trim();
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  if (torontoToday(now).weekday !== 5) {
    return NextResponse.json({ skipped: "not Friday in America/Toronto" });
  }
  if (!emailConfigured()) {
    console.warn("[cron weekly-email] RESEND_API_KEY / EMAIL_FROM / MAILING_ADDRESS not set; skipping");
    return NextResponse.json({ skipped: "email not configured" });
  }

  const sundayDate = upcomingSunday(now);
  const sheet = await prisma.gospelSheet.findFirst({ where: { sundayDate, published: true } });
  if (!sheet) return NextResponse.json({ skipped: `no published sheet for ${formatSunday(sundayDate)}` });
  if (sheet.emailSentAt) return NextResponse.json({ skipped: "already sent" });

  // Claim the sheet first so a retried or overlapping run can't send twice.
  const claim = await prisma.gospelSheet.updateMany({
    where: { id: sheet.id, emailSentAt: null },
    data: { emailSentAt: now },
  });
  if (claim.count === 0) return NextResponse.json({ skipped: "already sent" });

  const subscribers = await prisma.emailSubscriber.findMany({
    where: { status: SUBSCRIBER_STATUS.confirmed },
    select: { email: true, unsubscribeToken: true },
  });

  const base = siteBase();
  const title = parseLevels(sheet.levels).level1.title || sheet.liturgicalName;
  const sunday = formatSunday(sheet.sundayDate);
  const link1 = `${base}/print/${sheet.slug}?level=1`;
  const link2 = `${base}/print/${sheet.slug}?level=2`;

  const mails: OutgoingEmail[] = subscribers.map((s) => {
    const unsub = unsubscribeUrl(s.unsubscribeToken);
    const footer = complianceFooter(unsub);
    return {
      to: s.email,
      subject: `This Sunday's sheet: ${title} (${sunday})`,
      unsubscribeUrl: unsub,
      text: `${sheet.liturgicalName} · ${sunday} · ${sheet.gospelRef}\n\n${title}\n\nPrint Level 1: ${link1}\nPrint Level 2: ${link2}${footer.text}`,
      html: `<div style="font-family:system-ui,sans-serif;font-size:16px;line-height:1.5;color:#111">
<p style="color:#555">${escapeHtml(sheet.liturgicalName)} · ${escapeHtml(sunday)} · ${escapeHtml(sheet.gospelRef)}</p>
<h1 style="font-size:24px;margin:0 0 16px">${escapeHtml(title)}</h1>
<p><a href="${escapeHtml(link1)}" style="display:inline-block;background:#2e7d32;color:#fff;padding:12px 20px;border-radius:8px;text-decoration:none;font-weight:700">🖨 Print Level 1</a>
&nbsp; <a href="${escapeHtml(link2)}" style="display:inline-block;background:#2e7d32;color:#fff;padding:12px 20px;border-radius:8px;text-decoration:none;font-weight:700">🖨 Print Level 2</a></p>${footer.html}</div>`,
    };
  });

  const sent = await sendEmailBatch(mails);
  console.log(`[cron weekly-email] ${sheet.slug}: ${sent}/${mails.length} sent`);
  if (mails.length > 0 && sent === 0) {
    // Nothing went out (e.g. Resend down): release the claim so the next run retries.
    await prisma.gospelSheet.update({ where: { id: sheet.id }, data: { emailSentAt: null } });
    console.warn(`[cron weekly-email] ${sheet.slug}: send failed, will retry next run`);
  }
  return NextResponse.json({ sheet: sheet.slug, subscribers: mails.length, sent });
}
