"use client";

import type { SiteCopyMap } from "@/lib/site-copy-types";
import { createContext, useContext } from "react";

const SiteCopyContext = createContext<SiteCopyMap>({});

export function SiteCopyProvider({
  copy,
  children,
}: {
  copy: SiteCopyMap;
  children: React.ReactNode;
}) {
  return <SiteCopyContext.Provider value={copy}>{children}</SiteCopyContext.Provider>;
}

export function useSiteCopy(): SiteCopyMap {
  return useContext(SiteCopyContext);
}

/** Non-hook helper — use with a single `useSiteCopy()` call per component. */
export function textFromCopy(map: SiteCopyMap, key: string, fallback = ""): string {
  return map[key] ?? fallback;
}
