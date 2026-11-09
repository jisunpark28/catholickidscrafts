// No server-only imports: next.config.ts imports this to build the `/` rewrites.
import {
  COUNTRY_CONFIG,
  ENABLED_COUNTRIES,
  FALLBACK_COUNTRY,
  SUPPORTED,
  enabledOrFallback,
  type RomcalCountry,
} from "./sheet-keys/countries";

/**
 * The home page is static per calendar country. Instead of reading the `ckc_country` cookie and
 * the Vercel IP header on every request, next.config.ts rewrites `/` to one of these prebuilt
 * variants with `has` conditions evaluated on the CDN (no function runs).
 *
 * The rules mirror resolveCountry() in lib/sheet-keys/countries exactly: a cookie value that
 * parseChoice() accepts (ISO code or romcal name, any case, trimmed) wins; otherwise the IP
 * header; anything not enabled resolves to FALLBACK_COUNTRY, which is plain `/`.
 */
export const HOME_VARIANT_PREFIX = "/home-variant";

/** Same name as COUNTRY_COOKIE in lib/resource/this-sunday (not imported: that module loads romcal). */
const COUNTRY_COOKIE_NAME = "ckc_country";

export const HOME_VARIANTS: readonly RomcalCountry[] = [...ENABLED_COUNTRIES, FALLBACK_COUNTRY];

export function isHomeVariant(value: string): value is RomcalCountry {
  return (HOME_VARIANTS as readonly string[]).includes(value);
}

/** `ca` -> `[cC][aA]`: rewrite `has` values are anchored, case-sensitive regexes. */
function caseInsensitive(token: string): string {
  return [...token]
    .map((ch) => (/[a-z]/i.test(ch) ? `[${ch.toLowerCase()}${ch.toUpperCase()}]` : ch.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")))
    .join("");
}

/** Every value parseChoice() accepts, grouped by the home variant it resolves to. */
function tokensByVariant(): Map<RomcalCountry, string[]> {
  const groups = new Map<RomcalCountry, string[]>();
  const add = (token: string, country: RomcalCountry) => {
    const variant = enabledOrFallback(country);
    groups.set(variant, [...(groups.get(variant) ?? []), token]);
  };
  for (const name of Object.keys(COUNTRY_CONFIG) as RomcalCountry[]) add(name, name);
  for (const [iso, country] of Object.entries(SUPPORTED)) add(iso, country);
  return groups;
}

/** Anchored by Next/Vercel as ^...$; `\s*` matches parseChoice()'s trim(). */
export function homeVariantValuePattern(tokens: readonly string[]): string {
  return `\\s*(?:${tokens.map(caseInsensitive).join("|")})\\s*`;
}

type HomeRewrite = {
  source: string;
  has: { type: "cookie" | "header"; key: string; value: string }[];
  destination: string;
};

/** `beforeFiles` rewrites for `/`: all cookie rules first (cookie wins), then IP header rules. */
export function homeVariantRewrites(): HomeRewrite[] {
  const groups = tokensByVariant();
  const rules: HomeRewrite[] = [];
  for (const variant of HOME_VARIANTS) {
    const tokens = groups.get(variant);
    if (!tokens?.length) continue;
    rules.push({
      source: "/",
      has: [{ type: "cookie", key: COUNTRY_COOKIE_NAME, value: homeVariantValuePattern(tokens) }],
      destination: `${HOME_VARIANT_PREFIX}/${variant}`,
    });
  }
  for (const variant of HOME_VARIANTS) {
    // Header-resolved fallback is the same page as plain `/`; no rewrite needed.
    if (variant === FALLBACK_COUNTRY) continue;
    const tokens = groups.get(variant);
    if (!tokens?.length) continue;
    rules.push({
      source: "/",
      has: [{ type: "header", key: "x-vercel-ip-country", value: homeVariantValuePattern(tokens) }],
      destination: `${HOME_VARIANT_PREFIX}/${variant}`,
    });
  }
  return rules;
}
