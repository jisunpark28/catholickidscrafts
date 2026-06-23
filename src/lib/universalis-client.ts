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

export function universalisJsonpUrlClient(
  calendarPath = universalisCalendarPathClient(),
): string {
  return `https://universalis.com/${calendarPath}/jsonpmass.js`;
}

export function universalisMassPageUrlClient(
  calendarPath = universalisCalendarPathClient(),
): string {
  return `https://universalis.com/${calendarPath}/mass.htm`;
}

declare global {
  interface Window {
    universalisCallback?: (payload: UniversalisMassPayload) => void;
  }
}

const JSONP_TIMEOUT_MS = 20_000;

/**
 * Load today's Mass readings via Universalis JSONP in the browser.
 * Intended fallback when the server cannot reach universalis.com (Vercel/datacenter IPs).
 * Complies with https://universalis.com/n-web.htm — same official JSONP endpoint.
 */
export function loadUniversalisMassTodayClient(): Promise<UniversalisMassDay> {
  return new Promise((resolve, reject) => {
    const calendarPath = universalisCalendarPathClient();
    const script = document.createElement("script");
    script.async = true;
    script.src = universalisJsonpUrlClient(calendarPath);

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
