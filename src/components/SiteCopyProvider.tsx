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

/** Read operator-editable copy with optional fallback. */
export function useCopy(key: string, fallback = ""): string {
  const map = useSiteCopy();
  return map[key] ?? fallback;
}
