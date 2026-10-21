"use client";

import { HomeHubAccountMenu } from "@/components/HomeHubAccountMenu";
import { HomeLearnSearch } from "@/components/HomeLearnSearch";
import { SiteLogo } from "@/components/SiteLogo";
import { textFromCopy, useSiteCopy } from "@/components/SiteCopyProvider";
import type { HeaderSessionResponse } from "@/lib/header-session";
import { isTestamentChromePath } from "@/lib/bible/testament-chrome";
import { usePathname } from "next/navigation";
import { useId } from "react";

type Props = {
  initialSession: HeaderSessionResponse;
};

export function HomeHubHeader({ initialSession }: Props) {
  const copy = useSiteCopy();
  const t = (key: string, fallback: string) => textFromCopy(copy, key, fallback);
  const pathname = usePathname() ?? "";
  const isHome = pathname === "/";
  const isDailyMass = pathname === "/daily-mass";
  const isGospel = pathname === "/bible/gospel" || pathname === "/gospel";
  const isTestament = isTestamentChromePath(pathname);
  const isPrayers = pathname === "/prayers" || pathname.startsWith("/prayers/");
  const isLiturgyGrid = pathname.startsWith("/liturgy/");
  const edgeHeader =
    isHome || isDailyMass || isGospel || isTestament || isPrayers || isLiturgyGrid;
  const searchResultsSlotId = useId();

  return (
    <header className="sticky top-0 z-50 border-b border-[#e8dccf] bg-[#f5ebe0]">
      <div
        className={
          edgeHeader
            ? "w-full px-3 py-3 sm:px-4"
            : "mx-auto w-full max-w-[1600px] px-4 py-3 sm:px-8 lg:px-12"
        }
      >
        <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2 sm:gap-3">
          <div className="col-start-1 row-start-1 flex min-w-0 justify-start">
            <HomeLearnSearch
              variant="header"
              className={
                edgeHeader
                  ? "w-full max-w-[11rem] sm:max-w-xs lg:max-w-sm"
                  : "w-full max-w-[10.5rem] sm:max-w-xs"
              }
              headerResultsSlotId={searchResultsSlotId}
            />
          </div>

          <div className="col-start-2 row-start-1 flex shrink-0 justify-center scale-[0.94] sm:scale-100">
            <SiteLogo size="header" showWordmark={false} linkToHome />
          </div>

          <div className="col-start-3 row-start-1 flex min-w-0 items-center justify-end gap-1.5 sm:gap-2">
            <HomeHubAccountMenu
              initialSession={initialSession}
              signInLabel={t("global.nav.sign_in", "Sign in")}
            />
          </div>

          <div
            id={searchResultsSlotId}
            className="pointer-events-none col-span-3 row-start-2 [&>*]:pointer-events-auto"
          />
        </div>
      </div>
    </header>
  );
}
