"use client";

import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { usePathname } from "next/navigation";

export function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() ?? "";
  const isHome = pathname === "/";

  return (
    <>
      {!isHome && <SiteHeader />}
      <main>{children}</main>
      {!isHome && <SiteFooter />}
    </>
  );
}
