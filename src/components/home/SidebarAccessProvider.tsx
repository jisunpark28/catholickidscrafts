"use client";
import { useSiteSession } from "@/components/SiteSessionProvider";
/**
 * Paid-Plus flag for the sidebar, computed on the server by /api/auth/session
 * (lib/sidebar-access) and loaded once per page by SiteSessionProvider. Display only:
 * it grants no backend access.
 */
export function useSidebarPaidPlus() { return useSiteSession().paidPlus; }
