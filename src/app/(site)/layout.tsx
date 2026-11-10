import { SiteCopyProvider } from "@/components/SiteCopyProvider";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteSessionProvider } from "@/components/SiteSessionProvider";
import { VisitTracker } from "@/components/VisitTracker";
import { getSiteCopyMap } from "@/lib/site-copy";

/**
 * No cookies, headers or session here, so (site) pages can be static. Per-user header and
 * sidebar bits load in the browser (SiteSessionProvider). Access checks live in each
 * protected page, layout or API, never here.
 */
export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const copy = await getSiteCopyMap();

  return (
    <SiteSessionProvider>
    <SiteCopyProvider copy={copy}>
      <VisitTracker />
      <SiteHeader />
      <main className="relative z-0">{children}</main>
      <SiteFooter />
    </SiteCopyProvider>
    </SiteSessionProvider>
  );
}
