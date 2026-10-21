import { randomBytes } from "node:crypto";
import { complianceFooter, escapeHtml, sendEmail, siteBase } from "@/lib/email";

export const SUBSCRIBER_STATUS = {
  pending: "pending",
  confirmed: "confirmed",
  unsubscribed: "unsubscribed",
} as const;

export function newToken(): string {
  return randomBytes(24).toString("base64url");
}

export function isToken(value: unknown): value is string {
  return typeof value === "string" && /^[A-Za-z0-9_-]{20,64}$/.test(value);
}

export function unsubscribeUrl(token: string): string {
  return `${siteBase()}/unsubscribe?token=${encodeURIComponent(token)}`;
}

export async function sendConfirmEmail(email: string, confirmToken: string): Promise<boolean> {
  const url = `${siteBase()}/api/subscribe/confirm?token=${encodeURIComponent(confirmToken)}`;
  const footer = complianceFooter(null);
  return sendEmail({
    to: email,
    subject: "Please confirm: weekly Sunday sheet",
    text: `Thanks for printing our Sunday sheet!\n\nConfirm that you want next week's free sheet every Friday morning:\n${url}\n\nIf you didn't ask for this, just ignore this email.${footer.text}`,
    html: `<div style="font-family:system-ui,sans-serif;font-size:16px;line-height:1.5;color:#111">
<p>Thanks for printing our Sunday sheet!</p>
<p>Confirm that you want next week's free sheet every Friday morning:</p>
<p><a href="${escapeHtml(url)}" style="display:inline-block;background:#2e7d32;color:#fff;padding:12px 20px;border-radius:8px;text-decoration:none;font-weight:700">Yes, send me the weekly sheet</a></p>
<p style="color:#555">If you didn't ask for this, just ignore this email.</p>${footer.html}</div>`,
  });
}
