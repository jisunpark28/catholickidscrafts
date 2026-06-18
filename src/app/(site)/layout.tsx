import { SiteChrome } from "@/components/SiteChrome";
import { SiteCopyProvider } from "@/components/SiteCopyProvider";
import { VisitTracker } from "@/components/VisitTracker";
import { getSiteCopyMap } from "@/lib/site-copy";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const copy = await getSiteCopyMap();

  return (
    <SiteCopyProvider copy={copy}>
      <VisitTracker />
      <SiteChrome>{children}</SiteChrome>
    </SiteCopyProvider>
  );
}
