import { SiteCopyProvider } from "@/components/SiteCopyProvider";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { VisitTracker } from "@/components/VisitTracker";
import { getSiteCopyMap } from "@/lib/site-copy";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const copy = await getSiteCopyMap();

  return (
    <SiteCopyProvider copy={copy}>
      <VisitTracker />
      <SiteHeader />
      <main>{children}</main>
      <SiteFooter />
    </SiteCopyProvider>
  );
}
