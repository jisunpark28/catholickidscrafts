/**
 * Child reply -> parent notifications: in-app (MbNotification) and email (instant with a 1-hour
 * cooldown, or the daily digest). Emails carry only the child's first name, never their words.
 * Server only.
 */
import { randomBytes } from "node:crypto";
import { readHrefForDouay } from "@/lib/bible/chapter-pages";
import { complianceFooter, emailConfigured, escapeHtml, sendEmail, siteBase } from "@/lib/email";
import { prisma } from "@/lib/prisma";
import { digestPending, MB_EMAIL_COOLDOWN_MS, replyEmailCopy, shouldSendInstantEmail } from "./rules";

export function newUnsubscribeToken(): string {
  return randomBytes(24).toString("base64url");
}

export async function ensureParentSettings(parentId: string) {
  return prisma.mbParentSettings.upsert({
    where: { parentAccountId: parentId },
    create: { parentAccountId: parentId, unsubscribeToken: newUnsubscribeToken() },
    update: {},
  });
}

function firstName(name: string): string {
  return name.trim().split(/\s+/)[0] ?? "";
}

function unsubscribeLinks(token: string) {
  const t = encodeURIComponent(token);
  return {
    page: `${siteBase()}/moms-bible/unsubscribe?token=${t}`,
    oneClick: `${siteBase()}/api/moms-bible/unsubscribe?token=${t}`,
  };
}

function buildReplyEmail(to: string, childNames: string[], count: number, openPath: string, token: string) {
  const names = [...new Set(childNames.map(firstName).filter(Boolean))];
  const who = names.length <= 1 ? names[0] ?? "" : `${names.slice(0, -1).join(", ")} and ${names[names.length - 1]}`;
  const copy = replyEmailCopy(who, count);
  const openUrl = `${siteBase()}${openPath}`;
  const links = unsubscribeLinks(token);
  const footer = complianceFooter(
    null,
    `You get this because you write notes in your child's Bible on ${siteBase().replace(/^https?:\/\//, "")}. Turn these emails off: ${links.page}`,
  );
  return {
    to,
    subject: copy.subject,
    unsubscribeUrl: links.oneClick,
    text: `${copy.lead}\n\nOpen: ${openUrl}${footer.text}`,
    html: `<div style="font-family:Inter,Arial,sans-serif;background:#fff3e6;padding:24px"><div style="max-width:520px;margin:0 auto;background:#fff;border-radius:16px;padding:24px;border:1px solid #f3d9bf"><p style="font-size:20px;margin:0 0 16px;color:#2d2a26">💌 ${escapeHtml(
      copy.lead,
    )}</p><p style="margin:0 0 20px"><a href="${escapeHtml(
      openUrl,
    )}" style="display:inline-block;background:#d35400;color:#fff;text-decoration:none;font-weight:700;padding:10px 18px;border-radius:999px">Open →</a></p>${footer.html}</div></div>`,
  };
}

/**
 * Record a child reply for the note's author and maybe email them right away.
 * Never throws: a failed notification must not fail the child's reply.
 */
export async function notifyChildReply(args: { noteId: string; itemId: string; childId: string }): Promise<void> {
  try {
    const note = await prisma.mbNote.findUnique({
      where: { id: args.noteId },
      select: {
        authorParentId: true,
        bookSlug: true,
        chapter: true,
        startVerse: true,
        child: { select: { displayName: true, familyAccountId: true, parentLinks: { select: { parentAccountId: true } } } },
        author: { select: { email: true } },
      },
    });
    if (!note) return;
    const stillLinked =
      note.child.familyAccountId === note.authorParentId ||
      note.child.parentLinks.some((l) => l.parentAccountId === note.authorParentId);
    if (!stillLinked) return;

    const notification = await prisma.mbNotification.create({
      data: { parentAccountId: note.authorParentId, subProfileId: args.childId, noteId: args.noteId, itemId: args.itemId },
      select: { id: true },
    });

    const settings = await ensureParentSettings(note.authorParentId);
    const now = new Date();
    if (!emailConfigured() || !shouldSendInstantEmail(settings.emailMode, settings.lastReplyEmailAt, now)) return;

    // Claim the cooldown atomically so two quick replies can't both send.
    const claimed = await prisma.mbParentSettings.updateMany({
      where: {
        parentAccountId: note.authorParentId,
        emailMode: "INSTANT",
        OR: [{ lastReplyEmailAt: null }, { lastReplyEmailAt: { lte: new Date(now.getTime() - MB_EMAIL_COOLDOWN_MS) } }],
      },
      data: { lastReplyEmailAt: now },
    });
    if (claimed.count !== 1) return;

    const sent = await sendEmail(
      buildReplyEmail(
        note.author.email,
        [note.child.displayName],
        1,
        readHrefForDouay(note.bookSlug, note.chapter, note.startVerse ?? undefined),
        settings.unsubscribeToken,
      ),
    );
    if (sent) await prisma.mbNotification.update({ where: { id: notification.id }, data: { emailedAt: now } });
  } catch (e) {
    console.error("[moms-bible] notify failed", e);
  }
}

/**
 * Daily digest (cron): one email per parent for replies not seen in the app and not emailed yet,
 * older than the cooldown. OFF parents are skipped.
 */
export async function runReplyDigest(now = new Date()): Promise<{ parents: number; sent: number }> {
  const cutoff = new Date(now.getTime() - MB_EMAIL_COOLDOWN_MS);
  const rows = await prisma.mbNotification.findMany({
    where: { seenAt: null, emailedAt: null, createdAt: { lte: cutoff }, child: { active: true } },
    orderBy: { createdAt: "asc" },
    take: 2000,
    select: {
      id: true,
      parentAccountId: true,
      createdAt: true,
      seenAt: true,
      emailedAt: true,
      child: { select: { displayName: true } },
      note: { select: { bookSlug: true, chapter: true, startVerse: true } },
    },
  });
  const byParent = new Map<string, typeof rows>();
  for (const r of rows) {
    const list = byParent.get(r.parentAccountId) ?? [];
    list.push(r);
    byParent.set(r.parentAccountId, list);
  }
  let sent = 0;
  for (const [parentId, list] of byParent) {
    const [settings, parent] = await Promise.all([
      ensureParentSettings(parentId),
      prisma.familyAccount.findUnique({ where: { id: parentId }, select: { email: true } }),
    ]);
    const pending = digestPending(settings.emailMode, list, now);
    if (!parent || pending.length === 0) continue;
    const latest = pending[pending.length - 1]!;
    const ok = await sendEmail(
      buildReplyEmail(
        parent.email,
        pending.map((p) => p.child.displayName),
        pending.length,
        readHrefForDouay(latest.note.bookSlug, latest.note.chapter, latest.note.startVerse ?? undefined),
        settings.unsubscribeToken,
      ),
    );
    if (!ok) continue;
    sent++;
    await prisma.$transaction([
      prisma.mbNotification.updateMany({ where: { id: { in: pending.map((p) => p.id) } }, data: { emailedAt: now } }),
      prisma.mbParentSettings.update({ where: { parentAccountId: parentId }, data: { lastReplyEmailAt: now } }),
    ]);
  }
  return { parents: byParent.size, sent };
}
