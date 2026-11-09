import { HomeHubHeader } from "@/components/HomeHubHeader";
import { SitePlusExpiryBanner } from "@/components/PlusExpiryBanner";
import { KidLoginNoticeBanner } from "@/components/KidLoginNoticeBanner";

/**
 * Public site header: search, logo, and menu on every page (home + sub-pages).
 * Reads no cookies or session on the server; the account menu and Plus notice load the
 * session in the browser (SiteSessionProvider) so pages can be served statically.
 */
export function SiteHeader() {
  return (
    <>
      <HomeHubHeader />
      <SitePlusExpiryBanner />
      <KidLoginNoticeBanner />
    </>
  );
}
