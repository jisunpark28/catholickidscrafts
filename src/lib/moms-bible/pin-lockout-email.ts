import { complianceFooter, escapeHtml, sendEmail, siteBase } from "@/lib/email";
import { prisma } from "@/lib/prisma";

/**
 * Security notice to every parent linked to a child after too many wrong PINs
 * (15 failures: sign-in paused for an hour; 20: PIN turned off until a parent resets it).
 * Only the child's first name is included: no Kid Code, no PIN, no IP.
 */
export async function sendKidPinAlert(subProfileId: string, kind: "locked" | "disabled"): Promise<void> {
  const sub = await prisma.subProfile.findUnique({
    where: { id: subProfileId },
    select: {
      displayName: true,
      familyAccount: { select: { email: true } },
      parentLinks: { select: { parent: { select: { email: true } } } },
    },
  });
  if (!sub) return;
  const emails = new Set<string>();
  if (sub.familyAccount?.email) emails.add(sub.familyAccount.email.toLowerCase());
  for (const link of sub.parentLinks) {
    if (link.parent?.email) emails.add(link.parent.email.toLowerCase());
  }
  if (emails.size === 0) return;

  const name = sub.displayName.trim().split(/\s+/)[0]?.slice(0, 40) || "your child";
  const accountUrl = `${siteBase()}/account`;
  const what =
    kind === "disabled"
      ? `${name}'s PIN was typed wrong too many times, so ${name}'s sign-in is turned off. Set a new PIN in Account → Children to turn it back on.`
      : `${name}'s PIN was typed wrong many times, so ${name}'s sign-in is paused for one hour. If this wasn't ${name}, you can set a new PIN in Account → Children.`;
  const footer = complianceFooter(
    null,
    "You are receiving this account security notice because you manage this child's reader profile.",
  );
  const subject = kind === "disabled" ? `${name}'s sign-in is turned off` : `Too many wrong PINs for ${name}`;

  await Promise.all(
    [...emails].map((to) =>
      sendEmail({
        to,
        subject,
        text: `${what}\n\nOpen your account: ${accountUrl}${footer.text}`,
        html: `<p>${escapeHtml(what)}</p><p><a href="${escapeHtml(accountUrl)}">Open Account → Children</a></p>${footer.html}`,
      }),
    ),
  );
}
