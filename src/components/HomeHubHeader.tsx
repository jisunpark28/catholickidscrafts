"use client";

import { HomeHubAccountMenu } from "@/components/HomeHubAccountMenu";
import { HomeLearnSearch } from "@/components/HomeLearnSearch";
import { SiteLogo } from "@/components/SiteLogo";
import { textFromCopy, useSiteCopy } from "@/components/SiteCopyProvider";
import type { HeaderSessionResponse } from "@/lib/header-session";
import { useId } from "react";

type Props = {
  initialSession: HeaderSessionResponse;
};

export function HomeHubHeader({ initialSession }: Props) {
  const copy = useSiteCopy();
  const t = (key: string, fallback: string) => textFromCopy(copy, key, fallback);
  const searchResultsSlotId = useId();

  const siteNav = [
    { href: "/mass", label: t("global.nav.mass", "Daily Mass") },
    { href: "/play", label: t("global.nav.play", "Play") },
    { href: "/curriculum", label: t("global.nav.curriculum", "Curriculum") },
    { href: "/resources", label: t("global.nav.resources", "Kids Resources") },
    {
      href: "/recommendations",
      label: t("global.nav.recommendations", "Recommendations"),
    },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-[#e8dccf] bg-[#f5ebe0]">
      <div className="mx-auto w-full max-w-[1600px] px-4 py-3 sm:px-8 lg:px-12">
        <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2 sm:gap-3">
          <div className="col-start-1 row-start-1 flex min-w-0 justify-start">
            <HomeLearnSearch
              variant="header"
              className="w-full max-w-[10.5rem] sm:max-w-xs"
              headerResultsSlotId={searchResultsSlotId}
            />
          </div>

          <div className="col-start-2 row-start-1 flex shrink-0 justify-center scale-[0.88] sm:scale-100">
            <SiteLogo size="header" showWordmark={false} linkToHome />
          </div>

          <div className="col-start-3 row-start-1 flex justify-end">
            <HomeHubAccountMenu siteNav={siteNav} initialSession={initialSession} />
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
