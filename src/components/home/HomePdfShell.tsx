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
  /**
   * Optional middle finder for Printables Option E (3-column: nav · middle · article).
   * When set, `children` render in the right article column.
   */
  middle?: React.ReactNode;
  /** Mode chrome above middle + article (e.g. Sundays | Cards toggle). */
  chrome?: React.ReactNode;
  /** Mobile label for opening the middle finder drawer. */
  middleDrawerLabel?: string;
};

export function HomePdfShell({
  children,
  contentClassName = "bg-white",
  middle,
  chrome,
  middleDrawerLabel = "Browse",
}: Props) {
  const pathname = usePathname() ?? "";
  const navId = useId();
  const middleId = useId();
  const activePaidPlus = useSidebarPaidPlus();
  const [hash, setHash] = useState("");
  useEffect(() => {
    const update = () => setHash(window.location.hash);
    update();
    window.addEventListener("hashchange", update);
    window.addEventListener("popstate", update);
    return () => {
      window.removeEventListener("hashchange", update);
      window.removeEventListener("popstate", update);
    };
  }, [pathname]);
  const [desktopOpen, setDesktopOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [middleOpen, setMiddleOpen] = useState(false);
  const triptych = Boolean(middle);

  useEffect(() => {
    if (!mobileOpen && !middleOpen) return;
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setMobileOpen(false);
        setMiddleOpen(false);
      }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [mobileOpen, middleOpen]);

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
          <SidebarNavigation
            pathname={pathname}
            hash={hash}
            activePaidPlus={activePaidPlus}
            onNavigate={(href) => {
              setHash(href.includes("#") ? `#${href.split("#")[1]}` : "");
              setMobileOpen(false);
            }}
          />
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

        {chrome ? <div className="mb-4">{chrome}</div> : null}

        {triptych ? (
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:gap-6">
            {middleOpen ? (
              <div
                className="fixed inset-0 z-40 bg-[#1c1c1c]/35 lg:hidden"
                aria-hidden
                onClick={() => setMiddleOpen(false)}
              />
            ) : null}

            {!middleOpen && (
              <button
                type="button"
                className="inline-flex items-center gap-2 self-start rounded-full border border-[#e8d9cd] bg-[#fff3e6] px-3 py-1.5 text-sm font-medium text-[#493a30] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#c9773a] lg:hidden"
                aria-expanded={false}
                aria-controls={middleId}
                onClick={() => setMiddleOpen(true)}
              >
                {middleDrawerLabel}
              </button>
            )}

            <aside
              id={middleId}
              className={`${
                middleOpen ? "fixed inset-y-0 left-0 z-50 flex w-[min(20rem,88vw)] flex-col" : "hidden"
              } shrink-0 rounded-[20px] border border-[#e8d9cd] bg-[#fff3e6] lg:sticky lg:top-[6.5rem] lg:flex lg:max-h-[calc(100dvh-7.5rem)] lg:w-[15.5rem] lg:overflow-y-auto`}
            >
              <div className="flex items-center justify-between border-b border-[#eadccd] px-3 py-2 lg:hidden">
                <p className="m-0 text-sm font-semibold text-[#493a30]">{middleDrawerLabel}</p>
                <button
                  type="button"
                  className="inline-flex h-8 w-8 items-center justify-center rounded-md text-[#806454] hover:bg-[#fffdfa]"
                  onClick={() => setMiddleOpen(false)}
                  aria-label="Close browse panel"
                >
                  ×
                </button>
              </div>
              <div className="px-3 py-3" onClick={() => setMiddleOpen(false)}>
                {middle}
              </div>
            </aside>

            <div className="min-w-0 flex-1">{children}</div>
          </div>
        ) : (
          children
        )}
      </div>
    </div>
  );
}
