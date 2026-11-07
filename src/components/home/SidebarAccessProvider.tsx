"use client";
import { createContext, useContext, type ReactNode } from "react";
const SidebarPaidPlus = createContext(false);
/** Only a server-computed entitlement enters this context; it grants no backend access. */
export function SidebarAccessProvider({ activePaidPlus, children }: { activePaidPlus: boolean; children: ReactNode }) {
  return <SidebarPaidPlus.Provider value={activePaidPlus}>{children}</SidebarPaidPlus.Provider>;
}
export function useSidebarPaidPlus() { return useContext(SidebarPaidPlus); }