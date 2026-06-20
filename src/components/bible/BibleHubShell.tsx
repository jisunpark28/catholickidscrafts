import { HomeHubButtonLink, HOME_HUB_DAILY_MASS_WIDTH_CLASS } from "@/components/HomeHubButton";

type Props = {
  children: React.ReactNode;
  backHref?: string;
  backLabel?: string;
};

/** Shared hub layout for Bible Reading sub-pages (Gospel, OT, NT, chapters). */
export function BibleHubShell({ children, backHref = "/", backLabel = "← Home" }: Props) {
  return (
    <div className="mx-auto w-full max-w-[1600px] px-4 py-8 sm:px-8 sm:py-10">
      <div className={HOME_HUB_DAILY_MASS_WIDTH_CLASS}>
        <HomeHubButtonLink
          href={backHref}
          variant="outline"
          className="mb-8 !min-h-[2.75rem] !py-2.5 !text-sm"
        >
          {backLabel}
        </HomeHubButtonLink>
      </div>
      {children}
    </div>
  );
}
