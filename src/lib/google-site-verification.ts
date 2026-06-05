/**
 * Google Search Console HTML tag verification code (content= value only).
 * Set GOOGLE_SITE_VERIFICATION in Vercel Production, then redeploy — or use
 * NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION if you need build-time static HTML.
 */
export function getGoogleSiteVerification(): string | undefined {
  const raw =
    process.env.GOOGLE_SITE_VERIFICATION?.trim() ||
    process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION?.trim();
  return raw || undefined;
}
