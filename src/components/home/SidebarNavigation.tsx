import Link from "next/link";
import { Fragment } from "react";
import { sidebarItems, sidebarItemIsCurrent } from "@/lib/sidebar-navigation";
import { SidebarIllustration } from "./SidebarIllustration";

export function SidebarNavigation({ pathname, hash = "", activePaidPlus, onNavigate = () => {} }: {
  pathname: string; hash?: string; activePaidPlus: boolean; onNavigate?: (href: string) => void;
}) {
  return (
    <nav aria-label="Home" >
      <ul className="m-0 flex list-none flex-col gap-3 p-0">
        {sidebarItems(activePaidPlus).map((item) => {
          const active = sidebarItemIsCurrent(item.id, pathname, hash);
          const classes = `flex min-h-20 w-full items-center gap-3 rounded-[18px] border px-3 py-2.5 text-left text-[19px] font-semibold leading-tight no-underline transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#607537] ${active
            ? "border-[#607537] bg-[#607537] text-white shadow-sm"
            : "border-[#ded3ad] bg-[#fffbed] text-[#405329] shadow-[inset_0_1px_0_rgba(255,255,255,0.8),0_1px_2px_rgba(89,74,34,0.04)] hover:border-[#9aaa6d] hover:bg-[#f5f2df]"}`;
          const content = <>
            <SidebarIllustration kind={item.id} className="h-14 w-14 shrink-0" />
            <span className="min-w-0 flex-1">{item.label}</span>
            {item.plus && <span className="rounded-md bg-[#607537] px-1.5 py-1 text-[10px] font-semibold leading-none text-white">PLUS</span>}
          </>;
          return <Fragment key={item.id}>
            {item.separator && <li role="separator" aria-hidden="true" data-sidebar-separator={item.id} className="my-1 h-[3px] bg-[radial-gradient(circle,#c5b37b_1.3px,transparent_1.5px)] bg-[length:9px_3px] bg-repeat-x" />}
            <li>
              {item.href ? <Link href={item.href} className={classes} onClick={() => onNavigate(item.href!)} aria-current={active ? "page" : undefined}>
                {content}
              </Link> : <button type="button" className={classes} disabled aria-describedby="sidebar-binder-unavailable" data-sidebar-unavailable="binder">
                {content}
              </button>}
              {!item.href && <span id="sidebar-binder-unavailable" className="sr-only">My Binder is not available yet: this site has no existing binder destination.</span>}
            </li>
          </Fragment>;
        })}
      </ul>
    </nav>
  );
}