"use client";

import type { HomePdfGroup } from "@/lib/home-pdf-nav";
import { usePathname } from "next/navigation";
import { useEffect, useId, useState } from "react";
import { SidebarNavigation } from "./SidebarNavigation";
import { useSidebarPaidPlus } from "./SidebarAccessProvider";
import { fredoka } from "@/components/liturgy/fredoka";

type Props = {
  /** Legacy group data stays available to existing destination hubs, not expanded in this sidebar. */
  groups: HomePdfGroup[];
  children: React.ReactNode;
  dailyMassLabel?: string;
  contentClassName?: string;
};

export function HomePdfShell({ children, contentClassName = "bg-white" }: Props) {
  const pathname = usePathname() ?? "";
  const navId = useId();
  const activePaidPlus = useSidebarPaidPlus();
  const [hash, setHash] = useState("");
  useEffect(() => {
    const update = () => setHash(window.location.hash);
    update(); window.addEventListener("hashchange", update); window.addEventListener("popstate", update);
    return () => { window.removeEventListener("hashchange", update); window.removeEventListener("popstate", update); };
  }, [pathname]);
  const [desktopOpen, setDesktopOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (!mobileOpen) return;
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setMobileOpen(false);
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [mobileOpen]);

  const asideVisible = `${mobileOpen ? "flex" : "hidden"} ${desktopOpen ? "lg:flex" : "lg:hidden"}`;

  return (
    <div className="flex min-h-[calc(100dvh-6.5rem)] flex-col bg-white lg:flex-row">
      <aside
        id={navId}
        className={`${fredoka.variable} ${asideVisible} w-full shrink-0 flex-col bg-[#fcf7f2] lg:w-[17rem]`}
        style={{ fontFamily: "var(--font-fredoka), sans-serif" }}
      >
        <div className="px-4 pb-8 pt-3 lg:sticky lg:top-[6.5rem] lg:max-h-[calc(100dvh-6.5rem)] lg:overflow-y-auto">
          <div className="mb-1 flex justify-end">
            <button
              type="button"
              className="inline-flex h-8 w-8 items-center justify-center rounded-md text-xl leading-none text-[#806454] hover:bg-[#fffdfa] hover:text-[#9d451d] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#9d451d]"
              aria-expanded={true}
              aria-controls={navId}
              onClick={() => {
                if (window.matchMedia("(min-width: 1024px)").matches) setDesktopOpen(false);
                else setMobileOpen(false);
              }}
            >
              <span aria-hidden>«</span>
              <span className="sr-only">Hide navigation</span>
            </button>
          </div>
          <SidebarNavigation pathname={pathname} hash={hash} activePaidPlus={activePaidPlus} onNavigate={(href) => {
            setHash(href.includes("#") ? `#${href.split("#")[1]}` : "");
            setMobileOpen(false);
          }} />
        </div>
      </aside>

      <div className={`min-w-0 flex-1 px-3 py-4 sm:px-6 sm:py-5 lg:px-8 lg:py-6 ${contentClassName}`}>
        {!mobileOpen && (
          <button
            type="button"
            className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#e8d9cd] bg-[#fffdfa] px-3 py-1.5 text-sm font-medium text-[#493a30] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#9d451d] lg:hidden"
            aria-expanded={false}
            aria-controls={navId}
            onClick={() => setMobileOpen(true)}
          >
            <span aria-hidden>»</span>
            Explore & Learn
          </button>
        )}
        {!desktopOpen && (
          <button
            type="button"
            className="mb-3 hidden h-8 w-8 items-center justify-center rounded-md text-lg leading-none text-[#806454] hover:bg-[#fffdfa] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#9d451d] lg:inline-flex"
            aria-expanded={false}
            aria-controls={navId}
            onClick={() => setDesktopOpen(true)}
          >
            <span aria-hidden>»</span>
            <span className="sr-only">Show navigation</span>
          </button>
        )}

        {children}
      </div>
    </div>
  );
}
