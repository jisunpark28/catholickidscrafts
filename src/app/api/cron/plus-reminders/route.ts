import { complianceFooter, emailConfigured, escapeHtml, sendEmail, siteBase } from "@/lib/email";
import { prisma } from "@/lib/prisma";
import { DAY_MS, reminderDue } from "@/lib/subscription/pass-math";
import { formatPlanDate } from "@/lib/subscription/plan-copy";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const MAX_PER_RUN = 200;
const REASON =
  "You are receiving this because your family bought a Catholic Kids Crafts Plus pass. This is a one-time notice about your purchase; Plus never renews automatically.";

function reminderEmail(to: string, kind: 7 | 1, endsAt: Date) {
  const date = formatPlanDate(endsAt);
  const link = `${siteBase()}/subscribe`;
  const footer = complianceFooter(null, REASON);
  const lead =
    kind === 7 ? `Your family's Plus ends in 7 days, on ${date}.` : `Your family's Plus ends tomorrow, on ${date}.`;
  const subject = kind === 7 ? `Your Plus ends in 7 days (${date})` : `Your Plus ends tomorrow (${date})`;
  const body =
    "It won't renew and you won't be charged. To keep memos and catechism activities, you can get another pass - the new time starts right after your current Plus ends.";
  return {
    to,
    subject,
    text: `${lead}\n\n${body}\n\nKeep Plus: ${link}${footer.text}`,
    html: `<div style="font-family:system-ui,sans-serif;font-size:16px;line-height:1.5;color:#111">
<p style="font-weight:700">${escapeHtml(lead)}</p>
<p>${escapeHtml(body)}</p>
<p><a href="${escapeHtml(link)}" style="display:inline-block;background:#d35400;color:#fff;padding:12px 20px;border-radius:8px;text-decoration:none;font-weight:700">Keep Plus</a></p>${footer.html}</div>`,
  };
}

/**
 * Vercel Cron (vercel.json, daily 14:00 UTC). Emails the parent 7 days and 1 day before the
 * family's one-time Plus ends. Only the family's last (stacked) pass counts, refunded passes
 * are skipped, and each reminder is claimed in the DB first so a retried run can't send twice.
 */
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET?.trim();
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!emailConfigured()) {
    console.warn("[cron plus-reminders] RESEND_API_KEY / EMAIL_FROM / MAILING_ADDRESS not set; skipping");
    return NextResponse.json({ skipped: "email not configured" });
  }

  const now = new Date();
  const candidates = await prisma.plusPass.findMany({
    where: {
      revokedAt: null,
      expiresAt: { gt: now, lte: new Date(now.getTime() + 7 * DAY_MS) },
      OR: [{ reminder7SentAt: null }, { reminder1SentAt: null }],
    },
    select: {
      id: true,
      familyAccountId: true,
      expiresAt: true,
      reminder7SentAt: true,
      reminder1SentAt: true,
      familyAccount: { select: { email: true } },
    },
    orderBy: { expiresAt: "asc" },
    take: MAX_PER_RUN,
  });

  let sent = 0;
  let skipped = 0;
  for (const pass of candidates) {
    // Stacked purchase: remind only about the family's final end date.
    const later = await prisma.plusPass.count({
      where: { familyAccountId: pass.familyAccountId, revokedAt: null, expiresAt: { gt: pass.expiresAt } },
    });
    const kind = reminderDue(pass.expiresAt, now);
    const email = pass.familyAccount.email?.trim();
    if (later > 0 || !kind || !email) {
      skipped++;
      continue;
    }
    if ((kind === 7 && pass.reminder7SentAt) || (kind === 1 && pass.reminder1SentAt)) {
      skipped++;
      continue;
    }
    const claim = await prisma.plusPass.updateMany({
      where: kind === 7 ? { id: pass.id, revokedAt: null, reminder7SentAt: null } : { id: pass.id, revokedAt: null, reminder1SentAt: null },
      // The 1-day notice also closes the 7-day one so it can never arrive afterwards.
      data: kind === 1 ? { reminder1SentAt: now, reminder7SentAt: pass.reminder7SentAt ?? now } : { reminder7SentAt: now },
    });
    if (claim.count === 0) {
      skipped++;
      continue;
    }
    const ok = await sendEmail(reminderEmail(email, kind, pass.expiresAt));
    if (ok) {
      sent++;
    } else {
      // Release the claim so tomorrow's run retries.
      await prisma.plusPass
        .update({
          where: { id: pass.id },
          data: kind === 1 ? { reminder1SentAt: null, reminder7SentAt: pass.reminder7SentAt } : { reminder7SentAt: null },
        })
        .catch(() => undefined);
    }
  }
  console.log(`[cron plus-reminders] candidates=${candidates.length} sent=${sent} skipped=${skipped}`);
  return NextResponse.json({ candidates: candidates.length, sent, skipped });
}
