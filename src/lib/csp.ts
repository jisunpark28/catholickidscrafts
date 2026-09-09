/**
 * Phase 3b — enforcing Content-Security-Policy.
 *
 * Report-Only on home, /play, /gospel, account/admin login showed no critical
 * violations. This module emits the same allowlist as enforcing CSP.
 *
 * Residual `'unsafe-inline'` on script-src / style-src: Next 15 still inlines
 * hydration + Flight and `next/font` style tags. This app does not wire CSP
 * nonces (`x-nonce` in middleware). Adding a nonce without covering static
 * `/games/*` HTML would break those iframes (nonce ignores `'unsafe-inline'`).
 * Game boot scripts that were inline are now external files (`'self'`).
 */

export const CSP_REPORT_PATH = "/api/csp-report";
export const CSP_REPORTING_GROUP = "csp-endpoint";

export type CspBuildOptions = {
  /** When true, allow Next.js dev eval + HMR websockets. */
  isDev?: boolean;
  /** Optional Tiny Priest host override (`NEXT_PUBLIC_CHURCH_GAME_URL`). */
  churchGameUrl?: string | null;
};

function extraFrameOrigins(churchGameUrl?: string | null): string[] {
  const raw = churchGameUrl?.trim();
  if (!raw || raw.startsWith("/")) return [];
  try {
    const { origin } = new URL(raw);
    if (origin.startsWith("https://") || origin.startsWith("http://localhost")) {
      return [origin];
    }
  } catch {
    // Ignore invalid override; default first-party `/games/tiny-priest` still works.
  }
  return [];
}

function serializeCsp(directives: Array<[string, string[]]>): string {
  return directives
    .map(([name, values]) => (values.length > 0 ? `${name} ${values.join(" ")}` : name))
    .join("; ");
}

/** Production-shaped enforcing CSP (dev extras are opt-in). */
export function buildCspValue(options: CspBuildOptions = {}): string {
  const isDev = options.isDev ?? false;
  const churchGameUrl =
    options.churchGameUrl ?? process.env.NEXT_PUBLIC_CHURCH_GAME_URL ?? null;

  const scriptSrc = [
    "'self'",
    "'unsafe-inline'",
    "'wasm-unsafe-eval'",
    "https://universalis.com",
    "https://cdn.jsdelivr.net",
    "https://cdnjs.cloudflare.com",
    "https://va.vercel-scripts.com",
  ];
  if (isDev) scriptSrc.push("'unsafe-eval'");

  const connectSrc = [
    "'self'",
    "https://universalis.com",
    "https://va.vercel-scripts.com",
    "https://vitals.vercel-insights.com",
    "https://cdn.jsdelivr.net",
    "https://justadudewhohacks.github.io",
  ];
  if (isDev) connectSrc.push("ws:", "wss:");

  return serializeCsp([
    ["default-src", ["'self'"]],
    ["base-uri", ["'self'"]],
    ["object-src", ["'none'"]],
    ["frame-ancestors", ["'self'"]],
    ["script-src", scriptSrc],
    [
      "style-src",
      ["'self'", "'unsafe-inline'", "https://hangeul.pstatic.net"],
    ],
    [
      "img-src",
      [
        "'self'",
        "data:",
        "blob:",
        "https://*.public.blob.vercel-storage.com",
        "https://*.blob.vercel-storage.com",
        "https://i.ytimg.com",
        "https://img.youtube.com",
        "https://yt3.ggpht.com",
        "https://m.media-amazon.com",
        "https://images-na.ssl-images-amazon.com",
        "https://images-eu.ssl-images-amazon.com",
        "https://api.qrserver.com",
      ],
    ],
    [
      "font-src",
      ["'self'", "data:", "https://hangeul.pstatic.net"],
    ],
    [
      "frame-src",
      [
        "'self'",
        "https://www.youtube.com",
        "https://www.youtube-nocookie.com",
        "https://player.vimeo.com",
        "https://docs.google.com",
        "https://drive.google.com",
        ...extraFrameOrigins(churchGameUrl),
      ],
    ],
    ["connect-src", connectSrc],
    ["worker-src", ["'self'", "blob:"]],
    [
      "media-src",
      [
        "'self'",
        "blob:",
        "https://*.public.blob.vercel-storage.com",
        "https://*.blob.vercel-storage.com",
      ],
    ],
    ["form-action", ["'self'"]],
    ["report-uri", [CSP_REPORT_PATH]],
    ["report-to", [CSP_REPORTING_GROUP]],
  ]);
}

export function cspHeaders(
  options: CspBuildOptions = {},
): { key: string; value: string }[] {
  const isDev = options.isDev ?? process.env.NODE_ENV !== "production";
  return [
    {
      key: "Reporting-Endpoints",
      value: `${CSP_REPORTING_GROUP}="${CSP_REPORT_PATH}"`,
    },
    {
      key: "Content-Security-Policy",
      value: buildCspValue({ ...options, isDev }),
    },
  ];
}
