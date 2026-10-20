"use client";

import { testamentNavLabel } from "@/lib/bible/testament-chrome";
import type { HomePdfGroup, HomePdfLink } from "@/lib/home-pdf-nav";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useState } from "react";

function linkIsCurrent(item: HomePdfLink, pathname: string): boolean {
  const path = item.href.split("?")[0] || item.href;
  if (path === "/gospel" || path === "/bible/gospel") {
    return pathname === "/gospel" || pathname === "/bible/gospel";
  }
  const testament = testamentNavLabel(pathname);
  if (testament && item.label === testament) return true;
  return pathname === path;
}

type Props = {
  groups: HomePdfGroup[];
  children: React.ReactNode;
  /** Label for the Daily Mass button above the Bible group. */
  dailyMassLabel?: string;
};

export const DAILY_MASS_HREF = "/daily-mass";

function dailyMassClass(active: boolean): string {
  return [
    "flex w-full items-center justify-center gap-2 rounded-full px-3 py-2.5 text-center text-[15px] font-semibold no-underline transition",
    "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#d35400]",
    active
      ? "border border-[#d35400] bg-[#d35400] text-white shadow-[0_2px_6px_rgba(211,84,0,0.3)]"
      : "border-2 border-[#d35400] bg-white text-[#d35400] hover:bg-[#fff6ef]",
  ].join(" ");
}

function CalendarIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M3 10h18M8 3v4M16 3v4" />
    </svg>
  );
}

function pillClass(active: boolean): string {
  return [
    "flex w-full items-center justify-center rounded-full border px-3 py-2.5 text-center text-sm font-medium text-[#1c1c1c] no-underline transition",
    "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#d35400]",
    active
      ? "border-[#f5ebe0] bg-[#f5ebe0]"
      : "border-[#e7e3de] bg-white hover:bg-[#fffdfb]",
  ].join(" ");
}

function NavAnchor({
  item,
  active,
  onNavigate,
}: {
  item: HomePdfLink;
  active: boolean;
  onNavigate: () => void;
}) {
  const className = pillClass(active);
  if (item.href.startsWith("http://") || item.href.startsWith("https://")) {
    return (
      <a href={item.href} className={className} onClick={onNavigate}>
        {item.label}
      </a>
    );
  }
  return (
    <Link href={item.href} className={className} onClick={onNavigate} aria-current={active ? "page" : undefined}>
      {item.label}
    </Link>
  );
}

export function HomePdfShell({ groups, children, dailyMassLabel = "Daily Mass" }: Props) {
  const pathname = usePathname() ?? "";
  const navId = useId();
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
        className={`${asideVisible} w-full shrink-0 flex-col bg-[#fdfaf7] lg:w-[15.5rem]`}
      >
        <div className="px-4 pb-8 pt-3 lg:sticky lg:top-[6.5rem] lg:max-h-[calc(100dvh-6.5rem)] lg:overflow-y-auto">
          <div className="mb-1 flex justify-end">
            <button
              type="button"
              className="inline-flex h-8 w-8 items-center justify-center rounded-md text-xl leading-none text-[#6b7280] hover:bg-white hover:text-[#1c1c1c] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#d35400]"
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
          <nav aria-label="Home">
            <div className="mb-5 mt-1">
              <Link
                href={DAILY_MASS_HREF}
                className={dailyMassClass(pathname === DAILY_MASS_HREF)}
                aria-current={pathname === DAILY_MASS_HREF ? "page" : undefined}
                onClick={() => setMobileOpen(false)}
              >
                <CalendarIcon />
                {dailyMassLabel}
              </Link>
            </div>
            {groups.map((group) => (
              <div key={group.id} className="mt-4 first:mt-1">
                <h2 className="mb-3 px-1 text-base font-medium text-[#1c1c1c]">{group.title}</h2>
                <ul className="flex list-none flex-col gap-2.5 p-0">
                  {group.items.map((item) => (
                    <li key={item.id}>
                      <NavAnchor
                        item={item}
                        active={linkIsCurrent(item, pathname)}
                        onNavigate={() => setMobileOpen(false)}
                      />
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </div>
      </aside>

      <div className="min-w-0 flex-1 bg-white px-3 py-4 sm:px-6 sm:py-5 lg:px-8 lg:py-6">
        {!mobileOpen && (
          <button
            type="button"
            className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#e7e3de] bg-[#fdfaf7] px-3 py-1.5 text-sm font-medium text-[#1c1c1c] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#d35400] lg:hidden"
            aria-expanded={false}
            aria-controls={navId}
            onClick={() => setMobileOpen(true)}
          >
            <span aria-hidden>»</span>
            Bible & Liturgy
          </button>
        )}
        {!desktopOpen && (
          <button
            type="button"
            className="mb-3 hidden h-8 w-8 items-center justify-center rounded-md text-lg leading-none text-[#9ca3af] hover:bg-[#fdfaf7] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#d35400] lg:inline-flex"
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
