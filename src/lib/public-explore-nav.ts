export type PublicExploreNavItem = {
  href: string;
  labelKey: string;
  fallback: string;
};

/** Primary public destinations for header + footer Explore. */
export const PUBLIC_EXPLORE_NAV: PublicExploreNavItem[] = [
  { href: "/mass", labelKey: "global.nav.mass", fallback: "Daily Mass" },
  { href: "/resources", labelKey: "global.nav.resources", fallback: "Kids Resources" },
  { href: "/curriculum", labelKey: "global.nav.curriculum", fallback: "Curriculum" },
  { href: "/play", labelKey: "global.nav.play_learn", fallback: "Play & Learn" },
  { href: "/prayers", labelKey: "global.nav.prayers", fallback: "Prayers" },
];
