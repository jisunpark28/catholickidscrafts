import { SidebarAccessProvider } from "@/components/home/SidebarAccessProvider";
import { getSidebarPaidPlus } from "@/lib/sidebar-access";
import { SiteCopyProvider } from "@/components/SiteCopyProvider";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { getSiteCopyMap } from "@/lib/site-copy";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const [copy, activePaidPlus] = await Promise.all([getSiteCopyMap(), getSidebarPaidPlus()]);

  return (
    <SidebarAccessProvider activePaidPlus={activePaidPlus}>
    <SiteCopyProvider copy={copy}>
      <SiteHeader />
      <main className="relative z-0">{children}</main>
      <SiteFooter />
    </SiteCopyProvider>
    </SidebarAccessProvider>
  );
}
