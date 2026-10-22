/** Feedback categories, shared by the widget and the API. Labels follow Jisun's spec (English UI). */
export const FEEDBACK_CATEGORIES = [
  {
    id: "doctrine",
    label: "✝️ Faith question & Q&A card request",
    hint: "Questions you send are reviewed and turned into Liturgy & Faith Q&A cards.",
  },
  {
    id: "bug",
    label: "🐛 Bug or error report",
    hint: "Broken screens, typing errors, stickers not saving, and similar problems.",
  },
  { id: "idea", label: "💡 Feature idea", hint: "" },
  { id: "plus", label: "💳 Plus subscription / other question", hint: "" },
] as const;

export type FeedbackCategory = (typeof FEEDBACK_CATEGORIES)[number]["id"];

export const FEEDBACK_MESSAGE_MAX = 2000;
export const FEEDBACK_EMAIL_MAX = 254;
export const FEEDBACK_PATH_MAX = 300;

export function isFeedbackCategory(v: unknown): v is FeedbackCategory {
  return typeof v === "string" && FEEDBACK_CATEGORIES.some((c) => c.id === v);
}

/** Keep only a same-site path (no host, no query), capped. */
export function cleanPagePath(v: unknown): string | null {
  if (typeof v !== "string") return null;
  const p = v.trim().split(/[?#]/)[0];
  if (!p.startsWith("/") || p.startsWith("//")) return null;
  return p.slice(0, FEEDBACK_PATH_MAX);
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type FeedbackInput = {
  category: FeedbackCategory;
  message: string;
  email: string | null;
  pagePath: string | null;
};

/** Validate a raw JSON body. Returns an error message or the cleaned input. */
export function parseFeedback(body: unknown): { ok: true; value: FeedbackInput } | { ok: false; error: string } {
  if (!body || typeof body !== "object") return { ok: false, error: "Invalid request" };
  const b = body as Record<string, unknown>;
  if (!isFeedbackCategory(b.category)) return { ok: false, error: "Please choose a category" };
  const message = typeof b.message === "string" ? b.message.trim() : "";
  if (!message) return { ok: false, error: "Please write a message" };
  if (message.length > FEEDBACK_MESSAGE_MAX) {
    return { ok: false, error: `Message is too long (max ${FEEDBACK_MESSAGE_MAX} characters)` };
  }
  const rawEmail = typeof b.email === "string" ? b.email.trim() : "";
  if (rawEmail && (rawEmail.length > FEEDBACK_EMAIL_MAX || !EMAIL_RE.test(rawEmail))) {
    return { ok: false, error: "Please enter a valid email, or leave it empty" };
  }
  return {
    ok: true,
    value: { category: b.category, message, email: rawEmail || null, pagePath: cleanPagePath(b.pagePath) },
  };
}
