import type { CSSProperties } from "react";

/**
 * Fixed hub pill width — original Daily Mass cap (max-w-md = 28rem).
 * Inline styles only — works inside flex parents (items-center breaks % width).
 */
export const HUB_PILL_STYLE: CSSProperties = {
  display: "flex",
  width: "28rem",
  maxWidth: "100%",
  minWidth: "9rem",
  marginLeft: "auto",
  marginRight: "auto",
  boxSizing: "border-box",
  flexShrink: 0,
};

export const HUB_PILL_CONTAINER_STYLE: CSSProperties = {
  width: "28rem",
  maxWidth: "100%",
  minWidth: "9rem",
  marginLeft: "auto",
  marginRight: "auto",
  boxSizing: "border-box",
};
