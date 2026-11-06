import { HomePdfShell } from "@/components/home/HomePdfShell";
import { getResourceNav } from "@/lib/resource/nav";
import { copyText, getSiteCopyMap } from "@/lib/site-copy";

/** Keep the same navigation around the hub and every game, including direct links. */
export default async function PlayLayout({ children }: { children: React.ReactNode }) {
  const [nav, copy] = await Promise.all([getResourceNav(), getSiteCopyMap()]);
  const playLabel = copyText(copy, "global.nav.play_learn", "Play & Learn");
  const hasPlayLink = nav.groups.some((group) =>
    group.items.some((item) => item.href.split("?")[0] === "/play"),
  );
  const groups = hasPlayLink
    ? nav.groups
    : [
        { id: "play", title: playLabel, items: [{ id: "play-hub", label: playLabel, href: "/play" }] },
        ...nav.groups,
      ];

  return (
    <HomePdfShell groups={groups} dailyMassLabel={nav.dailyMassLabel}>
      <div className="mx-auto w-full max-w-6xl rounded-3xl border border-[#e8e0d6] bg-[#fdfaf7] p-4 sm:p-6 lg:p-8">
        {children}
      </div>
    </HomePdfShell>
  );
}
