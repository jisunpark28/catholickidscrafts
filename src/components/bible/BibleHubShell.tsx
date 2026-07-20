import { HomeHubButtonLink } from "@/components/HomeHubButton";

type Props = {
  children: React.ReactNode;
  backHref?: string;
  backLabel?: string;
  showBack?: boolean;
  /** Tighter vertical padding for typing-heavy pages. */
  compact?: boolean;
  /** Allow full-width typing tables (144rem) on gospel / chapter pages. */
  wide?: boolean;
};

/** Shared hub layout for Bible Reading sub-pages (Gospel, OT, NT, chapters). */
export function BibleHubShell({
  children,
  backHref = "/",
  backLabel = "← Home",
  showBack = true,
  compact = false,
  wide = false,
}: Props) {
  return (
    <div
      className={`mx-auto w-full ${wide ? "max-w-[144rem]" : "max-w-[1600px]"} px-4 sm:px-8 ${
        compact ? "py-4 sm:py-6" : "py-8 sm:py-10"
      }`}
    >
      {showBack && (
        <div className={compact ? "mb-4" : "mb-8"}>
          <HomeHubButtonLink
            href={backHref}
            variant="outline"
            className="!min-h-[2.75rem] !py-2.5 !text-sm"
          >
            {backLabel}
          </HomeHubButtonLink>
        </div>
      )}
      {children}
    </div>
  );
}
