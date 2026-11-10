import {
  massDayFromUniversalisPayload,
  type UniversalisMassDay,
  type UniversalisMassPayload,
} from "@/lib/universalis-parse";

const DEFAULT_CALENDAR_PATH = "Europe.England";

/** Calendar path for browser JSONP (matches server `UNIVERSALIS_CALENDAR_PATH` when set). */
export function universalisCalendarPathClient(): string {
  const fromEnv = process.env.NEXT_PUBLIC_UNIVERSALIS_CALENDAR_PATH?.trim();
  return fromEnv && fromEnv.length > 0 ? fromEnv : DEFAULT_CALENDAR_PATH;
}

/** Days after the device's today that Universalis serves dated JSONP for (checked Nov 2026: today..+7). */
export const UNIVERSALIS_DAYS_AHEAD = 7;

/**
 * JSONP URL. With a date this is the dated form Universalis' own sample page uses
 * (`/{calendar}/{yyyymmdd}/jsonpmass.js`, see https://universalis.com/n-jsonp-technical.htm), so every
 * day has its own URL and the browser can't replay an old day from its ~10-day cache.
 * `fresh` adds a per-day query string to the undated URL (used only as a fallback for today).
 */
export function universalisJsonpUrlClient(
  calendarPath = universalisCalendarPathClient(),
  dateKey?: string,
  mode: "dated" | "fresh" = "dated",
): string {
  if (!dateKey) return `https://universalis.com/${calendarPath}/jsonpmass.js`;
  const compact = dateKey.replace(/-/g, "");
  return mode === "dated"
    ? `https://universalis.com/${calendarPath}/${compact}/jsonpmass.js?callback=universalisCallback`
    : `https://universalis.com/${calendarPath}/jsonpmass.js?d=${compact}`;
}

export function universalisMassPageUrlClient(
  calendarPath = universalisCalendarPathClient(),
  dateKey?: string,
): string {
  return dateKey
    ? `https://universalis.com/${calendarPath}/${dateKey.replace(/-/g, "")}/mass.htm`
    : `https://universalis.com/${calendarPath}/mass.htm`;
}

declare global {
  interface Window {
    universalisCallback?: (payload: UniversalisMassPayload) => void;
  }
}

const JSONP_TIMEOUT_MS = 20_000;

// Universalis always calls the global `universalisCallback`, so only one request may be in flight.
let queue: Promise<unknown> = Promise.resolve();

/**
 * Load Mass readings via Universalis JSONP in the visitor's browser (https://universalis.com/n-web.htm).
 * Pass a date to load that day (dated URL); requests are queued so callbacks never mix days.
 */
export function loadUniversalisMassTodayClient(
  dateKey?: string,
  mode: "dated" | "fresh" = "dated",
): Promise<UniversalisMassDay> {
  const run = () => loadOnce(dateKey, mode);
  const next = queue.then(run, run);
  queue = next.catch(() => undefined);
  return next;
}

function loadOnce(dateKey: string | undefined, mode: "dated" | "fresh"): Promise<UniversalisMassDay> {
  return new Promise((resolve, reject) => {
    const calendarPath = universalisCalendarPathClient();
    const script = document.createElement("script");
    script.async = true;
    script.src = universalisJsonpUrlClient(calendarPath, dateKey, mode);

    const cleanup = () => {
      clearTimeout(timeoutId);
      delete window.universalisCallback;
      script.remove();
    };

    const timeoutId = window.setTimeout(() => {
      cleanup();
      reject(new Error("Universalis timed out. Open Universalis in a new tab to read today."));
    }, JSONP_TIMEOUT_MS);

    window.universalisCallback = (payload: UniversalisMassPayload) => {
      cleanup();
      try {
        resolve(massDayFromUniversalisPayload(payload, calendarPath));
      } catch (error) {
        reject(
          error instanceof Error
            ? error
            : new Error("Could not parse Universalis readings."),
        );
      }
    };

    script.onerror = () => {
      cleanup();
      reject(new Error("Could not load readings from Universalis."));
    };

    document.head.appendChild(script);
  });
}
