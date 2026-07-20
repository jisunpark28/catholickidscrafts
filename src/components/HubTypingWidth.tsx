import {
  HUB_TYPING_CONTAINER_STYLE,
  HUB_TYPING_PANEL_STYLE,
} from "@/lib/hub-pill-style";
import type { CSSProperties, ReactNode } from "react";

type Props = {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  /** Full typing table width (144rem max). Default is narrower hub width (56rem). */
  wide?: boolean;
};

export function HubTypingWidth({ children, className = "", style, wide = false }: Props) {
  const base = wide ? HUB_TYPING_PANEL_STYLE : HUB_TYPING_CONTAINER_STYLE;
  return (
    <div style={{ ...base, ...style }} className={className}>
      {children}
    </div>
  );
}
