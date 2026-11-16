import { requireFamilySession } from "@/lib/family-auth";
import { signInPath } from "@/lib/sign-in-callback";
import { redirect } from "next/navigation";

/**
 * Print pages: signed-out visitors go to the family sign-in page and come back to `returnPath`
 * afterwards. Sign-in only (any family session); Plus checks stay where they are.
 */
export async function requireSignInForPage(returnPath: string) {
  const session = await requireFamilySession();
  if (!session) redirect(signInPath(returnPath));
  return session;
}

/**
 * Embedded previews (`?embed=1`, the home page "This Sunday" card) stay visible to everyone, but a
 * signed-out visitor who prints one gets this notice instead of the sheet.
 */
export const SIGNED_OUT_PRINT_CSS = `@media print{body *{display:none!important}body::after{content:"Sign in at catholickidscrafts.com to print this sheet.";display:block;margin:1in auto;max-width:6.5in;padding:24px;border:2px solid #d35400;border-radius:12px;font:16px/1.5 system-ui,sans-serif;color:#1c1c1c;text-align:center}}`;

/** Embedded preview: no redirect (it must still render), only whether to add SIGNED_OUT_PRINT_CSS. */
export async function isSignedInForEmbed(): Promise<boolean> {
  return Boolean(await requireFamilySession());
}
