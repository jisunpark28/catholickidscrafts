import { HUB_PILL_CONTAINER_STYLE } from "@/lib/hub-pill-style";
import type { CSSProperties, ReactNode } from "react";

type Props = {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
};

/** Non-button blocks aligned to hub pill width (notices, typing sections). */
export function HubPillWidth({ children, className = "", style }: Props) {
  return (
    <div style={{ ...HUB_PILL_CONTAINER_STYLE, ...style }} className={className}>
      {children}
    </div>
  );
}
