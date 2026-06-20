import { HUB_TYPING_CONTAINER_STYLE } from "@/lib/hub-pill-style";
import type { CSSProperties, ReactNode } from "react";

type Props = {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
};

/** Typing panels — 2× hub pill width (56rem). */
export function HubTypingWidth({ children, className = "", style }: Props) {
  return (
    <div style={{ ...HUB_TYPING_CONTAINER_STYLE, ...style }} className={className}>
      {children}
    </div>
  );
}
