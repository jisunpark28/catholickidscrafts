/** Existing destinations, not replacement routes. My Binder has no implementation in this checkout. */
export type SidebarIcon = "printables" | "mass" | "play" | "bible" | "questions" | "prayer" | "binder";
export type SidebarItem = { id: SidebarIcon; label: string; href: string | null; separator?: boolean; plus?: boolean };
export const SIDEBAR_ITEMS: readonly SidebarItem[] = [
  { id: "printables", label: "Printables", href: "/resource" },
  { id: "mass", label: "Daily Mass", href: "/daily-mass" },
  { id: "play", label: "Play & Learn", href: "/play" },
  { id: "bible", label: "Mom's Bible", href: "/moms-bible/situations", separator: true },
  { id: "questions", label: "Q&A Cards", href: "/catholic-faith-questions#qa-cards" },
  { id: "prayer", label: "Faith & Prayer", href: "/catholic-faith-questions" },
  { id: "binder", label: "My Binder", href: null, separator: true, plus: true },
];
export function sidebarItems(activePaidPlus: boolean): readonly SidebarItem[] {
  return SIDEBAR_ITEMS.filter((item) => !item.plus || activePaidPlus);
}
export function sidebarItemIsCurrent(id: SidebarIcon, pathname: string, hash = ""): boolean {
  const within = (path: string) => pathname === path || pathname.startsWith(`${path}/`);
  switch (id) {
    case "printables": return within("/resource");
    case "mass": return within("/daily-mass") || within("/mass");
    case "play": return within("/play");
    case "bible": return within("/bible") || within("/moms-bible") || within("/bible-verses-for-kids") || pathname === "/gospel";
    case "questions": return pathname.startsWith("/catholic-faith-questions/") || (pathname === "/catholic-faith-questions" && hash === "#qa-cards");
    case "prayer": return (pathname === "/catholic-faith-questions" && hash !== "#qa-cards") || within("/prayers") || within("/liturgy") || within("/catholic-mass-for-kids") || within("/catholic-saints-for-kids") || within("/catholic-virtue-challenge");
    case "binder": return false; // Do not highlight or invent a route for an unimplemented feature.
  }
}
/** Honor existing paid grant windows, but not preview-email or unpaid trial access. */
export function isPaidSidebarGrant(plan: { isPlus: boolean; source: string; pass: { active: boolean }; sub: { grantsPlus: boolean; subscription: { status: string } | null } }): boolean {
  return plan.isPlus && ((plan.source === "pass" && plan.pass.active) ||
    (plan.source === "stripe" && plan.sub.grantsPlus && plan.sub.subscription !== null && plan.sub.subscription.status !== "TRIALING"));
}