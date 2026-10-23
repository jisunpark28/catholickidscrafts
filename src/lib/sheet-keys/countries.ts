// Server-only (imported by toSheetKey, which loads romcal).
// Sheet content and keys are shared by every country; only the date -> key
// mapping changes, via the romcal national calendar used for each country.

export type RomcalCountry =
  | "general"
  | "canada"
  | "unitedStates"
  | "england"
  | "wales"
  | "scotland"
  | "ireland"
  | "australia"
  | "newZealand"
  | "philippines"
  | "india";

export type CountryConfig = {
  /** romcal `country` option; `general` means the option is omitted. */
  romcal: RomcalCountry;
  /** romcal 1.3.0 defaults Ascension to Thursday for every country. */
  ascensionOnSunday: boolean;
};

export const FALLBACK_COUNTRY: RomcalCountry = "general";

export const COUNTRY_CONFIG: Record<RomcalCountry, CountryConfig> = {
  general: { romcal: "general", ascensionOnSunday: false },
  canada: { romcal: "canada", ascensionOnSunday: true },
  // Most US provinces transfer Ascension to Sunday; romcal models one setting only.
  unitedStates: { romcal: "unitedStates", ascensionOnSunday: true },
  england: { romcal: "england", ascensionOnSunday: true },
  wales: { romcal: "wales", ascensionOnSunday: true },
  scotland: { romcal: "scotland", ascensionOnSunday: true },
  ireland: { romcal: "ireland", ascensionOnSunday: true },
  australia: { romcal: "australia", ascensionOnSunday: true },
  newZealand: { romcal: "newZealand", ascensionOnSunday: true },
  philippines: { romcal: "philippines", ascensionOnSunday: true },
  india: { romcal: "india", ascensionOnSunday: true },
};

/** ISO 3166-1 alpha-2 (x-vercel-ip-country) -> default romcal country. */
export const SUPPORTED: Record<string, RomcalCountry> = {
  CA: "canada",
  US: "unitedStates",
  GB: "england",
  IE: "ireland",
  AU: "australia",
  NZ: "newZealand",
  PH: "philippines",
  IN: "india",
};

/** Sub-choices a GB visitor may pick (default england). */
export const GB_SUBCHOICES: readonly RomcalCountry[] = ["england", "wales", "scotland"];

/** Countries whose mapping passes scripts/test-sheet-keys.ts. Others use FALLBACK_COUNTRY. */
export const ENABLED_COUNTRIES: readonly RomcalCountry[] = ["canada", "unitedStates"];

function isRomcalCountry(v: string): v is RomcalCountry {
  return Object.prototype.hasOwnProperty.call(COUNTRY_CONFIG, v);
}

function parseChoice(value: string | null | undefined): RomcalCountry | null {
  if (!value) return null;
  const v = value.trim();
  if (!v) return null;
  const iso = SUPPORTED[v.toUpperCase()];
  if (iso) return iso;
  const match = Object.keys(COUNTRY_CONFIG).find((k) => k.toLowerCase() === v.toLowerCase());
  return match && isRomcalCountry(match) ? match : null;
}

export function enabledOrFallback(country: RomcalCountry): RomcalCountry {
  return ENABLED_COUNTRIES.includes(country) ? country : FALLBACK_COUNTRY;
}

/**
 * Cookie (user's selector choice: ISO code or romcal name) wins over the
 * Vercel IP header. Anything not in ENABLED_COUNTRIES resolves to `general`.
 */
export function resolveCountry(
  ipCountryHeader: string | null | undefined,
  cookieValue?: string | null,
): RomcalCountry {
  const chosen = parseChoice(cookieValue) ?? parseChoice(ipCountryHeader) ?? FALLBACK_COUNTRY;
  return enabledOrFallback(chosen);
}
