import {
  SHEET_EDIT_FIELDS,
  SHEET_PAGE,
  fontSizeHint,
  type SheetEditField,
  type SheetLayout,
} from "@/lib/resource/sheet-base";

/**
 * Approximate Letter layout when no measured JSON / live capture is available.
 * Coordinates match the GospelSheet CSS structure closely enough for Plus editing.
 */
export function fallbackSheetLayout(key: string, level: 1 | 2, rev: string): SheetLayout {
  const margin = 48; // ~0.5in
  const contentW = SHEET_PAGE.width - margin * 2;
  const boxes: SheetLayout["boxes"] = [];

  const push = (
    id: SheetEditField,
    top: number,
    height: number,
    width = contentW,
    left = margin,
  ) => {
    boxes.push({
      id,
      left,
      top,
      width,
      height,
      fontSize: fontSizeHint(level, id),
    });
  };

  // Header title under liturgical chrome
  push("title", 72, 36);
  // Story block
  push("story", 160, level === 1 ? 110 : 130);
  // Key line
  push("keyLine", level === 1 ? 300 : 320, level === 1 ? 48 : 40);
  // Activity eats the middle — questions/actions sit lower
  const talkTop = 720;
  push("q0", talkTop, 28);
  push("q1", talkTop + 32, 28);
  push("action0", talkTop + 90, 26);
  push("action1", talkTop + 118, 26);
  push("action2", talkTop + 146, 26);
  push("prayer", 940, 48);

  // Keep only fields we defined (all SHEET_EDIT_FIELDS covered)
  void SHEET_EDIT_FIELDS;

  return {
    v: 1,
    key,
    level,
    paper: "letter",
    rev,
    page: { width: SHEET_PAGE.width, height: SHEET_PAGE.height },
    boxes,
  };
}

/** Solid white Letter PNG (1×1 stretched by Fabric via scale) — last-resort background. */
export function whiteLetterPngDataUrl(): string {
  // Minimal 1x1 white PNG
  return "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO5W2X8AAAAASUVORK5CYII=";
}
