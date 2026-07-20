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

/** Typing panels — 2× hub pill width (base). */
export const HUB_TYPING_CONTAINER_STYLE: CSSProperties = {
  width: "56rem",
  maxWidth: "100%",
  minWidth: "9rem",
  marginLeft: "auto",
  marginRight: "auto",
  boxSizing: "border-box",
};

/** Gospel / Bible typing table — 2× former 72rem cap (144rem). */
export const HUB_TYPING_MAX_WIDTH = "min(144rem, 100%)";

export const HUB_TYPING_PANEL_STYLE: CSSProperties = {
  ...HUB_TYPING_CONTAINER_STYLE,
  width: "100%",
  maxWidth: HUB_TYPING_MAX_WIDTH,
};
