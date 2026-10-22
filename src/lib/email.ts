import { getSiteUrl } from "@/lib/site-url";

export type OutgoingEmail = {
  /** One address or several (internal notifications). */
  to: string | string[];
  subject: string;
  html: string;
  text: string;
  /** Adds List-Unsubscribe headers (RFC 8058 one-click). */
  unsubscribeUrl?: string;
  /** Per-message Reply-To; overrides EMAIL_REPLY_TO. */
  replyTo?: string;
};

export const SENDER_NAME = "Catholic Kids Crafts";

export function emailConfigured(): boolean {
  // MAILING_ADDRESS is required: CASL needs a postal address in every message.
  return Boolean(
    process.env.RESEND_API_KEY?.trim() && process.env.EMAIL_FROM?.trim() && process.env.MAILING_ADDRESS?.trim(),
  );
}

function fromHeader(): string {
  const from = process.env.EMAIL_FROM?.trim() ?? "";
  return from.includes("<") ? from : `${SENDER_NAME} <${from}>`;
}

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function siteBase(): string {
  return getSiteUrl().replace(/\/$/, "");
}

/** CASL: sender identity, mailing address, and an unsubscribe link in every message. */
export function complianceFooter(unsubscribeUrl: string | null): { html: string; text: string } {
  const address = process.env.MAILING_ADDRESS?.trim() ?? "";
  const from = process.env.EMAIL_FROM?.trim() ?? "";
  const lines = [`${SENDER_NAME} · ${siteBase()}`, address, from ? `Contact: ${from}` : ""].filter(Boolean);
  const unsub = unsubscribeUrl
    ? `You are receiving this because you signed up for the weekly sheet. Unsubscribe: ${unsubscribeUrl}`
    : "You are receiving this because someone entered this address on our site. If it wasn't you, ignore this email and you won't hear from us.";
  return {
    text: `\n\n--\n${lines.join("\n")}\n${unsub}`,
    html: `<hr style="border:0;border-top:1px solid #ddd;margin:24px 0 12px"><p style="font-size:12px;color:#666;line-height:1.5">${lines
      .map(escapeHtml)
      .join("<br>")}<br>${
      unsubscribeUrl
        ? `You are receiving this because you signed up for the weekly sheet. <a href="${escapeHtml(unsubscribeUrl)}">Unsubscribe</a>`
        : escapeHtml(unsub)
    }</p>`,
  };
}

/** Optional EMAIL_REPLY_TO, sent as Resend `reply_to` on every message. */
function replyTo(): string | null {
  const value = process.env.EMAIL_REPLY_TO?.trim() ?? "";
  return value.includes("@") ? value : null;
}

function payload(mail: OutgoingEmail) {
  return {
    from: fromHeader(),
    to: Array.isArray(mail.to) ? mail.to : [mail.to],
    subject: mail.subject,
    html: mail.html,
    text: mail.text,
    ...(mail.replyTo ? { reply_to: mail.replyTo } : replyTo() ? { reply_to: replyTo() } : {}),
    ...(mail.unsubscribeUrl
      ? {
          headers: {
            "List-Unsubscribe": `<${mail.unsubscribeUrl}>`,
            "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
          },
        }
      : {}),
  };
}

/** Sends via the Resend REST API. Without RESEND_API_KEY / EMAIL_FROM it logs and skips. */
export async function sendEmail(mail: OutgoingEmail): Promise<boolean> {
  if (!emailConfigured()) {
    console.warn(`[email] RESEND_API_KEY, EMAIL_FROM or MAILING_ADDRESS not set; skipped "${mail.subject}"`);
    return false;
  }
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY!.trim()}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload(mail)),
    });
    if (!res.ok) {
      console.error("[email] Resend error", res.status, await res.text().catch(() => ""));
      return false;
    }
    return true;
  } catch (e) {
    console.error("[email] send failed", e);
    return false;
  }
}

/** Up to 100 messages per Resend batch call. Returns how many were accepted. */
export async function sendEmailBatch(mails: OutgoingEmail[]): Promise<number> {
  if (!emailConfigured()) {
    console.warn(`[email] not configured; skipped batch of ${mails.length}`);
    return 0;
  }
  let sent = 0;
  for (let i = 0; i < mails.length; i += 100) {
    const chunk = mails.slice(i, i + 100);
    try {
      const res = await fetch("https://api.resend.com/emails/batch", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.RESEND_API_KEY!.trim()}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(chunk.map(payload)),
      });
      if (res.ok) sent += chunk.length;
      else console.error("[email] Resend batch error", res.status, await res.text().catch(() => ""));
    } catch (e) {
      console.error("[email] batch failed", e);
    }
  }
  return sent;
}
