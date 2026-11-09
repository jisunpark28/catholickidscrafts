import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
  className?: string;
  id?: string;
};

/**
 * Cream rounded content panel for sidebar pages.
 * Sits on the white HomePdfShell content area (rounded-[24px] bg #fff3e6).
 * On small screens, slight negative horizontal margin offsets shell px-3 padding.
 */
export function SidebarPagePanel({ children, className = "", id }: Props) {
  return (
    <div
      id={id}
      className={`sidebar-page-panel -mx-1 rounded-2xl bg-cream p-3 sm:mx-0 sm:rounded-[24px] sm:p-6 lg:p-8${className ? ` ${className}` : ""}`}
    >
      {children}
    </div>
  );
}