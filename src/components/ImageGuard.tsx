"use client";

import { useEffect } from "react";

/** Pictures only: text, links, inputs and editor controls keep their normal menu. */
const IMAGE_SELECTOR = "img, picture, canvas, svg image, [data-image-preview]";

/** Elements the visitor types into or edits keep the browser menu even when an image is inside. */
const EDITABLE_SELECTOR = "input, textarea, select, [contenteditable]:not([contenteditable='false'])";

function isProtectedImage(target: EventTarget | null): boolean {
  if (!(target instanceof Element)) return false;
  if (target.closest(EDITABLE_SELECTOR)) return false;
  return Boolean(target.closest(IMAGE_SELECTOR));
}

/**
 * Site-wide: no right-click "Save image" / "Copy image" menu and no dragging pictures out of the
 * page (see globals.css for the long-press and drag styles). A light deterrent only: screenshots,
 * devtools and the network tab cannot be blocked. Renders nothing.
 */
export function ImageGuard() {
  useEffect(() => {
    const block = (e: Event) => {
      if (isProtectedImage(e.target)) e.preventDefault();
    };
    document.addEventListener("contextmenu", block);
    document.addEventListener("dragstart", block);
    return () => {
      document.removeEventListener("contextmenu", block);
      document.removeEventListener("dragstart", block);
    };
  }, []);
  return null;
}
