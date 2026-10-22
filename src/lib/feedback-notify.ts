import { FEEDBACK_CATEGORIES, type FeedbackInput } from "@/lib/feedback";
import { emailConfigured, escapeHtml, sendEmail, siteBase } from "@/lib/email";

export type FeedbackSender = "child" | "parent" | "signed-out visitor";

const EMAIL_RE = /^[^\s@,<>]+@[^\s@,<>]+\.[^\s@,<>]+$/;

/** Used when FEEDBACK_NOTIFY_EMAIL is unset or empty. Not a secret. */
export const DEFAULT_FEEDBACK_NOTIFY_EMAIL = "catholickidscrafts@gmail.com";

/** FEEDBACK_NOTIFY_EMAIL (comma-separated; invalid entries dropped), else the default inbox. */
export function feedbackNotifyRecipients(): string[] {
  return (process.env.FEEDBACK_NOTIFY_EMAIL?.trim() || DEFAULT_FEEDBACK_NOTIFY_EMAIL)
    .split(",")
    .map((s) => s.trim())
    .filter((s) => EMAIL_RE.test(s));
}

function torontoTime(d: Date): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Toronto",
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZoneName: "short",
  }).format(d);
}

/**
 * Builds the notification. Only the submission itself plus the sender type: never the family's
 * email, display names or other profiles (a child's submission must not reveal parent/sibling data).
 */
export function buildFeedbackEmail(input: FeedbackInput, sender: FeedbackSender, createdAt: Date) {
  const category = FEEDBACK_CATEGORIES.find((c) => c.id === input.category)?.label ?? input.category;
  const replyTo = input.email && EMAIL_RE.test(input.email) ? input.email : undefined;
  const page = input.pagePath ?? "(unknown)";
  const when = torontoTime(createdAt);
  const rows: [string, string][] = [
    ["Category", category],
    ["From", sender],
    ["Reply email", input.email ?? "(none)"],
    ["Page", page],
    ["Time", when],
  ];
  const subject = `New feedback: ${category}`.replace(/[\r\n]+/g, " ").slice(0, 150);
  const text = `${rows.map(([k, v]) => `${k}: ${v}`).join("\n")}\n\nMessage:\n${input.message}\n\n${siteBase()}${input.pagePath ?? ""}`;
  const html = `<table style="font:14px/1.5 sans-serif;border-collapse:collapse">${rows
    .map(
      ([k, v]) =>
        `<tr><td style="padding:2px 12px 2px 0;color:#666;vertical-align:top">${escapeHtml(k)}</td><td>${escapeHtml(v)}</td></tr>`,
    )
    .join("")}</table><p style="font:14px/1.5 sans-serif;white-space:pre-wrap;border-left:3px solid #d35400;padding-left:12px">${escapeHtml(
    input.message,
  )}</p>`;
  return { subject, text, html, replyTo };
}

/** Best effort: never throws; logs without secrets. Returns whether Resend accepted it. */
export async function notifyFeedback(
  input: FeedbackInput,
  sender: FeedbackSender,
  createdAt: Date,
  send: typeof sendEmail = sendEmail,
): Promise<boolean> {
  try {
    const to = feedbackNotifyRecipients();
    if (to.length === 0) {
      console.warn("[feedback] FEEDBACK_NOTIFY_EMAIL has no valid address; notification skipped");
      return false;
    }
    if (send === sendEmail && !emailConfigured()) {
      console.warn("[feedback] email provider not configured; notification skipped");
      return false;
    }
    const mail = buildFeedbackEmail(input, sender, createdAt);
    const ok = await send({ to, ...mail });
    if (!ok) console.error("[feedback] notification email was not accepted");
    return ok;
  } catch (e) {
    console.error("[feedback] notification failed:", e instanceof Error ? e.message : "unknown error");
    return false;
  }
}
