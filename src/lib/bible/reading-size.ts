/** Passage-only scripture size. Seven steps; anything else falls back to the default. */
export const READING_SIZES = [16.5, 18, 20, 22, 24, 28, 32] as const;
export type ReadingSize = (typeof READING_SIZES)[number];

export const DEFAULT_READING_SIZE: ReadingSize = READING_SIZES[0];
export const READING_SIZE_KEY = "ckc-bible-reading-size-v1";

const ALLOWED = new Set<string>(READING_SIZES.map((size) => String(size)));

/** Accept only the canonical stored token. Rejects blanks, units, and non-finite values. */
export function parseReadingSize(raw: unknown): ReadingSize {
  if (typeof raw !== "string" || !ALLOWED.has(raw)) return DEFAULT_READING_SIZE;
  const match = READING_SIZES.find((size) => String(size) === raw);
  return match ?? DEFAULT_READING_SIZE;
}

export function stepReadingSize(current: ReadingSize, delta: -1 | 1): ReadingSize {
  const index = READING_SIZES.indexOf(current);
  const next = READING_SIZES[index + delta];
  return next ?? current;
}

/**
 * Runs from the server HTML before hydration. Sets a stylesheet variable only for a
 * supported stored value. Storage failures and junk values leave the stylesheet untouched.
 */
export const READING_SIZE_BOOTSTRAP = `(function(){try{var raw=localStorage.getItem(${JSON.stringify(READING_SIZE_KEY)});var ok={${READING_SIZES.map((size) => `${JSON.stringify(String(size))}:1`).join(",")}};if(!Object.prototype.hasOwnProperty.call(ok,raw))return;var css=":root{--bible-reading-size:"+raw+"px}";var el=document.getElementById("ckc-bible-reading-size");if(!el){el=document.createElement("style");el.id="ckc-bible-reading-size";document.head.appendChild(el);}el.textContent=css;}catch(e){}})();`;
