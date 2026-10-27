import { requireFamilySession } from "@/lib/family-auth";
import { canOpenResourceSheet } from "@/lib/resource/access";
import { COUNTRY_COOKIE, pickCountry, thisSunday } from "@/lib/resource/this-sunday";
import { familyHasPlus } from "@/lib/subscription/entitlements";
import { cookies, headers } from "next/headers";

/** Server helper: Plus flag + this Sunday key for Resource gating. */
export async function resolveResourceViewer(opts?: {
  countryParam?: string;
}): Promise<{
  isPlus: boolean;
  thisSundayKey: string | null;
  thisSundayDate: string | null;
  country: ReturnType<typeof pickCountry>;
}> {
  const [cookieStore, h, session] = await Promise.all([cookies(), headers(), requireFamilySession()]);
  const country = pickCountry(
    opts?.countryParam,
    cookieStore.get(COUNTRY_COOKIE)?.value,
    h.get("x-vercel-ip-country"),
  );
  const sunday = thisSunday(country);
  const isPlus = session ? await familyHasPlus(session.familyAccountId) : false;
  return {
    isPlus,
    thisSundayKey: sunday?.key ?? null,
    thisSundayDate: sunday?.date ?? null,
    country,
  };
}

export function sheetOpenAllowed(
  viewer: Awaited<ReturnType<typeof resolveResourceViewer>>,
  sheetKey: string,
): boolean {
  return canOpenResourceSheet({
    isPlus: viewer.isPlus,
    sheetKey,
    thisSundayKey: viewer.thisSundayKey,
  });
}
