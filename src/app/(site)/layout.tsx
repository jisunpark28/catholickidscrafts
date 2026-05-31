import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { VisitTracker } from "@/components/VisitTracker";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <VisitTracker />
      <SiteHeader />
      <main>{children}</main>
      <SiteFooter />
    </>
  );
}
