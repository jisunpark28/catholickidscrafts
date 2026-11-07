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
          const classes = `relative flex min-h-20 w-full items-center gap-3 rounded-[18px] border px-3 py-2.5 text-left text-[19px] font-semibold leading-tight no-underline transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#9d451d] ${active
            ? "border-[#b46139] bg-[#fbe8dc] text-[#9d451d] shadow-sm before:absolute before:-left-0.5 before:top-1/2 before:h-7 before:w-1.5 before:-translate-y-1/2 before:rounded-full before:bg-[#2e7d32]"
            : "border-[#e8d9cd] bg-[#fffdfa] text-[#493a30] shadow-[inset_0_1px_0_rgba(255,255,255,0.8),0_1px_2px_rgba(105,65,39,0.04)] hover:border-[#c8906c] hover:bg-[#fff2e8]"}`;
          const content = <>
            <SidebarIllustration kind={item.id} className={`h-14 w-14 shrink-0 ${active ? "text-[#9d451d]" : "text-[#b65b2e]"}`} />
            <span className="min-w-0 flex-1">{item.label}</span>
            {item.plus && <span className="rounded-md bg-[#dce6c5] px-1.5 py-1 text-[10px] font-semibold leading-none text-[#40502d]">PLUS</span>}
          </>;
          return <Fragment key={item.id}>
            {item.separator && <li role="separator" aria-hidden="true" data-sidebar-separator={item.id} className="my-1 h-[3px] bg-[radial-gradient(circle,#d7a080_1.3px,transparent_1.5px)] bg-[length:9px_3px] bg-repeat-x" />}
            <li>
              {item.href ? <Link href={item.href} className={classes} onClick={(event) => {
                onNavigate(item.href!);
                const hashAt = item.href!.indexOf("#");
                const path = (hashAt >= 0 ? item.href!.slice(0, hashAt) : item.href!) || "/";
                if (path !== window.location.pathname) return;
                event.preventDefault();
                const id = hashAt >= 0 ? item.href!.slice(hashAt + 1) : "";
                const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
                if (id) document.getElementById(id)?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
                else window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
                const next = `${path}${id ? `#${id}` : ""}`;
                if (`${window.location.pathname}${window.location.hash}` !== next) {
                  window.history.pushState(null, "", next);
                  window.dispatchEvent(new HashChangeEvent("hashchange"));
                }
              }} aria-current={active ? "page" : undefined}>
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