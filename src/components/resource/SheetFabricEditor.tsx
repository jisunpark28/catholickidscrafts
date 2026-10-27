"use client";

import {
  collectEditableTextFields,
  measureSheetSectionBoxes,
} from "@/components/resource/captureSheetBase";
import { GospelSheet } from "@/components/gospel-sheet/GospelSheet";
import { GOSPEL_SHEET_CSS } from "@/components/gospel-sheet/sheet-styles";
import {
  EDITOR_FONTS,
  EDITOR_STICKERS,
  type CustomSheetData,
  type EditorFontId,
} from "@/lib/resource/custom-sheet-data";
import { downloadSheetPdf, downloadSheetPng } from "@/lib/resource/export-sheet-pdf";
import { loadEditorFonts } from "@/lib/resource/load-editor-fonts";
import { resourceEditPath } from "@/lib/resource/sheet-edit-path";
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

type SavedSheet = {
  id: string;
  name: string;
  baseKey: string;
  level: 1 | 2;
  updatedAt: string;
};

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
};

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

export function SheetFabricEditor({
  sheet,
  level,
  layout,
  basePngUrl,
  baseRev,
  isPlus,
  initialCustomId = null,
  liveHtmlBase = false,
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
  const promoteBaseSectionsRef = useRef<() => void>(() => undefined);
  const installLiveTextRef = useRef<() => void>(() => undefined);

  const [ready, setReady] = useState(false);
  const [fontFamily, setFontFamily] = useState<EditorFontId>("Fredoka");
  const [fontSize, setFontSize] = useState(18);
  const [fill, setFill] = useState("#d35400");
  const [bold, setBold] = useState(false);
  const [italic, setItalic] = useState(false);
  const [underline, setUnderline] = useState(false);
  const [selectedLabel, setSelectedLabel] = useState<string>("");
  const [layers, setLayers] = useState<
    { key: string; label: string; locked: boolean; canvasIndex: number }[]
  >([]);
  const [layerDragFrom, setLayerDragFrom] = useState<number | null>(null);
  const [layerDragOver, setLayerDragOver] = useState<number | null>(null);
  const layerDragFromRef = useRef<number | null>(null);
  const layerDragOverRef = useRef<number | null>(null);
  const layerPointerRef = useRef<{
    from: number;
    pointerId: number;
    startY: number;
    dragging: boolean;
  } | null>(null);
  const [name, setName] = useState(
    `${(level === 2 ? sheet.levels.level2 : sheet.levels.level1).title} — my sheet`,
  );
  const [customId, setCustomId] = useState<string | null>(initialCustomId);
  const [savedList, setSavedList] = useState<SavedSheet[]>([]);
  const [status, setStatus] = useState("");
  const [saving, setSaving] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const refreshLayers = () => {
    const c = fabricRef.current;
    if (!c) return;
    const objs = c.getObjects();
    // UI top = frontmost (reverse of Fabric stack: back → front).
    setLayers(
      [...objs]
        .map((o, canvasIndex) => ({ o, canvasIndex }))
        .reverse()
        .map(({ o, canvasIndex }, i) => {
          const m = metaOf(o);
          const label =
            m.kind === "base-edit"
              ? `T ${m.fieldId}`
              : m.baseSectionId
                ? `Base box ${m.baseSectionId.replace(/^bs_/, "")}`
                : m.section || (o instanceof Rect && (o.rx ?? 0) >= 8)
                  ? "Section box"
                  : m.stickerId
                    ? `Sticker ${m.stickerId}`
                    : m.photoId || o.type === "image"
                      ? "Photo"
                      : o.type === "textbox"
                        ? `T ${(o as Textbox).text?.slice(0, 24) || "Text"}`
                        : o.type === "rect"
                          ? "Rect"
                          : (o.type ?? `obj${i}`);
          return {
            key: `${canvasIndex}:${m.id ?? m.fieldId ?? o.type ?? "obj"}`,
            label,
            locked: false,
            canvasIndex,
          };
        }),
    );
    const active = c.getActiveObject();
    if (active) {
      const m = metaOf(active);
      setSelectedLabel(m.fieldId ?? m.stickerId ?? active.type ?? "");
      if (active instanceof Textbox) {
        setFontFamily((active.fontFamily as EditorFontId) || "Fredoka");
        setFontSize(Number(active.fontSize) || 18);
        setFill(String(active.fill || "#111"));
        setBold(active.fontWeight === "bold" || active.fontWeight === 700);
        setItalic(active.fontStyle === "italic");
        setUnderline(Boolean(active.underline));
      }
    } else setSelectedLabel("");
  };
  refreshLayersRef.current = refreshLayers;

  /** Reorder canvas z-stack from Layers list indices (0 = front / top of list). */
  const reorderLayer = (fromUi: number, toUi: number) => {
    const c = fabricRef.current;
    if (!c || !isPlus || fromUi === toUi || fromUi < 0 || toUi < 0) return;
    const objs = c.getObjects();
    if (fromUi >= objs.length || toUi >= objs.length) return;

    const uiOrder = [...objs].reverse();
    const [moved] = uiOrder.splice(fromUi, 1);
    if (!moved) return;
    uiOrder.splice(toUi, 0, moved);
    // uiOrder is front→back; Fabric stack is back→front.
    const newStack = [...uiOrder].reverse();

    pushUndo();
    applyingRef.current = true;
    try {
      // bringObjectToFront in back→front order rebuilds the stack reliably.
      for (const obj of newStack) {
        c.bringObjectToFront(obj);
      }
    } finally {
      applyingRef.current = false;
    }
    c.requestRenderAll();
    refreshLayers();
  };

  const pushUndo = () => {
    const c = fabricRef.current;
    if (!c || applyingRef.current) return;
    const json = JSON.stringify(c.toJSON());
    undoRef.current.push(json);
    if (undoRef.current.length > 50) undoRef.current.shift();
    redoRef.current = [];
  };
  pushUndoRef.current = pushUndo;

  const buildDiff = (): CustomSheetData => {
    const c = fabricRef.current!;
    const edits: CustomSheetData["edits"] = {};
    const objects: CustomSheetData["objects"] = [];
    for (const obj of c.getObjects()) {
      const m = metaOf(obj);
      if (m.kind === "base-edit" && m.fieldId && obj instanceof Textbox) {
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
      hidden: [],
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
            fontFamily: "Fredoka",
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
                [...ids].some((id) => String(id).startsWith("auto_") || String(id).startsWith("svg_"));
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
    };
    // layout.boxes identity changes often; key off rev + count
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [basePngUrl, baseRev, isPlus, level, sheet.key, liveHtmlBase, layout.boxes.length]);

  useEffect(() => {
    if (!isPlus) return;
    void fetch("/api/resource/custom-sheets")
      .then((r) => r.json())
      .then((j) => {
        if (Array.isArray(j.sheets)) setSavedList(j.sheets);
      })
      .catch(() => undefined);
  }, [isPlus]);

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

    applyingRef.current = true;
    try {
      const existing = new Map<string, Textbox>();
      for (const obj of c.getObjects()) {
        const m = metaOf(obj);
        if (m.kind === "base-edit" && m.fieldId && obj instanceof Textbox) {
          existing.set(m.fieldId, obj);
        }
      }

      for (const f of fields) {
        const prev = existing.get(f.id);
        if (prev) {
          const keepText =
            Boolean(prev.text) && prev.text !== f.text && prev.text !== defaultTextForField(sheet, level, f.id);
          prev.set({
            left: f.left,
            top: f.top,
            width: Math.max(40, f.width),
            fontSize: f.fontSize,
            text: keepText ? prev.text : f.text,
            selectable: true,
            evented: true,
            editable: true,
          });
          existing.delete(f.id);
          continue;
        }
        const tb = new Textbox(f.text, {
          left: f.left,
          top: f.top,
          width: Math.max(40, f.width),
          fontSize: f.fontSize,
          fontFamily: "Fredoka",
          fill: "#111111",
          editable: true,
          selectable: true,
          evented: true,
        });
        setMeta(tb, { kind: "base-edit", fieldId: f.id, id: `base_${f.id}` });
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
  const applyCustomData = async (data: CustomSheetData) => {
    const c = fabricRef.current;
    if (!c) return;
    applyingRef.current = true;
    hiddenBaseSectionsRef.current = [...(data.hiddenBaseSections ?? [])];
    try {
      if (liveHtmlBase) installLiveTextFields();

      for (const obj of c.getObjects()) {
        const m = metaOf(obj);
        if (m.kind === "base-edit" && m.fieldId && obj instanceof Textbox) {
          const edit = data.edits[m.fieldId];
          if (!edit) continue;
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
            opacity: o.opacity ?? 1,
          });
          setMeta(ln, { kind: "user", id: o.id });
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
            setMeta(img, { kind: "user", id: o.id, photoId: o.id });
            c.add(img);
          } catch (e) {
            console.warn("[SheetFabricEditor] image restore failed", e);
          }
        }
      }
      c.requestRenderAll();
      refreshLayersRef.current();
      if (liveHtmlBase) promoteBaseSections();
    } finally {
      applyingRef.current = false;
    }
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
        await applyCustomData(row.data);
        if (!cancelled) setStatus(`Loaded “${row.name ?? "custom sheet"}”`);
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
    setStatus("Uploading photo…");
    try {
      const body = new FormData();
      body.append("file", file);
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
      setMeta(img, { kind: "user", id: uid(), photoId: String(json.photo?.id ?? "") });
      c.add(img);
      c.setActiveObject(img);
      c.requestRenderAll();
      setStatus("Photo added");
    } catch {
      setStatus("Upload failed");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const exportPdf = async () => {
    const c = fabricRef.current;
    if (!c || !isPlus) return;
    setExporting(true);
    setStatus("Building PDF…");
    try {
      await downloadSheetPdf(c, `${name.trim() || sheet.key}-custom`);
      setStatus("PDF downloaded");
    } catch (e) {
      console.error(e);
      setStatus("PDF export failed — try PNG");
    } finally {
      setExporting(false);
    }
  };

  const exportPng = () => {
    const c = fabricRef.current;
    if (!c || !isPlus) return;
    try {
      downloadSheetPng(c, `${name.trim() || sheet.key}-custom`);
      setStatus("PNG downloaded (~300 dpi)");
    } catch {
      setStatus("PNG export failed");
    }
  };

  const removeActive = () => {
    const c = fabricRef.current;
    const obj = c?.getActiveObject();
    if (!c || !obj || !isPlus) return;
    const m = metaOf(obj);
    if (m.kind === "base-edit") {
      setStatus("Base text can’t be deleted — clear or edit it instead");
      return;
    }
    pushUndo();
    if (m.baseSectionId && !hiddenBaseSectionsRef.current.includes(m.baseSectionId)) {
      hiddenBaseSectionsRef.current = [...hiddenBaseSectionsRef.current, m.baseSectionId];
    }
    c.remove(obj);
    c.requestRenderAll();
    refreshLayers();
  };

  const undo = async () => {
    const c = fabricRef.current;
    if (!c || undoRef.current.length < 2) return;
    const current = undoRef.current.pop()!;
    redoRef.current.push(current);
    const prev = undoRef.current[undoRef.current.length - 1];
    applyingRef.current = true;
    await c.loadFromJSON(JSON.parse(prev));
    applyingRef.current = false;
    c.requestRenderAll();
    refreshLayers();
  };

  const save = async () => {
    if (!isPlus) return;
    setSaving(true);
    setStatus("Saving…");
    try {
      const data = buildDiff();
      // Live HTML base uses a transparent canvas — force white so thumbs aren't empty/beige text-only.
      const c = fabricRef.current;
      const prevBg = c?.backgroundColor;
      if (c && (liveHtmlBase || !basePngUrl)) c.backgroundColor = "#ffffff";
      c?.requestRenderAll();
      const thumbUrl = c?.toDataURL({ format: "png", multiplier: 0.25 }) ?? null;
      if (c && prevBg !== undefined) {
        c.backgroundColor = prevBg;
        c.requestRenderAll();
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
      setSavedList((prev) => {
        const next = prev.filter((s) => s.id !== json.sheet.id);
        return [json.sheet, ...next];
      });
    } catch {
      setStatus("Save failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="grid gap-4 lg:grid-cols-[14rem_minmax(0,1fr)_14rem]">
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
        <p className="mt-2 text-[11px] leading-snug text-[#6b7280]">
          Base section frames become editable Fabric boxes (resize / Delete). Add Section box for
          extras, or Cover to blank an area. Save keeps your changes.
        </p>
        <p className="mb-1 mt-3 text-xs font-semibold uppercase tracking-wide text-[#6b7280]">Faith</p>
        <div className="grid grid-cols-4 gap-1">
          {EDITOR_STICKERS.filter((s) => s.group === "faith").map((s) => (
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
        <p className="mb-1 mt-3 text-xs font-semibold uppercase tracking-wide text-[#6b7280]">Fun</p>
        <div className="grid grid-cols-4 gap-1">
          {EDITOR_STICKERS.filter((s) => s.group === "fun").map((s) => (
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
          <button type="button" className={toolBtn} disabled={!isPlus} onClick={() => void undo()}>
            Undo
          </button>
          <button type="button" className={toolBtn} disabled={!isPlus} onClick={removeActive}>
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
              disabled={!isPlus || !ready}
              onClick={exportPng}
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
                    sheet={{ ...toGospelSheetView(sheet), sundayLabel: sheet.key }}
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
        {status ? <p className="mt-2 text-sm text-[#6b7280]">{status}</p> : null}
        {selectedLabel ? <p className="mt-1 text-xs text-[#9ca3af]">Selected: {selectedLabel}</p> : null}
      </div>

      {/* Right: layers + saved */}
      <aside className="rounded-2xl border border-[#e8e0d6] bg-[#fdfaf7] p-3">
        <h2 className="m-0 text-sm font-bold text-[#1c1c1c]">Layers</h2>
        <p className="mb-0 mt-1 text-[11px] text-[#9ca3af]">Drag ⠿ to reorder (top = front)</p>
        <ul className="mt-2 max-h-64 list-none space-y-1 overflow-y-auto p-0 text-sm">
          {layers.map((l, i) => (
            <li
              key={l.key}
              data-layer-index={i}
              className={`flex items-center gap-1.5 rounded-lg border bg-white px-2 py-1.5 select-none ${
                layerDragFrom === i
                  ? "border-[#d35400] opacity-50"
                  : layerDragOver === i
                    ? "border-[#d35400] bg-[#fff6ef]"
                    : "border-[#ece7e1]"
              }`}
              title={isPlus ? "Drag ⠿ to reorder · click label to select" : l.label}
            >
              <span
                className={`touch-none text-[#c4bbb0] ${isPlus ? "cursor-grab active:cursor-grabbing" : ""}`}
                aria-label="Drag to reorder"
                onPointerDown={(e) => {
                  if (!isPlus || e.button !== 0) return;
                  e.preventDefault();
                  e.stopPropagation();
                  const handle = e.currentTarget as HTMLElement;
                  handle.setPointerCapture(e.pointerId);
                  layerPointerRef.current = {
                    from: i,
                    pointerId: e.pointerId,
                    startY: e.clientY,
                    dragging: false,
                  };
                  layerDragFromRef.current = i;
                  layerDragOverRef.current = i;
                  setLayerDragFrom(i);
                  setLayerDragOver(i);
                }}
                onPointerMove={(e) => {
                  const st = layerPointerRef.current;
                  if (!st || st.pointerId !== e.pointerId) return;
                  if (!st.dragging && Math.abs(e.clientY - st.startY) >= 3) {
                    st.dragging = true;
                  }
                  if (!st.dragging) return;
                  const list = (e.currentTarget as HTMLElement).closest("ul");
                  if (!list) return;
                  const items = [...list.querySelectorAll<HTMLElement>("[data-layer-index]")];
                  let over = st.from;
                  for (const el of items) {
                    const r = el.getBoundingClientRect();
                    if (e.clientY >= r.top && e.clientY <= r.bottom) {
                      over = Number(el.dataset.layerIndex);
                      break;
                    }
                  }
                  if (layerDragOverRef.current !== over) {
                    layerDragOverRef.current = over;
                    setLayerDragOver(over);
                  }
                }}
                onPointerUp={(e) => {
                  const st = layerPointerRef.current;
                  if (!st || st.pointerId !== e.pointerId) return;
                  try {
                    (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
                  } catch {
                    /* ignore */
                  }
                  const from = st.from;
                  const over = layerDragOverRef.current;
                  const wasDragging = st.dragging;
                  layerPointerRef.current = null;
                  layerDragFromRef.current = null;
                  layerDragOverRef.current = null;
                  setLayerDragFrom(null);
                  setLayerDragOver(null);
                  if (wasDragging && over !== null && over !== from) {
                    reorderLayer(from, over);
                  }
                }}
                onPointerCancel={() => {
                  layerPointerRef.current = null;
                  layerDragFromRef.current = null;
                  layerDragOverRef.current = null;
                  setLayerDragFrom(null);
                  setLayerDragOver(null);
                }}
              >
                ⠿
              </span>
              <button
                type="button"
                className="min-w-0 flex-1 truncate border-0 bg-transparent p-0 text-left text-inherit"
                onClick={() => {
                  if (!isPlus) return;
                  const c = fabricRef.current;
                  const obj = c?.getObjects()[l.canvasIndex];
                  if (!c || !obj) return;
                  c.setActiveObject(obj);
                  c.requestRenderAll();
                  refreshLayers();
                }}
              >
                {l.label}
              </button>
            </li>
          ))}
        </ul>
        <h2 className="mb-0 mt-4 text-sm font-bold text-[#1c1c1c]">
          My custom sheets <span className="rounded bg-[#d35400] px-1.5 py-0.5 text-[10px] text-white">PLUS</span>
        </h2>
        <ul className="mt-2 list-none space-y-1 p-0 text-sm">
          {savedList.length === 0 ? (
            <li className="text-xs text-[#6b7280]">No saved sheets yet</li>
          ) : (
            savedList.slice(0, 8).map((s) => (
              <li key={s.id}>
                <Link
                  href={resourceEditPath(s.baseKey, s.level, s.id)}
                  className={`block w-full rounded-lg border px-2 py-1.5 text-left no-underline ${
                    s.id === customId ? "border-[#d35400] bg-[#fff6ef]" : "border-[#ece7e1] bg-white"
                  }`}
                >
                  {s.name}
                </Link>
              </li>
            ))
          )}
        </ul>
        <p className="mb-0 mt-2 text-xs text-[#6b7280]">
          <Link href="/resource?view=custom" className="text-[#d35400] no-underline hover:underline">
            See all custom sheets →
          </Link>
        </p>
      </aside>
    </div>
  );
}
