"use client";

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
  type SheetEditField,
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
  fieldId?: SheetEditField;
  stickerId?: string;
  photoId?: string;
  id?: string;
};

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

  const [ready, setReady] = useState(false);
  const [fontFamily, setFontFamily] = useState<EditorFontId>("Fredoka");
  const [fontSize, setFontSize] = useState(18);
  const [fill, setFill] = useState("#d35400");
  const [bold, setBold] = useState(false);
  const [italic, setItalic] = useState(false);
  const [underline, setUnderline] = useState(false);
  const [selectedLabel, setSelectedLabel] = useState<string>("");
  const [layers, setLayers] = useState<{ key: string; label: string; locked: boolean }[]>([]);
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
    setLayers(
      [...objs]
        .reverse()
        .map((o, i) => {
          const m = metaOf(o);
          const label =
            m.kind === "base-edit"
              ? `T ${m.fieldId}`
              : m.stickerId
                ? `Sticker ${m.stickerId}`
                : m.photoId || o.type === "image"
                  ? "Photo"
                  : o.type === "textbox"
                    ? `T ${(o as Textbox).text?.slice(0, 24) || "Text"}`
                    : o.type ?? `obj${i}`;
          return {
            key: m.id ?? m.fieldId ?? `i${i}`,
            label,
            locked: false,
          };
        })
        .filter((l) => l.key !== "base"),
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

        for (const box of layout.boxes) {
          const text = defaultTextForField(sheet, level, box.id);
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
          pushUndoRef.current();
          refreshLayersRef.current();
        });
        canvas.on("selection:created", () => refreshLayersRef.current());
        canvas.on("selection:updated", () => refreshLayersRef.current());
        canvas.on("selection:cleared", () => refreshLayersRef.current());
        canvas.on("object:added", () => refreshLayersRef.current());
        canvas.on("object:removed", () => refreshLayersRef.current());

        canvas.requestRenderAll();
        pushUndoRef.current();
        refreshLayersRef.current();
        if (!cancelled) setReady(true);
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

  /** Apply a saved CustomSheet diff onto the live canvas (base textboxes + user objects). */
  const applyCustomData = async (data: CustomSheetData) => {
    const c = fabricRef.current;
    if (!c) return;
    applyingRef.current = true;
    try {
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
            strokeWidth: o.strokeWidth ?? 3,
            opacity: o.opacity ?? 1,
          });
          setMeta(r, { kind: "user", id: o.id });
          c.add(r);
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

  const addShape = (kind: "rect" | "circle" | "ellipse" | "line") => {
    const c = fabricRef.current;
    if (!c || !isPlus) return;
    pushUndo();
    let obj: FabricObject;
    if (kind === "rect") {
      obj = new Rect({
        left: 240,
        top: 220,
        width: 120,
        height: 80,
        fill: "transparent",
        stroke: fill,
        strokeWidth: 3,
      });
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
    if (metaOf(obj).kind === "base-edit") {
      setStatus("Base text can’t be deleted — clear or edit it instead");
      return;
    }
    pushUndo();
    c.remove(obj);
    c.requestRenderAll();
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
      const thumbUrl = fabricRef.current?.toDataURL({ format: "png", multiplier: 0.25 }) ?? null;
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
                <style dangerouslySetInnerHTML={{ __html: GOSPEL_SHEET_CSS }} />
                <div
                  ref={liveHostRef}
                  className="pointer-events-none absolute inset-0 origin-top-left"
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
              🔒 Base sheet locked · {sheet.key}
              {liveHtmlBase ? " · live" : ""}
            </div>
          </div>
        </div>
        {status ? <p className="mt-2 text-sm text-[#6b7280]">{status}</p> : null}
        {selectedLabel ? <p className="mt-1 text-xs text-[#9ca3af]">Selected: {selectedLabel}</p> : null}
      </div>

      {/* Right: layers + saved */}
      <aside className="rounded-2xl border border-[#e8e0d6] bg-[#fdfaf7] p-3">
        <h2 className="m-0 text-sm font-bold text-[#1c1c1c]">Layers</h2>
        <ul className="mt-2 max-h-64 list-none space-y-1 overflow-y-auto p-0 text-sm">
          {layers.map((l) => (
            <li key={l.key} className="rounded-lg border border-[#ece7e1] bg-white px-2 py-1.5">
              {l.label}
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
