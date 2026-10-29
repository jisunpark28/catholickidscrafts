"use client";

import {
  collectEditableTextFields,
  collectSheetChrome,
  measureSheetSectionBoxes,
  snapshotSheetUnderlay,
  type MeasuredTextField,
} from "@/components/resource/captureSheetBase";
import { GospelSheet } from "@/components/gospel-sheet/GospelSheet";
import { GOSPEL_SHEET_CSS } from "@/components/gospel-sheet/sheet-styles";
import {
  EDITOR_FONTS,
  EDITOR_STICKERS,
  type CustomSheetData,
  type EditorFontId,
} from "@/lib/resource/custom-sheet-data";
import { composeSheetCanvas, downloadSheetPdf, downloadSheetPng } from "@/lib/resource/export-sheet-pdf";
import { loadEditorFonts } from "@/lib/resource/load-editor-fonts";
import { prepareSheetPhotoUpload } from "@/lib/resource/resize-photo";
import {
  defaultTextForField,
  type SheetLayout,
  SHEET_PAGE,
} from "@/lib/resource/sheet-base";
import { toGospelSheetView, type SundaySheetContent } from "@/lib/sunday-sheet-content";
import {
  Canvas,
  Circle,
  Ellipse,
  FabricImage,
  Line,
  Rect,
  Textbox,
  type FabricObject,
} from "fabric";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

type Props = {
  sheet: SundaySheetContent;
  level: 1 | 2;
  layout: SheetLayout;
  /** Static base PNG URL, or null when a live HTML GospelSheet underlay is used. */
  basePngUrl: string | null;
  baseRev: string;
  isPlus: boolean;
  initialCustomId?: string | null;
  /** Render GospelSheet(variant=base) under a transparent Fabric canvas. */
  liveHtmlBase?: boolean;
  /** Header label on the base sheet (e.g. "Year A"); never the internal sheet key. */
  sundayLabel?: string;
};

type SheetPhotoItem = { id: string; url: string; width: number | null; height: number | null; sizeBytes: number };
type LayerItem = { index: number; label: string; active: boolean };

const FAMILY_PHOTO_QUOTA_MB = 200;

/** Original sheet typography (`.gs` in sheet-styles) for layout-seeded boxes. */
const SHEET_FONT_STACK = '"Comic Sans MS", "Chalkboard SE", "Trebuchet MS", sans-serif';

function layerLabel(o: FabricObject): string {
  const m = metaOf(o);
  const snippet = o instanceof Textbox ? (o.text ?? "").replace(/\s+/g, " ").trim().slice(0, 28) : "";
  if (m.stickerId) return `Sticker · ${m.stickerId}`;
  if (m.kind === "base-edit") return `Sheet text · ${snippet || m.fieldId || ""}`;
  if (m.baseSectionId || o.type === "rect") return "Section box";
  if (m.chromeKind === "writeline") return "Write line";
  if (m.chromeKind === "checkbox") return "Checkbox";
  if (o.type === "image") return "Photo";
  if (o instanceof Textbox) return `Text · ${snippet || "(empty)"}`;
  return o.type ? o.type[0]!.toUpperCase() + o.type.slice(1) : "Object";
}

/** Fabric Textbox props that reproduce the original sheet typography. */
function textStyleProps(f: MeasuredTextField) {
  return {
    fontFamily: f.style.fontFamily,
    fontWeight: f.style.fontWeight,
    fontStyle: f.style.fontStyle,
    fill: f.style.fill,
    stroke: f.style.stroke ?? null,
    strokeWidth: f.style.strokeWidth ?? 1,
    textAlign: f.style.textAlign,
    lineHeight: f.style.lineHeight,
    charSpacing: f.style.charSpacing,
  };
}

function textSig(tb: Textbox): string {
  return JSON.stringify([
    tb.text ?? "",
    String(tb.fontFamily ?? ""),
    Number(tb.fontSize ?? 0),
    String(tb.fill ?? ""),
    String(tb.fontWeight ?? ""),
    String(tb.fontStyle ?? ""),
    Boolean(tb.underline),
  ]);
}

function isEditorFont(v: unknown): v is EditorFontId {
  return EDITOR_FONTS.some((f) => f.id === v);
}

/** Server re-check before export (the canvas lives in the browser, so this is a deterrent, not DRM). */
async function confirmPlusOnServer(): Promise<boolean> {
  try {
    const res = await fetch("/api/resource/entitlement", { cache: "no-store" });
    if (!res.ok) return false;
    const json = (await res.json()) as { isPlus?: boolean };
    return json.isPlus === true;
  } catch {
    return false;
  }
}

type ObjMeta = {
  kind: "base-edit" | "user";
  /** Core field id (`title`) or live DOM id (`actTitle`, `auto_3`, …). */
  fieldId?: string;
  stickerId?: string;
  photoId?: string;
  id?: string;
  /** Fabric section frame matching printable `.gs-box` chrome. */
  section?: boolean;
  /** When set, this Rect replaced a locked HTML `.gs-box` (`bs_0` …). */
  baseSectionId?: string;
  /** Promoted write-line / checkbox from base HTML (`wl_0`, `chk_0`). */
  baseChromeId?: string;
  chromeKind?: "writeline" | "checkbox";
  /** Base textbox already carries the measured sheet typography. */
  styled?: boolean;
  /** Text + style signature of the untouched original; unchanged fields are not saved as edits. */
  origSig?: string;
};

/** Content width inside letter margins (~0.5in pad each side on 8.5in). */
const SECTION_BOX_W = 700;
const SECTION_BOX_H = 110;
const SECTION_RX = 12;

function metaOf(obj: FabricObject): ObjMeta {
  return ((obj as FabricObject & { data?: ObjMeta }).data ?? { kind: "user" }) as ObjMeta;
}

function setMeta(obj: FabricObject, data: ObjMeta) {
  (obj as FabricObject & { data?: ObjMeta }).data = data;
}

function uid() {
  return `o_${Math.random().toString(36).slice(2, 10)}`;
}

const toolBtn =
  "rounded-lg border border-[#e7e3de] bg-white px-2.5 py-1.5 text-sm font-medium text-[#1c1c1c] hover:bg-[#fffdfb] disabled:opacity-40";
const toolBtnOn = "border-[#d35400] bg-[#fff6ef] text-[#d35400]";
/** Snapshots kept for Undo (includes current → ~10 steps back). */
const HISTORY_MAX = 11;

export function SheetFabricEditor({
  sheet,
  level,
  layout,
  basePngUrl,
  baseRev,
  isPlus,
  initialCustomId = null,
  liveHtmlBase = false,
  sundayLabel = "",
}: Props) {
  const liveHostRef = useRef<HTMLDivElement>(null);
  const canvasEl = useRef<HTMLCanvasElement>(null);
  const fabricRef = useRef<Canvas | null>(null);
  const undoRef = useRef<string[]>([]);
  const redoRef = useRef<string[]>([]);
  const applyingRef = useRef(false);
  const refreshLayersRef = useRef<() => void>(() => undefined);
  const pushUndoRef = useRef<() => void>(() => undefined);
  const hiddenBaseSectionsRef = useRef<string[]>([]);
  /** Deleted base text field ids + chrome ids (`wl_0`, `chk_0`) — do not re-install. */
  const hiddenFieldsRef = useRef<string[]>([]);
  const promoteBaseSectionsRef = useRef<() => void>(() => undefined);
  const installLiveTextRef = useRef<() => void>(() => undefined);
  const installLiveChromeRef = useRef<() => void>(() => undefined);
  const removeActiveRef = useRef<() => void>(() => undefined);

  const [ready, setReady] = useState(false);
  const [fontFamily, setFontFamily] = useState<EditorFontId>("Fredoka");
  const [fontSize, setFontSize] = useState(18);
  const [fill, setFill] = useState("#d35400");
  const [bold, setBold] = useState(false);
  const [italic, setItalic] = useState(false);
  const [underline, setUnderline] = useState(false);
  const [selectedLabel, setSelectedLabel] = useState<string>("");
  const [name, setName] = useState(
    `${(level === 2 ? sheet.levels.level2 : sheet.levels.level1).title} — my sheet`,
  );
  const [customId, setCustomId] = useState<string | null>(initialCustomId);
  const [status, setStatus] = useState("");
  const [saving, setSaving] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const [layers, setLayers] = useState<LayerItem[]>([]);
  const [photos, setPhotos] = useState<SheetPhotoItem[]>([]);
  const [photoBytes, setPhotoBytes] = useState(0);
  /** Saved sheet whose base rev differs from the current original (design §3 rev prompt). */
  const [revPrompt, setRevPrompt] = useState<CustomSheetData | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const syncHistoryButtons = () => {
    setCanUndo(undoRef.current.length >= 2);
    setCanRedo(redoRef.current.length >= 1);
  };

  /** Sync toolbar fields from the active Fabric selection. */
  const refreshLayers = () => {
    const c = fabricRef.current;
    if (!c) return;
    const active = c.getActiveObject();
    if (active) {
      const m = metaOf(active);
      setSelectedLabel(m.fieldId ?? m.stickerId ?? active.type ?? "");
      if (active instanceof Textbox) {
        // Base text keeps the sheet's own font stack; only sync the picker for editor fonts.
        if (isEditorFont(active.fontFamily)) setFontFamily(active.fontFamily);
        setFontSize(Number(active.fontSize) || 18);
        setFill(String(active.fill || "#111"));
        setBold(active.fontWeight === "bold" || active.fontWeight === 700);
        setItalic(active.fontStyle === "italic");
        setUnderline(Boolean(active.underline));
      }
    } else setSelectedLabel("");
    const objs = c.getObjects();
    setLayers(
      objs
        .map((o, index) => ({ index, label: layerLabel(o), active: o === active }))
        .reverse(),
    );
  };
  refreshLayersRef.current = refreshLayers;

  /** Accessible stack order: top of the list = front. */
  const moveLayer = (index: number, dir: "forward" | "backward") => {
    const c = fabricRef.current;
    const obj = c?.getObjects()[index];
    if (!c || !obj || !isPlus) return;
    pushUndo();
    if (dir === "forward") c.bringObjectForward(obj);
    else c.sendObjectBackwards(obj);
    c.requestRenderAll();
    refreshLayers();
  };

  const selectLayer = (index: number) => {
    const c = fabricRef.current;
    const obj = c?.getObjects()[index];
    if (!c || !obj || !isPlus) return;
    c.setActiveObject(obj);
    c.requestRenderAll();
    refreshLayers();
  };

  const pushUndo = () => {
    const c = fabricRef.current;
    if (!c || applyingRef.current) return;
    // Include ObjMeta (`data`) so undo/redo keeps base-edit kind/fieldId.
    const json = JSON.stringify(c.toObject(["data"]));
    undoRef.current.push(json);
    while (undoRef.current.length > HISTORY_MAX) undoRef.current.shift();
    redoRef.current = [];
    syncHistoryButtons();
  };
  pushUndoRef.current = pushUndo;

  const buildDiff = (): CustomSheetData => {
    const c = fabricRef.current!;
    const edits: CustomSheetData["edits"] = {};
    const objects: CustomSheetData["objects"] = [];
    for (const obj of c.getObjects()) {
      const m = metaOf(obj);
      if (m.kind === "base-edit" && m.fieldId && obj instanceof Textbox) {
        if (m.origSig && m.origSig === textSig(obj)) continue;
        edits[m.fieldId] = {
          text: obj.text ?? "",
          fontFamily: String(obj.fontFamily ?? "Fredoka"),
          fontSize: Number(obj.fontSize ?? 16),
          fill: String(obj.fill ?? "#111"),
          fontWeight: String(obj.fontWeight ?? "normal"),
          fontStyle: String(obj.fontStyle ?? "normal"),
          underline: Boolean(obj.underline),
        };
      } else if (m.kind === "user") {
        if (obj instanceof Textbox && m.stickerId) {
          objects.push({
            id: m.id ?? uid(),
            type: "sticker",
            stickerId: m.stickerId,
            left: obj.left ?? 0,
            top: obj.top ?? 0,
            scaleX: obj.scaleX ?? 1,
            scaleY: obj.scaleY ?? 1,
            angle: obj.angle ?? 0,
            text: obj.text ?? "",
            fontSize: Number(obj.fontSize ?? 36),
            opacity: obj.opacity ?? 1,
          });
        } else if (obj instanceof Textbox) {
          objects.push({
            id: m.id ?? uid(),
            type: "textbox",
            left: obj.left ?? 0,
            top: obj.top ?? 0,
            width: obj.width ?? 120,
            scaleX: obj.scaleX ?? 1,
            scaleY: obj.scaleY ?? 1,
            angle: obj.angle ?? 0,
            text: obj.text ?? "",
            fontFamily: String(obj.fontFamily ?? "Fredoka"),
            fontSize: Number(obj.fontSize ?? 18),
            fill: String(obj.fill ?? "#111"),
            opacity: obj.opacity ?? 1,
          });
        } else if (obj instanceof Rect) {
          objects.push({
            id: m.id ?? uid(),
            type: "rect",
            left: obj.left ?? 0,
            top: obj.top ?? 0,
            width: obj.width ?? 100,
            height: obj.height ?? 60,
            scaleX: obj.scaleX ?? 1,
            scaleY: obj.scaleY ?? 1,
            angle: obj.angle ?? 0,
            fill: String(obj.fill ?? "transparent"),
            stroke: String(obj.stroke ?? "#111"),
            strokeWidth: Number(obj.strokeWidth ?? 2),
            rx: Number(obj.rx ?? 0) || undefined,
            ry: Number(obj.ry ?? 0) || undefined,
            section: m.section || Boolean(m.baseSectionId) || undefined,
            baseSectionId: m.baseSectionId,
            baseChromeId: m.baseChromeId,
            chromeKind: m.chromeKind,
            opacity: obj.opacity ?? 1,
          });
        } else if (obj instanceof Circle) {
          objects.push({
            id: m.id ?? uid(),
            type: "circle",
            left: obj.left ?? 0,
            top: obj.top ?? 0,
            width: (obj.radius ?? 40) * 2,
            height: (obj.radius ?? 40) * 2,
            scaleX: obj.scaleX ?? 1,
            scaleY: obj.scaleY ?? 1,
            angle: obj.angle ?? 0,
            fill: String(obj.fill ?? "transparent"),
            stroke: String(obj.stroke ?? "#111"),
            opacity: obj.opacity ?? 1,
          });
        } else if (obj instanceof Ellipse) {
          objects.push({
            id: m.id ?? uid(),
            type: "ellipse",
            left: obj.left ?? 0,
            top: obj.top ?? 0,
            width: (obj.rx ?? 50) * 2,
            height: (obj.ry ?? 35) * 2,
            scaleX: obj.scaleX ?? 1,
            scaleY: obj.scaleY ?? 1,
            angle: obj.angle ?? 0,
            fill: String(obj.fill ?? "transparent"),
            stroke: String(obj.stroke ?? "#111"),
            opacity: obj.opacity ?? 1,
          });
        } else if (obj instanceof Line) {
          objects.push({
            id: m.id ?? uid(),
            type: "line",
            left: obj.left ?? 0,
            top: obj.top ?? 0,
            width: Math.abs((obj.x2 ?? 0) - (obj.x1 ?? 0)) || 100,
            height: Math.abs((obj.y2 ?? 0) - (obj.y1 ?? 0)) || 0,
            baseChromeId: m.baseChromeId,
            chromeKind: m.chromeKind,
            scaleX: obj.scaleX ?? 1,
            scaleY: obj.scaleY ?? 1,
            angle: obj.angle ?? 0,
            stroke: String(obj.stroke ?? "#111"),
            strokeWidth: Number(obj.strokeWidth ?? 3),
            opacity: obj.opacity ?? 1,
          });
        } else if (obj instanceof FabricImage) {
          const src = String(obj.getSrc() || "");
          if (src) {
            objects.push({
              id: m.id ?? uid(),
              type: "image",
              src,
              left: obj.left ?? 0,
              top: obj.top ?? 0,
              width: obj.width ?? 100,
              height: obj.height ?? 100,
              scaleX: obj.scaleX ?? 1,
              scaleY: obj.scaleY ?? 1,
              angle: obj.angle ?? 0,
              opacity: obj.opacity ?? 1,
            });
          }
        }
      }
    }
    return {
      v: 1,
      base: { key: sheet.key, level, paper: "letter", rev: baseRev },
      edits,
      hidden: [...hiddenFieldsRef.current],
      hiddenBaseSections: [...hiddenBaseSectionsRef.current],
      objects,
    };
  };

  useEffect(() => {
    let cancelled = false;
    let canvas: Canvas | null = null;

    (async () => {
      try {
        await loadEditorFonts();
      } catch (e) {
        console.warn("[SheetFabricEditor] fonts", e);
      }
      if (cancelled || !canvasEl.current) return;

      try {
        canvas = new Canvas(canvasEl.current, {
          width: SHEET_PAGE.width,
          height: SHEET_PAGE.height,
          backgroundColor: liveHtmlBase || !basePngUrl ? "transparent" : "#ffffff",
          preserveObjectStacking: true,
          selection: isPlus,
        });
        fabricRef.current = canvas;

        if (basePngUrl) {
          const bg = await FabricImage.fromURL(basePngUrl, { crossOrigin: "anonymous" });
          bg.set({
            selectable: false,
            evented: false,
            left: 0,
            top: 0,
            scaleX: SHEET_PAGE.width / (bg.width || SHEET_PAGE.width),
            scaleY: SHEET_PAGE.height / (bg.height || SHEET_PAGE.height),
          });
          canvas.backgroundImage = bg;
        }

        // Seed from layout JSON (core fields). Live HTML then measures/adds the rest.
        for (const box of layout.boxes) {
          const text = box.text || defaultTextForField(sheet, level, box.id);
          if (!text && liveHtmlBase) continue;
          const tb = new Textbox(text, {
            left: box.left,
            top: box.top,
            width: Math.max(40, box.width),
            fontSize: box.fontSize ?? 16,
            fontFamily: SHEET_FONT_STACK,
            fill: "#111111",
            editable: isPlus,
            selectable: isPlus,
            evented: isPlus,
          });
          setMeta(tb, { kind: "base-edit", fieldId: box.id, id: `base_${box.id}` });
          canvas.add(tb);
        }

        canvas.on("object:modified", () => {
          if (applyingRef.current) return;
          pushUndoRef.current();
          refreshLayersRef.current();
        });
        canvas.on("selection:created", () => refreshLayersRef.current());
        canvas.on("selection:updated", () => refreshLayersRef.current());
        canvas.on("selection:cleared", () => refreshLayersRef.current());
        canvas.on("object:added", () => {
          if (!applyingRef.current) refreshLayersRef.current();
        });
        canvas.on("object:removed", () => {
          if (!applyingRef.current) refreshLayersRef.current();
        });

        canvas.requestRenderAll();
        if (!cancelled) {
          if (liveHtmlBase && isPlus) {
            const finishLive = (attempt: number) => {
                if (cancelled) return;
                installLiveTextRef.current();
                installLiveChromeRef.current();
                promoteBaseSectionsRef.current();
              const ids = new Set(
                fabricRef.current
                  ?.getObjects()
                  .map((o) => metaOf(o).fieldId)
                  .filter(Boolean),
              );
              // Wait until chrome/activity fields appear (not only layout seed).
              const rich =
                ids.has("subtitle") ||
                ids.has("actTitle") ||
                ids.has("h2_story") ||
                ids.has("footer") ||
                [...ids].some((id) => /^[ts]_/.test(String(id)));
              if (!rich && attempt < 10) {
                window.setTimeout(() => finishLive(attempt + 1), 50 + attempt * 40);
                return;
              }
              pushUndoRef.current();
              refreshLayersRef.current();
              setReady(true);
            };
            requestAnimationFrame(() => {
              requestAnimationFrame(() => finishLive(0));
            });
          } else {
            pushUndoRef.current();
            refreshLayersRef.current();
            setReady(true);
          }
        }
      } catch (e) {
        console.error("[SheetFabricEditor]", e);
        if (!cancelled) setStatus("Could not start editor");
      }
    })();

    return () => {
      cancelled = true;
      try {
        canvas?.dispose();
      } catch {
        /* ignore */
      }
      fabricRef.current = null;
      hiddenBaseSectionsRef.current = [];
      hiddenFieldsRef.current = [];
    };
    // layout.boxes identity changes often; key off rev + count
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [basePngUrl, baseRev, isPlus, level, sheet.key, liveHtmlBase, layout.boxes.length]);

  /**
   * Measure every visible text node on the live GospelSheet underlay and install
   * (or reposition) Fabric Textboxes so headers, activity copy, and chrome are editable.
   */
  const installLiveTextFields = () => {
    if (!liveHtmlBase || !isPlus) return;
    const c = fabricRef.current;
    const host = liveHostRef.current;
    const page = host?.querySelector("[data-sheet-page]") as HTMLElement | null;
    if (!c || !host || !page) return;
    const pageBox = page.getBoundingClientRect();
    if (pageBox.width < 40 || pageBox.height < 40) return;

    const fields = collectEditableTextFields(page, level, host);
    if (!fields.length) return;
    const hidden = new Set(hiddenFieldsRef.current);

    applyingRef.current = true;
    try {
      const existing = new Map<string, Textbox>();
      for (const obj of c.getObjects()) {
        const m = metaOf(obj);
        if (m.kind === "base-edit" && m.fieldId && obj instanceof Textbox) {
          existing.set(m.fieldId, obj);
        }
      }

      for (const [id, tb] of [...existing]) {
        if (hidden.has(id)) {
          c.remove(tb);
          existing.delete(id);
        }
      }

      for (const f of fields) {
        if (hidden.has(f.id)) continue;
        const prev = existing.get(f.id);
        if (prev) {
          const keepText =
            Boolean(prev.text) && prev.text !== f.text && prev.text !== defaultTextForField(sheet, level, f.id);
          const pm = metaOf(prev);
          prev.set({
            left: f.left,
            top: f.top,
            width: Math.max(40, f.width),
            fontSize: pm.styled ? prev.fontSize : f.fontSize,
            text: keepText ? prev.text : f.text,
            // Seeded layout boxes get the measured typography once; later re-measures keep user styling.
            ...(pm.styled ? {} : textStyleProps(f)),
            selectable: true,
            evented: true,
            editable: true,
          });
          setMeta(prev, { ...pm, styled: true, origSig: pm.styled && pm.origSig ? pm.origSig : textSig(prev) });
          existing.delete(f.id);
          continue;
        }
        const tb = new Textbox(f.text, {
          left: f.left,
          top: f.top,
          width: Math.max(40, f.width),
          fontSize: f.fontSize,
          ...textStyleProps(f),
          editable: true,
          selectable: true,
          evented: true,
        });
        setMeta(tb, { kind: "base-edit", fieldId: f.id, id: `base_${f.id}`, styled: true, origSig: textSig(tb) });
        c.add(tb);
      }

      // Keep layout-only fields that DOM didn't re-measure (still useful).
      // Only drop ones that were clearly replaced by a measured id already handled.
    } finally {
      applyingRef.current = false;
    }

    c.requestRenderAll();
    refreshLayers();
  };
  installLiveTextRef.current = installLiveTextFields;

  /** Promote dotted write-lines and checklist boxes from the live underlay. */
  const installLiveChrome = () => {
    if (!liveHtmlBase || !isPlus) return;
    const c = fabricRef.current;
    const host = liveHostRef.current;
    const page = host?.querySelector("[data-sheet-page]") as HTMLElement | null;
    const root = host?.querySelector(".gs") as HTMLElement | null;
    if (!c || !host || !page || !root) return;

    root.classList.add("gs-edit-chrome");
    const measured = collectSheetChrome(page, host);
    const hidden = new Set(hiddenFieldsRef.current);
    const existing = new Set(
      c
        .getObjects()
        .map((o) => metaOf(o).baseChromeId)
        .filter((id): id is string => Boolean(id)),
    );

    applyingRef.current = true;
    try {
      let added = 0;
      for (const ch of measured) {
        if (hidden.has(ch.id) || existing.has(ch.id)) continue;
        if (ch.kind === "writeline") {
          const ln = new Line([0, 0, Math.max(24, ch.width), 0], {
            left: ch.left,
            top: ch.top,
            stroke: "#777777",
            strokeWidth: 2,
            strokeDashArray: [2, 4],
            objectCaching: false,
            // Easier hit target than a 2px stroke.
            padding: 10,
          });
          setMeta(ln, {
            kind: "user",
            id: `chrome_${ch.id}`,
            baseChromeId: ch.id,
            chromeKind: "writeline",
          });
          c.add(ln);
          added += 1;
        } else {
          const box = new Rect({
            left: ch.left,
            top: ch.top,
            width: Math.max(12, ch.width),
            height: Math.max(12, ch.height),
            fill: "rgba(255,255,255,0.01)",
            stroke: "#111111",
            strokeWidth: 2,
            rx: 3,
            ry: 3,
            objectCaching: false,
            padding: 4,
          });
          setMeta(box, {
            kind: "user",
            id: `chrome_${ch.id}`,
            baseChromeId: ch.id,
            chromeKind: "checkbox",
          });
          c.add(box);
          added += 1;
        }
      }
      if (added) {
        c.requestRenderAll();
        refreshLayers();
      }
    } finally {
      applyingRef.current = false;
    }
  };
  installLiveChromeRef.current = installLiveChrome;

  /**
   * Hide HTML `.gs-box` borders and ensure each visible base section has a Fabric Rect
   * (unless the user deleted it — tracked in hiddenBaseSections).
   */
  const promoteBaseSections = () => {
    if (!liveHtmlBase || !isPlus) return;
    const c = fabricRef.current;
    const host = liveHostRef.current;
    const page = host?.querySelector("[data-sheet-page]") as HTMLElement | null;
    const root = host?.querySelector(".gs") as HTMLElement | null;
    if (!c || !page || !root) return;

    root.classList.add("gs-edit-sections");
    const measured = measureSheetSectionBoxes(page, host);
    const existing = new Set(
      c
        .getObjects()
        .map((o) => metaOf(o).baseSectionId)
        .filter((id): id is string => Boolean(id)),
    );
    const hidden = new Set(hiddenBaseSectionsRef.current);
    let added = 0;
    for (const s of measured) {
      if (hidden.has(s.id) || existing.has(s.id)) continue;
      const obj = new Rect({
        left: s.left,
        top: s.top,
        width: s.width,
        height: s.height,
        fill: "transparent",
        stroke: "#111111",
        strokeWidth: 2,
        rx: SECTION_RX,
        ry: SECTION_RX,
        objectCaching: false,
      });
      setMeta(obj, {
        kind: "user",
        id: `base_sec_${s.id}`,
        section: true,
        baseSectionId: s.id,
      });
      c.add(obj);
      c.sendObjectToBack(obj);
      added += 1;
    }
    if (added) {
      c.requestRenderAll();
      refreshLayers();
    }
  };
  promoteBaseSectionsRef.current = promoteBaseSections;

  /** Apply a saved CustomSheet diff onto the live canvas (base textboxes + user objects). */
  const applyCustomData = async (data: CustomSheetData, opts: { applyEdits?: boolean } = {}) => {
    const c = fabricRef.current;
    if (!c) return { unmatched: 0 };
    const applyEdits = opts.applyEdits ?? true;
    const matched = new Set<string>();
    applyingRef.current = true;
    hiddenBaseSectionsRef.current = [...(data.hiddenBaseSections ?? [])];
    hiddenFieldsRef.current = [...(data.hidden ?? [])];
    try {
      if (liveHtmlBase) {
        installLiveTextFields();
        installLiveChrome();
      }

      for (const obj of [...c.getObjects()]) {
        const m = metaOf(obj);
        if (m.kind === "base-edit" && m.fieldId && obj instanceof Textbox) {
          if (hiddenFieldsRef.current.includes(m.fieldId)) {
            c.remove(obj);
            continue;
          }
          const edit = applyEdits ? data.edits[m.fieldId] : undefined;
          if (!edit) continue;
          matched.add(m.fieldId);
          obj.set({
            text: edit.text,
            fontFamily: edit.fontFamily ?? obj.fontFamily,
            fontSize: edit.fontSize ?? obj.fontSize,
            fill: edit.fill ?? obj.fill,
            fontWeight: edit.fontWeight ?? obj.fontWeight,
            fontStyle: edit.fontStyle ?? obj.fontStyle,
            underline: edit.underline ?? obj.underline,
          });
        } else if (m.kind === "user") {
          c.remove(obj);
        }
      }

      for (const o of data.objects) {
        if (o.type === "textbox" || o.type === "sticker") {
          const tb = new Textbox(o.text ?? (o.type === "sticker" ? "⭐" : "Text"), {
            left: o.left,
            top: o.top,
            width: o.width ?? 160,
            scaleX: o.scaleX ?? 1,
            scaleY: o.scaleY ?? 1,
            angle: o.angle ?? 0,
            fontFamily: o.fontFamily ?? "Fredoka",
            fontSize: o.fontSize ?? (o.type === "sticker" ? 42 : 18),
            fill: o.fill ?? "#111",
            opacity: o.opacity ?? 1,
            editable: o.type !== "sticker" && isPlus,
          });
          setMeta(tb, {
            kind: "user",
            id: o.id,
            stickerId: o.type === "sticker" ? o.stickerId : undefined,
          });
          c.add(tb);
        } else if (o.type === "rect") {
          const r = new Rect({
            left: o.left,
            top: o.top,
            width: o.width ?? 120,
            height: o.height ?? 80,
            scaleX: o.scaleX ?? 1,
            scaleY: o.scaleY ?? 1,
            angle: o.angle ?? 0,
            fill: o.fill ?? "transparent",
            stroke: o.stroke ?? "#111",
            strokeWidth: o.strokeWidth ?? 2,
            rx: o.rx ?? 0,
            ry: o.ry ?? o.rx ?? 0,
            opacity: o.opacity ?? 1,
          });
          setMeta(r, {
            kind: "user",
            id: o.id,
            section: o.section || Boolean(o.baseSectionId),
            baseSectionId: o.baseSectionId,
            baseChromeId: o.baseChromeId,
            chromeKind: o.chromeKind,
          });
          c.add(r);
          if (o.baseSectionId || o.section) c.sendObjectToBack(r);
        } else if (o.type === "circle") {
          const cir = new Circle({
            left: o.left,
            top: o.top,
            radius: (o.width ?? 80) / 2,
            scaleX: o.scaleX ?? 1,
            scaleY: o.scaleY ?? 1,
            angle: o.angle ?? 0,
            fill: o.fill ?? "transparent",
            stroke: o.stroke ?? "#111",
            strokeWidth: o.strokeWidth ?? 3,
            opacity: o.opacity ?? 1,
          });
          setMeta(cir, { kind: "user", id: o.id });
          c.add(cir);
        } else if (o.type === "ellipse") {
          const el = new Ellipse({
            left: o.left,
            top: o.top,
            rx: (o.width ?? 100) / 2,
            ry: (o.height ?? 60) / 2,
            scaleX: o.scaleX ?? 1,
            scaleY: o.scaleY ?? 1,
            angle: o.angle ?? 0,
            fill: o.fill ?? "transparent",
            stroke: o.stroke ?? "#111",
            strokeWidth: o.strokeWidth ?? 3,
            opacity: o.opacity ?? 1,
          });
          setMeta(el, { kind: "user", id: o.id });
          c.add(el);
        } else if (o.type === "line") {
          const ln = new Line([0, 0, o.width ?? 120, 0], {
            left: o.left,
            top: o.top,
            scaleX: o.scaleX ?? 1,
            scaleY: o.scaleY ?? 1,
            angle: o.angle ?? 0,
            stroke: o.stroke ?? "#111",
            strokeWidth: o.strokeWidth ?? 4,
            strokeDashArray: o.chromeKind === "writeline" ? [2, 4] : undefined,
            opacity: o.opacity ?? 1,
          });
          setMeta(ln, {
            kind: "user",
            id: o.id,
            baseChromeId: o.baseChromeId,
            chromeKind: o.chromeKind,
          });
          c.add(ln);
        } else if (o.type === "image" && o.src) {
          try {
            const img = await FabricImage.fromURL(o.src, { crossOrigin: "anonymous" });
            img.set({
              left: o.left,
              top: o.top,
              scaleX: o.scaleX ?? 1,
              scaleY: o.scaleY ?? 1,
              angle: o.angle ?? 0,
              opacity: o.opacity ?? 1,
            });
            setMeta(img, { kind: "user", id: o.id });
            c.add(img);
          } catch (e) {
            console.warn("[SheetFabricEditor] image restore failed", e);
          }
        }
      }
      c.requestRenderAll();
      refreshLayersRef.current();
      if (liveHtmlBase) {
        installLiveChrome();
        promoteBaseSections();
      }
    } finally {
      applyingRef.current = false;
    }
    const unmatched = applyEdits ? Object.keys(data.edits).filter((k) => !matched.has(k)).length : 0;
    return { unmatched };
  };

  useEffect(() => {
    if (!ready || !initialCustomId || !isPlus) return;
    let cancelled = false;
    (async () => {
      setStatus("Loading saved sheet…");
      try {
        const res = await fetch(`/api/resource/custom-sheets/${initialCustomId}`);
        const json = await res.json().catch(() => ({}));
        if (cancelled) return;
        if (!res.ok) {
          setStatus(json.error ?? "Could not load saved sheet");
          return;
        }
        const row = json.sheet as { name?: string; data?: CustomSheetData } | undefined;
        if (!row?.data) {
          setStatus("Saved sheet had no data");
          return;
        }
        setCustomId(initialCustomId);
        if (row.name) setName(row.name);
        const label = row.name ?? "custom sheet";
        if (row.data.base.rev !== baseRev && Object.keys(row.data.edits).length > 0) {
          // Original sheet changed since saving: keep user objects, ask about edited text.
          await applyCustomData(row.data, { applyEdits: false });
          if (cancelled) return;
          setRevPrompt(row.data);
          setStatus(`Loaded “${label}” — the original sheet was updated since you saved it.`);
          return;
        }
        const { unmatched } = await applyCustomData(row.data);
        if (!cancelled) {
          setStatus(
            unmatched
              ? `Loaded “${label}” · ${unmatched} saved text edit${unmatched === 1 ? "" : "s"} no longer match the sheet`
              : `Loaded “${label}”`,
          );
        }
      } catch {
        if (!cancelled) setStatus("Could not load saved sheet");
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, initialCustomId, isPlus]);

  const applyStyleToActive = () => {
    const c = fabricRef.current;
    const obj = c?.getActiveObject();
    if (!c || !(obj instanceof Textbox) || !isPlus) return;
    pushUndo();
    obj.set({
      fontFamily,
      fontSize,
      fill,
      fontWeight: bold ? "bold" : "normal",
      fontStyle: italic ? "italic" : "normal",
      underline,
    });
    c.requestRenderAll();
    refreshLayers();
  };

  const addText = () => {
    const c = fabricRef.current;
    if (!c || !isPlus) return;
    pushUndo();
    const tb = new Textbox("New text", {
      left: 120,
      top: 160,
      width: 220,
      fontSize,
      fontFamily,
      fill,
      fontWeight: bold ? "bold" : "normal",
      fontStyle: italic ? "italic" : "normal",
      underline,
    });
    setMeta(tb, { kind: "user", id: uid() });
    c.add(tb);
    c.setActiveObject(tb);
    c.requestRenderAll();
  };

  const addSticker = (stickerId: string, emoji: string) => {
    const c = fabricRef.current;
    if (!c || !isPlus) return;
    pushUndo();
    const tb = new Textbox(emoji, {
      left: 200 + Math.random() * 80,
      top: 180 + Math.random() * 80,
      fontSize: 42,
      editable: false,
    });
    setMeta(tb, { kind: "user", id: uid(), stickerId });
    c.add(tb);
    c.setActiveObject(tb);
    c.requestRenderAll();
  };

  /** Sheet-style rounded section frame (resize / delete like other objects). */
  const addSectionBox = (opts?: { cover?: boolean }) => {
    const c = fabricRef.current;
    if (!c || !isPlus) return;
    pushUndo();
    const cover = Boolean(opts?.cover);
    const obj = new Rect({
      left: (SHEET_PAGE.width - SECTION_BOX_W) / 2,
      top: 160 + (c.getObjects().filter((o) => metaOf(o).section).length % 5) * 24,
      width: SECTION_BOX_W,
      height: SECTION_BOX_H,
      fill: cover ? "#ffffff" : "transparent",
      stroke: "#111111",
      strokeWidth: 2,
      rx: SECTION_RX,
      ry: SECTION_RX,
      objectCaching: false,
    });
    setMeta(obj, { kind: "user", id: uid(), section: true });
    c.add(obj);
    // Keep frames under text / stickers.
    c.sendObjectToBack(obj);
    c.setActiveObject(obj);
    c.requestRenderAll();
    refreshLayers();
  };

  const addShape = (kind: "rect" | "circle" | "ellipse" | "line") => {
    const c = fabricRef.current;
    if (!c || !isPlus) return;
    pushUndo();
    let obj: FabricObject;
    if (kind === "rect") {
      // Same chrome as printable .gs-box; drag corners to resize.
      obj = new Rect({
        left: (SHEET_PAGE.width - SECTION_BOX_W) / 2,
        top: 200,
        width: SECTION_BOX_W,
        height: SECTION_BOX_H,
        fill: "transparent",
        stroke: "#111111",
        strokeWidth: 2,
        rx: SECTION_RX,
        ry: SECTION_RX,
        objectCaching: false,
      });
      setMeta(obj, { kind: "user", id: uid(), section: true });
      c.add(obj);
      c.sendObjectToBack(obj);
      c.setActiveObject(obj);
      c.requestRenderAll();
      refreshLayers();
      return;
    } else if (kind === "circle") {
      obj = new Circle({
        left: 260,
        top: 240,
        radius: 40,
        fill: "transparent",
        stroke: fill,
        strokeWidth: 3,
      });
    } else if (kind === "ellipse") {
      obj = new Ellipse({
        left: 240,
        top: 230,
        rx: 70,
        ry: 42,
        fill: "transparent",
        stroke: fill,
        strokeWidth: 3,
      });
    } else {
      obj = new Line([200, 280, 360, 280], {
        stroke: fill,
        strokeWidth: 4,
      });
    }
    setMeta(obj, { kind: "user", id: uid() });
    c.add(obj);
    c.setActiveObject(obj);
    c.requestRenderAll();
  };

  const onPhotoPicked = async (file: File | null) => {
    if (!file || !isPlus) return;
    const c = fabricRef.current;
    if (!c) return;
    setUploading(true);
    setStatus("Preparing photo…");
    try {
      let upload: File;
      try {
        upload = await prepareSheetPhotoUpload(file);
      } catch (e) {
        setStatus(e instanceof Error ? e.message : "Could not read this photo");
        return;
      }
      setStatus("Uploading photo…");
      const body = new FormData();
      body.append("file", upload);
      const res = await fetch("/api/resource/photos", { method: "POST", body });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setStatus(json.error ?? `Upload failed (${res.status})`);
        return;
      }
      const url = String(json.photo?.url ?? "");
      if (!url) {
        setStatus("Upload returned no URL");
        return;
      }
      if (json.photo) {
        const p = json.photo as SheetPhotoItem;
        setPhotos((prev) => [p, ...prev.filter((x) => x.id !== p.id)]);
        setPhotoBytes((b) => b + (Number(p.sizeBytes) || 0));
      }
      await insertPhoto(url, String(json.photo?.id ?? ""));
      setStatus("Photo added");
    } catch {
      setStatus("Upload failed");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const insertPhoto = async (url: string, photoId: string) => {
    const c = fabricRef.current;
    if (!c || !isPlus) return;
    {
      pushUndo();
      const img = await FabricImage.fromURL(url, { crossOrigin: "anonymous" });
      const maxW = 280;
      const iw = img.width || maxW;
      const scale = iw > maxW ? maxW / iw : 1;
      img.set({
        left: 180,
        top: 200,
        scaleX: scale,
        scaleY: scale,
      });
      setMeta(img, { kind: "user", id: uid(), photoId });
      c.add(img);
      c.setActiveObject(img);
      c.requestRenderAll();
      refreshLayers();
    }
  };

  const deletePhoto = async (p: SheetPhotoItem) => {
    if (!isPlus) return;
    if (!window.confirm("Delete this photo from your account? Sheets that use it will show an empty spot.")) return;
    try {
      const res = await fetch(`/api/resource/photos/${encodeURIComponent(p.id)}`, { method: "DELETE" });
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        setStatus(json.error ?? `Delete failed (${res.status})`);
        return;
      }
      setPhotos((prev) => prev.filter((x) => x.id !== p.id));
      setPhotoBytes((b) => Math.max(0, b - (Number(p.sizeBytes) || 0)));
      setStatus("Photo deleted");
    } catch {
      setStatus("Delete failed");
    }
  };

  useEffect(() => {
    if (!isPlus || !ready) return;
    let cancelled = false;
    void (async () => {
      try {
        const res = await fetch("/api/resource/photos", { cache: "no-store" });
        if (!res.ok) return;
        const json = (await res.json()) as { photos?: SheetPhotoItem[]; usage?: { totalBytes?: number } };
        if (cancelled) return;
        setPhotos(json.photos ?? []);
        setPhotoBytes(Number(json.usage?.totalBytes ?? 0));
      } catch {
        /* photo list is optional */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [isPlus, ready]);

  /** Live HTML underlay (graphics, grids, locked chrome) as an image for export/thumbnails. */
  const underlayImage = async (): Promise<CanvasImageSource | null> => {
    if (!liveHtmlBase) return null;
    const root = liveHostRef.current?.querySelector<HTMLElement>(".gs");
    if (!root) return null;
    return snapshotSheetUnderlay(root);
  };

  const resolveRev = async (keepMine: boolean) => {
    const data = revPrompt;
    setRevPrompt(null);
    if (!data || !keepMine) {
      setStatus("Using the updated original text. Save to keep this version.");
      return;
    }
    pushUndo();
    const { unmatched } = await applyCustomData(data);
    setStatus(
      unmatched
        ? `Kept your text · ${unmatched} edit${unmatched === 1 ? "" : "s"} no longer match the updated sheet`
        : "Kept your text",
    );
  };

  const exportPdf = async () => {
    const c = fabricRef.current;
    if (!c || !isPlus) return;
    setExporting(true);
    setStatus("Building PDF…");
    try {
      if (!(await confirmPlusOnServer())) {
        setStatus("PDF download is a Plus feature — please sign in again.");
        return;
      }
      const under = await underlayImage();
      await downloadSheetPdf(c, under, `${name.trim() || sheet.key}-custom`);
      setStatus(liveHtmlBase && !under ? "PDF downloaded (sheet graphics could not be included in this browser)" : "PDF downloaded");
    } catch (e) {
      console.error(e);
      setStatus("PDF export failed — try PNG");
    } finally {
      setExporting(false);
    }
  };

  const exportPng = async () => {
    const c = fabricRef.current;
    if (!c || !isPlus) return;
    setExporting(true);
    try {
      if (!(await confirmPlusOnServer())) {
        setStatus("PNG download is a Plus feature — please sign in again.");
        return;
      }
      const under = await underlayImage();
      downloadSheetPng(c, under, `${name.trim() || sheet.key}-custom`);
      setStatus(
        liveHtmlBase && !under
          ? "PNG downloaded (sheet graphics could not be included in this browser)"
          : "PNG downloaded (~300 dpi)",
      );
    } catch {
      setStatus("PNG export failed");
    } finally {
      setExporting(false);
    }
  };

  const removeActive = () => {
    const c = fabricRef.current;
    const obj = c?.getActiveObject();
    if (!c || !obj || !isPlus) return;
    // Typing inside a textbox: Delete/Backspace should edit characters (keyboard handler skips).
    if (obj instanceof Textbox && obj.isEditing) return;

    pushUndo();
    const removeOne = (o: FabricObject) => {
      const m = metaOf(o);
      if (m.kind === "base-edit" && m.fieldId && !hiddenFieldsRef.current.includes(m.fieldId)) {
        hiddenFieldsRef.current = [...hiddenFieldsRef.current, m.fieldId];
      }
      if (m.baseChromeId && !hiddenFieldsRef.current.includes(m.baseChromeId)) {
        hiddenFieldsRef.current = [...hiddenFieldsRef.current, m.baseChromeId];
      }
      if (m.baseSectionId && !hiddenBaseSectionsRef.current.includes(m.baseSectionId)) {
        hiddenBaseSectionsRef.current = [...hiddenBaseSectionsRef.current, m.baseSectionId];
      }
      c.remove(o);
    };

    // Multi-select
    const anyObj = obj as FabricObject & { getObjects?: () => FabricObject[]; type?: string };
    if (anyObj.type === "activeSelection" && typeof anyObj.getObjects === "function") {
      const items = [...anyObj.getObjects()];
      c.discardActiveObject();
      for (const o of items) removeOne(o);
    } else {
      removeOne(obj);
    }
    c.requestRenderAll();
    refreshLayers();
    setStatus("");
  };
  removeActiveRef.current = removeActive;

  const undo = async () => {
    const c = fabricRef.current;
    if (!c || undoRef.current.length < 2) return;
    const current = undoRef.current.pop()!;
    redoRef.current.push(current);
    while (redoRef.current.length > HISTORY_MAX - 1) redoRef.current.shift();
    const prev = undoRef.current[undoRef.current.length - 1];
    applyingRef.current = true;
    await c.loadFromJSON(JSON.parse(prev));
    applyingRef.current = false;
    c.requestRenderAll();
    refreshLayers();
    syncHistoryButtons();
  };

  const redo = async () => {
    const c = fabricRef.current;
    if (!c || redoRef.current.length < 1) return;
    const next = redoRef.current.pop()!;
    undoRef.current.push(next);
    while (undoRef.current.length > HISTORY_MAX) undoRef.current.shift();
    applyingRef.current = true;
    await c.loadFromJSON(JSON.parse(next));
    applyingRef.current = false;
    c.requestRenderAll();
    refreshLayers();
    syncHistoryButtons();
  };

  useEffect(() => {
    if (!isPlus || !ready) return;
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable)) {
        return;
      }
      const mod = e.metaKey || e.ctrlKey;
      if (mod && e.key === "z" && !e.shiftKey) {
        e.preventDefault();
        void undo();
        return;
      }
      if (mod && (e.key === "y" || (e.key === "z" && e.shiftKey))) {
        e.preventDefault();
        void redo();
        return;
      }
      if (!mod && (e.key === "Delete" || e.key === "Backspace")) {
        const active = fabricRef.current?.getActiveObject();
        // Typing inside a textbox: let Backspace/Delete edit characters.
        if (active instanceof Textbox && active.isEditing) return;
        if (!active) return;
        e.preventDefault();
        removeActiveRef.current();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPlus, ready]);

  const save = async () => {
    if (!isPlus) return;
    setSaving(true);
    setStatus("Saving…");
    try {
      const data = buildDiff();
      // Flatten white paper + live HTML underlay + objects so thumbs match the sheet.
      const c = fabricRef.current;
      let thumbUrl: string | null = null;
      if (c) {
        const under = await underlayImage();
        thumbUrl = composeSheetCanvas(c, under, 0.25).toDataURL("image/jpeg", 0.8);
      }
      const payload = { name: name.trim() || "My sheet", data, thumbUrl };
      const res = await fetch(
        customId ? `/api/resource/custom-sheets/${customId}` : "/api/resource/custom-sheets",
        {
          method: customId ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setStatus(json.error ?? `Save failed (${res.status})`);
        return;
      }
      setCustomId(json.sheet.id);
      setStatus("Saved");
    } catch {
      setStatus("Save failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="grid gap-4 lg:grid-cols-[14rem_minmax(0,1fr)]">
      {/* Left: elements */}
      <aside className="rounded-2xl border border-[#e8e0d6] bg-[#fdfaf7] p-3">
        <h2 className="m-0 text-sm font-bold text-[#1c1c1c]">Elements</h2>
        <button type="button" className={`${toolBtn} mt-2 w-full`} disabled={!isPlus || !ready} onClick={addText}>
          Add text
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={(e) => void onPhotoPicked(e.target.files?.[0] ?? null)}
        />
        <button
          type="button"
          className={`${toolBtn} mt-2 w-full`}
          disabled={!isPlus || !ready || uploading}
          onClick={() => fileInputRef.current?.click()}
        >
          {uploading ? "Uploading…" : "Add photo"}
        </button>
        {isPlus && photos.length > 0 ? (
          <details className="mt-2 rounded-lg border border-[#e7e3de] bg-white p-2 text-xs">
            <summary className="cursor-pointer font-semibold">
              My photos ({photos.length}) · {(photoBytes / 1024 / 1024).toFixed(1)} / {FAMILY_PHOTO_QUOTA_MB} MB
            </summary>
            <ul className="m-0 mt-2 grid list-none grid-cols-3 gap-1 p-0">
              {photos.map((p) => (
                <li key={p.id} className="relative">
                  <button
                    type="button"
                    className="block w-full overflow-hidden rounded border border-[#e7e3de]"
                    disabled={!ready}
                    onClick={() => void insertPhoto(p.url, p.id)}
                    title="Add to sheet"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={p.url} alt="Uploaded photo — add to sheet" className="block aspect-square w-full object-cover" loading="lazy" />
                  </button>
                  <button
                    type="button"
                    className="absolute right-0 top-0 rounded-bl bg-black/70 px-1 text-[10px] leading-4 text-white"
                    onClick={() => void deletePhoto(p)}
                    aria-label="Delete photo"
                    title="Delete photo"
                  >
                    ✕
                  </button>
                </li>
              ))}
            </ul>
          </details>
        ) : null}
        <button
          type="button"
          className={`${toolBtn} mt-2 w-full`}
          disabled={!isPlus || !ready}
          onClick={() => addSectionBox()}
          title="Add a rounded section frame you can resize or delete"
        >
          □ Section box
        </button>
        <button
          type="button"
          className={`${toolBtn} mt-1 w-full`}
          disabled={!isPlus || !ready}
          onClick={() => addSectionBox({ cover: true })}
          title="White rounded box to cover a locked base section, then resize or Delete"
        >
          □ Cover base box
        </button>
        <div className="mt-2 grid grid-cols-2 gap-1">
          <button type="button" className={toolBtn} disabled={!isPlus || !ready} onClick={() => addShape("rect")}>
            □ Rect
          </button>
          <button type="button" className={toolBtn} disabled={!isPlus || !ready} onClick={() => addShape("circle")}>
            ○ Circle
          </button>
          <button type="button" className={toolBtn} disabled={!isPlus || !ready} onClick={() => addShape("ellipse")}>
            ◯ Oval
          </button>
          <button type="button" className={toolBtn} disabled={!isPlus || !ready} onClick={() => addShape("line")}>
            ― Line
          </button>
        </div>
        <p className="mb-1 mt-3 text-xs font-semibold uppercase tracking-wide text-[#6b7280]">Stickers</p>
        <div className="grid grid-cols-4 gap-1">
          {EDITOR_STICKERS.map((s) => (
            <button
              key={s.id}
              type="button"
              title={s.label}
              className="rounded-lg border border-[#e7e3de] bg-white py-1 text-xl hover:bg-white disabled:opacity-40"
              disabled={!isPlus || !ready}
              onClick={() => addSticker(s.id, s.emoji)}
            >
              {s.emoji}
            </button>
          ))}
        </div>
        {!isPlus ? (
          <p className="mt-3 text-xs text-[#6b7280]">
            Preview only.{" "}
            <Link href="/subscribe" className="text-[#d35400]">
              Plus
            </Link>{" "}
            unlocks editing & save.
          </p>
        ) : null}
        {isPlus && layers.length > 0 ? (
          <details className="mt-3 rounded-lg border border-[#e7e3de] bg-white p-2 text-xs">
            <summary className="cursor-pointer font-semibold">Layers ({layers.length})</summary>
            <p className="m-0 mt-1 text-[11px] text-[#6b7280]">Top of the list is in front.</p>
            <ol className="m-0 mt-1 max-h-64 list-none overflow-auto p-0" aria-label="Sheet layers, front to back">
              {layers.map((l, i) => (
                <li key={`${l.index}-${l.label}`} className="flex items-center gap-1 py-0.5">
                  <button
                    type="button"
                    className={`min-w-0 flex-1 truncate rounded px-1 py-0.5 text-left ${l.active ? "bg-[#fff6ef] font-semibold text-[#d35400]" : "hover:bg-[#fdfaf7]"}`}
                    onClick={() => selectLayer(l.index)}
                    aria-current={l.active ? "true" : undefined}
                  >
                    {l.label}
                  </button>
                  <button
                    type="button"
                    className="rounded border border-[#e7e3de] px-1 disabled:opacity-30"
                    disabled={i === 0}
                    onClick={() => moveLayer(l.index, "forward")}
                    aria-label={`Bring ${l.label} forward`}
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    className="rounded border border-[#e7e3de] px-1 disabled:opacity-30"
                    disabled={i === layers.length - 1}
                    onClick={() => moveLayer(l.index, "backward")}
                    aria-label={`Send ${l.label} backward`}
                  >
                    ↓
                  </button>
                </li>
              ))}
            </ol>
          </details>
        ) : null}
      </aside>

      {/* Center */}
      <div className="min-w-0">
        <div className="mb-2 flex flex-wrap items-center gap-2 rounded-2xl border border-[#e8e0d6] bg-white p-2">
          <select
            className="rounded-lg border border-[#e7e3de] px-2 py-1.5 text-sm"
            value={fontFamily}
            disabled={!isPlus}
            onChange={(e) => setFontFamily(e.target.value as EditorFontId)}
            style={{ fontFamily }}
          >
            {EDITOR_FONTS.map((f) => (
              <option key={f.id} value={f.id} style={{ fontFamily: f.id }}>
                {f.label}
              </option>
            ))}
          </select>
          <input
            type="number"
            min={10}
            max={72}
            value={fontSize}
            disabled={!isPlus}
            onChange={(e) => setFontSize(Number(e.target.value) || 18)}
            className="w-16 rounded-lg border border-[#e7e3de] px-2 py-1.5 text-sm"
          />
          <input
            type="color"
            value={fill.startsWith("#") ? fill : "#d35400"}
            disabled={!isPlus}
            onChange={(e) => setFill(e.target.value)}
            className="h-9 w-10 cursor-pointer rounded border border-[#e7e3de] bg-white"
            title="Color"
          />
          <button type="button" className={`${toolBtn} ${bold ? toolBtnOn : ""}`} disabled={!isPlus} onClick={() => setBold((v) => !v)}>
            B
          </button>
          <button type="button" className={`${toolBtn} italic ${italic ? toolBtnOn : ""}`} disabled={!isPlus} onClick={() => setItalic((v) => !v)}>
            I
          </button>
          <button type="button" className={`${toolBtn} underline ${underline ? toolBtnOn : ""}`} disabled={!isPlus} onClick={() => setUnderline((v) => !v)}>
            U
          </button>
          <button type="button" className={toolBtn} disabled={!isPlus} onClick={applyStyleToActive}>
            Apply
          </button>
          <button
            type="button"
            className={toolBtn}
            disabled={!isPlus || !canUndo}
            onClick={() => void undo()}
            title="Undo (Ctrl+Z) · last ~10 steps"
          >
            ← Undo
          </button>
          <button
            type="button"
            className={toolBtn}
            disabled={!isPlus || !canRedo}
            onClick={() => void redo()}
            title="Redo (Ctrl+Y) · last ~10 steps"
          >
            Redo →
          </button>
          <button
            type="button"
            className={toolBtn}
            disabled={!isPlus}
            onClick={removeActive}
            title="Delete selected (Delete / Backspace)"
          >
            Delete
          </button>
          <div className="ml-auto flex flex-wrap items-center gap-2">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={!isPlus}
              className="min-w-[10rem] rounded-lg border border-[#e7e3de] px-2 py-1.5 text-sm"
              aria-label="Sheet name"
            />
            <button
              type="button"
              className="rounded-full bg-[#d35400] px-4 py-1.5 text-sm font-semibold text-white disabled:opacity-40"
              disabled={!isPlus || !ready || saving}
              onClick={() => void save()}
            >
              {saving ? "Saving…" : "Save"}
            </button>
            <button
              type="button"
              className={toolBtn}
              disabled={!isPlus || !ready || exporting}
              onClick={() => void exportPdf()}
              title="Download Letter PDF (~300 dpi)"
            >
              {exporting ? "PDF…" : "PDF"}
            </button>
            <button
              type="button"
              className={toolBtn}
              disabled={!isPlus || !ready || exporting}
              onClick={() => void exportPng()}
              title="Download ~300 dpi PNG"
            >
              PNG
            </button>
          </div>
        </div>

        <div className="overflow-auto rounded-sm border border-[#ddd] bg-[#eee] p-3">
          <div
            className="relative mx-auto"
            style={{ width: SHEET_PAGE.width, height: SHEET_PAGE.height }}
          >
            {liveHtmlBase ? (
              <>
                <style
                  dangerouslySetInnerHTML={{
                    __html: `${GOSPEL_SHEET_CSS}
/* Editor host: pin letter page to canvas (0,0) — no margin/shadow offset. */
.gs.gs-base .gs-page{margin:0!important;box-shadow:none!important;width:8.5in!important;height:11in!important;}
`,
                  }}
                />
                <div
                  ref={liveHostRef}
                  className="pointer-events-none absolute inset-0 origin-top-left overflow-hidden"
                  aria-hidden
                >
                  <GospelSheet
                    sheet={{ ...toGospelSheetView(sheet), sundayLabel: sundayLabel || toGospelSheetView(sheet).sundayLabel }}
                    level={level}
                    variant="base"
                  />
                </div>
              </>
            ) : null}
            <canvas
              ref={canvasEl}
              className="relative z-10 block"
              style={{ background: liveHtmlBase ? "transparent" : undefined }}
            />
            <div className="pointer-events-none absolute bottom-3 left-1/2 z-20 -translate-x-1/2 rounded bg-black/70 px-3 py-1 text-[11px] text-white">
              {liveHtmlBase
                ? `All text + sections editable · ${sheet.key}`
                : `🔒 Base image locked · ${sheet.key}`}
            </div>
          </div>
        </div>
        {revPrompt ? (
          <div role="alert" className="mt-2 rounded-xl border border-[#f0c9a8] bg-[#fff6ef] p-3 text-sm text-[#1c1c1c]">
            <p className="m-0">
              This Sunday&apos;s original sheet was updated after you saved. Your stickers, photos and boxes are kept.
              What should happen to the text you changed?
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              <button type="button" className={toolBtn} onClick={() => void resolveRev(false)}>
                Use the new original
              </button>
              <button type="button" className={toolBtn} onClick={() => void resolveRev(true)}>
                Keep my text
              </button>
            </div>
          </div>
        ) : null}
        <p className="sr-only" aria-live="polite">{status}</p>
        {status ? <p className="mt-2 text-sm text-[#6b7280]" aria-hidden>{status}</p> : null}
        {selectedLabel ? <p className="mt-1 text-xs text-[#9ca3af]">Selected: {selectedLabel}</p> : null}
      </div>
    </div>
  );
}
