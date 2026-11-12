"use client";

import { ACTIVITY_VARIANT_LABELS, activityFileName, type ActivityVariant } from "@/lib/resource/activities";
import {
  ACTIVITY_FONTS,
  FONT_FACE_CSS,
  applyBox,
  bakedLine,
  boxesIntersect,
  estimateTextBounds,
  moved,
  nextId,
  paintedStrokeWidth,
  parseActivityDoc,
  rawBounds,
  resized,
  scaleOf,
  unionBoxes,
  withVariant,
  type ActivityDoc,
  type ActivityEl,
  type Box,
  type FontKey,
  type LineEl,
  type TextEl,
} from "@/lib/resource/activity-doc";
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";

type Props = {
  /** Original sheet from the Plus-checked editor API. */
  original: ActivityDoc;
};

type Tool = "select" | "text" | "line" | "dotted" | "rect" | "circle" | "dot";
type Handle = "nw" | "ne" | "sw" | "se" | "p1" | "p2";

type Drag =
  | { kind: "move"; base: ActivityDoc; ids: string[]; start: [number, number]; moved: boolean }
  | { kind: "resize"; base: ActivityDoc; ids: string[]; handle: Handle; from: Box; keepAspect: boolean }
  | { kind: "endpoint"; base: ActivityDoc; id: string; handle: "p1" | "p2" }
  | { kind: "marquee"; start: [number, number]; now: [number, number]; additive: boolean }
  | { kind: "draw"; tool: Exclude<Tool, "select" | "text" | "dot">; start: [number, number]; now: [number, number] };

type History = { doc: ActivityDoc; past: ActivityDoc[]; future: ActivityDoc[] };

const INK = "#141414";
const HISTORY_LIMIT = 150;
const DOT = { on: 1, off: 3, width: 1.1 };
const draftKey = (slug: string) => `ckc.activity.${slug}.draft.v1`;

const TOOLS: Array<{ id: Tool; label: string; hint: string }> = [
  { id: "select", label: "Select", hint: "Click to select, Shift+click to add, drag on empty paper to box-select, double-click to select a whole part" },
  { id: "text", label: "Text", hint: "Click on the page to add text" },
  { id: "line", label: "Line", hint: "Drag to draw a line" },
  { id: "dotted", label: "Dotted line", hint: "Drag to draw a dotted write-in line (each dot is its own element)" },
  { id: "rect", label: "Box", hint: "Drag to draw a box" },
  { id: "circle", label: "Circle", hint: "Drag to draw a circle" },
  { id: "dot", label: "Dot", hint: "Click to add a dot" },
];

const btn =
  "inline-flex items-center justify-center gap-1 rounded-full border border-[#e7e3de] bg-white px-3 py-1.5 text-sm font-medium text-[#1c1c1c] transition hover:bg-[#fffdfb] disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#d35400]";
const btnOn = "border-[#d35400] bg-[#fff6ef] text-[#b8470a]";
const primary =
  "inline-flex items-center justify-center gap-1 rounded-full bg-[#d35400] px-4 py-1.5 text-sm font-semibold text-white transition hover:bg-[#b8470a] disabled:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#d35400]";
const field = "w-full rounded-lg border border-[#e7e3de] bg-white px-2 py-1 text-sm text-[#1c1c1c]";
const label = "block text-xs font-semibold text-[#6b7280]";

const r2 = (n: number) => Math.round(n * 100) / 100;
const isTyping = (t: EventTarget | null) =>
  t instanceof HTMLElement && (t.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(t.tagName));

function elTransform(el: ActivityEl): string | undefined {
  const t = scaleOf(el);
  if (t.sx === 1 && t.sy === 1 && t.tx === 0 && t.ty === 0) return undefined;
  return `matrix(${t.sx} 0 0 ${t.sy} ${t.tx} ${t.ty})`;
}

function ElementShape({ el, hitWidth, textRef }: { el: ActivityEl; hitWidth?: number; textRef?: (n: SVGTextElement | null) => void }) {
  const transform = elTransform(el);
  const paint = {
    fill: el.kind === "line" ? "none" : el.fill,
    stroke: el.stroke,
    strokeWidth: el.stroke === "none" ? undefined : (el.strokeWidth ?? 1),
    strokeLinecap: el.lineCap,
    strokeLinejoin: el.lineJoin,
  };
  let shape: React.ReactNode;
  let hit: React.ReactNode = null;
  const hitProps = hitWidth
    ? { fill: "none", stroke: "transparent", strokeWidth: hitWidth / Math.sqrt(Math.abs(scaleOf(el).sx * scaleOf(el).sy) || 1), pointerEvents: "stroke" as const }
    : null;
  switch (el.kind) {
    case "path":
      shape = <path d={el.d} {...paint} />;
      if (hitProps) hit = <path d={el.d} {...hitProps} />;
      break;
    case "line":
      shape = <line x1={el.x1} y1={el.y1} x2={el.x2} y2={el.y2} {...paint} />;
      if (hitProps) hit = <line x1={el.x1} y1={el.y1} x2={el.x2} y2={el.y2} {...hitProps} strokeLinecap="round" />;
      break;
    case "rect":
      shape = <rect x={el.x} y={el.y} width={el.w} height={el.h} rx={el.rx || undefined} {...paint} />;
      if (hitProps) hit = <rect x={el.x} y={el.y} width={el.w} height={el.h} rx={el.rx || undefined} {...hitProps} />;
      break;
    case "circle":
      shape = <circle cx={el.cx} cy={el.cy} r={el.r} {...paint} />;
      if (hitProps) hit = <circle cx={el.cx} cy={el.cy} r={el.r} {...hitProps} />;
      break;
    case "text":
      shape = (
        <text
          ref={textRef}
          x={el.x}
          y={el.y}
          fill={el.fill}
          stroke={el.stroke === "none" ? undefined : el.stroke}
          strokeWidth={el.stroke === "none" ? undefined : el.strokeWidth}
          fontFamily={`"${ACTIVITY_FONTS[el.fontFamily].css}"`}
          fontWeight={el.fontWeight}
          fontSize={el.fontSize}
          textAnchor={el.anchor}
          style={{ whiteSpace: "pre" }}
        >
          {el.text}
        </text>
      );
      break;
  }
  return (
    <g data-el={el.id} transform={transform}>
      {shape}
      {hit}
    </g>
  );
}

/** The page as plain SVG (print copy and screen). */
function SheetSvg({ doc, className }: { doc: ActivityDoc; className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox={`0 0 ${doc.width} ${doc.height}`}
      className={className}
      style={{ fontSynthesis: "none" }}
      aria-hidden
    >
      <rect x={0} y={0} width={doc.width} height={doc.height} fill="#ffffff" />
      {doc.elements.map((el) => (
        <ElementShape key={el.id} el={el} />
      ))}
    </svg>
  );
}

function ColorField({
  id,
  text,
  value,
  onChange,
  noneLabel,
}: {
  id: string;
  text: string;
  value: string;
  onChange: (v: string) => void;
  noneLabel: string;
}) {
  const none = value === "none";
  const [last, setLast] = useState(none ? INK : value);
  useEffect(() => {
    if (value !== "none") setLast(value);
  }, [value]);
  return (
    <div>
      <label htmlFor={id} className={label}>
        {text}
      </label>
      <div className="mt-1 flex items-center gap-2">
        <input
          id={id}
          type="color"
          value={none ? last : value}
          disabled={none}
          onChange={(e) => onChange(e.target.value)}
          className="h-8 w-10 cursor-pointer rounded border border-[#e7e3de] bg-white p-0.5 disabled:opacity-40"
        />
        <label className="inline-flex items-center gap-1 text-xs text-[#4b5563]">
          <input type="checkbox" checked={none} onChange={(e) => onChange(e.target.checked ? "none" : last)} />
          {noneLabel}
        </label>
      </div>
    </div>
  );
}

function NumberField({
  id,
  text,
  value,
  onChange,
  step = 0.5,
  min,
}: {
  id: string;
  text: string;
  value: number;
  onChange: (v: number) => void;
  step?: number;
  min?: number;
}) {
  const [draft, setDraft] = useState(String(r2(value)));
  useEffect(() => setDraft(String(r2(value))), [value]);
  const apply = () => {
    const n = Number(draft);
    if (Number.isFinite(n) && (min === undefined || n >= min)) onChange(n);
    else setDraft(String(r2(value)));
  };
  return (
    <div>
      <label htmlFor={id} className={label}>
        {text}
      </label>
      <input
        id={id}
        type="number"
        step={step}
        min={min}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={apply}
        onKeyDown={(e) => {
          if (e.key === "Enter") apply();
        }}
        className={`${field} mt-1`}
      />
    </div>
  );
}

/**
 * Plus editor for an activity sheet. Every line, dot, shape and word of the page is its own
 * element: select, move, resize, delete, recolour, edit text, add new ones, undo / redo, reset,
 * then print or download a vector US Letter PDF. Edits stay on this device (localStorage).
 */
export function ActivitySheetEditor({ original }: Props) {
  const [hist, setHist] = useState<History>(() => ({ doc: original, past: [], future: [] }));
  const doc = hist.doc;
  const [selected, setSelected] = useState<string[]>([]);
  const [tool, setTool] = useState<Tool>("select");
  const [drag, setDrag] = useState<Drag | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [measureTick, setMeasureTick] = useState(0);
  const [scale, setScale] = useState(1);
  // Print copy lives directly under <body> so print CSS can hide the rest of the site.
  const [portalReady, setPortalReady] = useState(false);
  useEffect(() => setPortalReady(true), []);
  const svgRef = useRef<SVGSVGElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const textInputRef = useRef<HTMLInputElement>(null);
  const textNodes = useRef(new Map<string, SVGTextElement>());
  const clipboard = useRef<ActivityEl[]>([]);
  const restored = useRef(false);
  const lastDown = useRef<{ id: string; at: number } | null>(null);
  const textBase = useRef<ActivityDoc | null>(null);

  const byId = useMemo(() => new Map(doc.elements.map((e) => [e.id, e])), [doc.elements]);
  const selEls = useMemo(() => selected.map((id) => byId.get(id)).filter((e): e is ActivityEl => !!e), [selected, byId]);

  // --- history -------------------------------------------------------------
  const commit = useCallback((next: ActivityDoc, base?: ActivityDoc) => {
    setHist((h) => ({ doc: next, past: [...h.past, base ?? h.doc].slice(-HISTORY_LIMIT), future: [] }));
  }, []);
  const preview = useCallback((next: ActivityDoc) => setHist((h) => ({ ...h, doc: next })), []);
  const undo = useCallback(() => {
    setHist((h) => (h.past.length ? { doc: h.past[h.past.length - 1]!, past: h.past.slice(0, -1), future: [h.doc, ...h.future] } : h));
  }, []);
  const redo = useCallback(() => {
    setHist((h) => (h.future.length ? { doc: h.future[0]!, past: [...h.past, h.doc], future: h.future.slice(1) } : h));
  }, []);
  const updateEls = useCallback(
    (ids: string[], fn: (el: ActivityEl) => ActivityEl) => {
      const set = new Set(ids);
      commit({ ...doc, elements: doc.elements.map((el) => (set.has(el.id) ? fn(el) : el)) });
    },
    [doc, commit],
  );

  // --- fonts, size, draft ---------------------------------------------------
  useEffect(() => {
    let alive = true;
    const loads = (Object.keys(ACTIVITY_FONTS) as FontKey[]).flatMap((k) =>
      [400, 700].map((w) => document.fonts.load(`${w} 16px "${ACTIVITY_FONTS[k].css}"`).catch(() => [])),
    );
    void Promise.all(loads).then(() => alive && setMeasureTick((n) => n + 1));
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      const w = svgRef.current?.getBoundingClientRect().width ?? 0;
      if (w) setScale(w / doc.width);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [doc.width]);

  useEffect(() => {
    if (restored.current) return;
    restored.current = true;
    try {
      const raw = window.localStorage.getItem(draftKey(original.slug));
      const draft = raw ? parseActivityDoc(JSON.parse(raw)) : null;
      if (draft && draft.slug === original.slug && JSON.stringify(draft) !== JSON.stringify(original)) {
        setHist({ doc: draft, past: [], future: [] });
        setNotice("Your last edits on this device are back. Use Reset to start from the original sheet.");
      }
    } catch {
      /* storage blocked or bad JSON: start from the original */
    }
  }, [original]);

  useEffect(() => {
    if (!restored.current) return;
    const t = window.setTimeout(() => {
      try {
        window.localStorage.setItem(draftKey(doc.slug), JSON.stringify(doc));
      } catch {
        /* quota or blocked: editing still works */
      }
    }, 400);
    return () => window.clearTimeout(t);
  }, [doc]);

  // --- geometry -------------------------------------------------------------
  const boundsOf = useCallback(
    (el: ActivityEl): Box => {
      if (el.kind !== "text") return applyBox(el, rawBounds(el));
      const node = textNodes.current.get(el.id);
      try {
        const b = node?.getBBox();
        if (b && (b.width || b.height)) return applyBox(el, { x: b.x, y: b.y, w: b.width, h: b.height });
      } catch {
        /* not rendered yet */
      }
      return applyBox(el, estimateTextBounds(el));
    },
    // measureTick: re-measure text after fonts load
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [measureTick],
  );
  const selBox = useMemo(() => unionBoxes(selEls.map(boundsOf)), [selEls, boundsOf]);
  const textSelected = selEls.some((el) => el.kind === "text");
  // Text boxes come from the DOM: measure again once the edited text has rendered.
  useLayoutEffect(() => {
    if (textSelected) setMeasureTick((n) => n + 1);
  }, [doc, textSelected]);

  const toPage = useCallback((e: { clientX: number; clientY: number }): [number, number] => {
    const svg = svgRef.current;
    const m = svg?.getScreenCTM();
    if (!svg || !m) return [0, 0];
    const p = new DOMPoint(e.clientX, e.clientY).matrixTransform(m.inverse());
    return [p.x, p.y];
  }, []);

  // --- adding ----------------------------------------------------------------
  const addElements = useCallback(
    (els: ActivityEl[]) => {
      if (!els.length) return;
      commit({ ...doc, elements: [...doc.elements, ...els] });
      setSelected(els.map((e) => e.id));
    },
    [doc, commit],
  );

  const makeDotted = useCallback(
    (a: [number, number], b: [number, number], groupName: string): LineEl[] => {
      const len = Math.hypot(b[0] - a[0], b[1] - a[1]);
      if (len < 2) return [];
      const ux = (b[0] - a[0]) / len;
      const uy = (b[1] - a[1]) / len;
      const out: LineEl[] = [];
      let probe = { ...doc, elements: [...doc.elements] };
      for (let t = 0; t < len - 1e-6 && out.length < 400; t += DOT.on + DOT.off) {
        const t1 = Math.min(len, t + DOT.on);
        const id = nextId(probe, "l");
        const el: LineEl = {
          id,
          kind: "line",
          name: "Dot",
          group: groupName,
          x1: r2(a[0] + ux * t),
          y1: r2(a[1] + uy * t),
          x2: r2(a[0] + ux * t1),
          y2: r2(a[1] + uy * t1),
          fill: "none",
          stroke: INK,
          strokeWidth: DOT.width,
          lineCap: "butt",
          lineJoin: "miter",
        };
        out.push(el);
        probe = { ...probe, elements: [...probe.elements, el] };
      }
      return out;
    },
    [doc],
  );

  const addedGroup = useCallback(
    (what: string) => {
      const prefix = `Added ${what} `;
      const n = new Set(doc.elements.filter((e) => e.group.startsWith(prefix)).map((e) => e.group)).size;
      return `${prefix}${n + 1}`;
    },
    [doc.elements],
  );

  const finishDraw = useCallback(
    (d: Extract<Drag, { kind: "draw" }>) => {
      let [x0, y0] = d.start;
      let [x1, y1] = d.now;
      const tiny = Math.hypot(x1 - x0, y1 - y0) < 3;
      if (tiny) {
        x1 = x0 + (d.tool === "circle" ? 30 : 120);
        y1 = d.tool === "line" || d.tool === "dotted" ? y0 : y0 + (d.tool === "circle" ? 30 : 60);
      }
      const base = { fill: "none", stroke: INK, strokeWidth: 1.6, lineCap: "round" as const, lineJoin: "round" as const };
      if (d.tool === "dotted") {
        addElements(makeDotted([x0, y0], [x1, y1], addedGroup("dotted line")));
      } else if (d.tool === "line") {
        addElements([{ id: nextId(doc, "l"), kind: "line", name: "Line", group: addedGroup("line"), x1: x0, y1: y0, x2: x1, y2: y1, ...base }]);
      } else if (d.tool === "rect") {
        if (x1 < x0) [x0, x1] = [x1, x0];
        if (y1 < y0) [y0, y1] = [y1, y0];
        addElements([
          { id: nextId(doc, "r"), kind: "rect", name: "Box", group: addedGroup("box"), x: x0, y: y0, w: x1 - x0, h: y1 - y0, rx: 3, ...base },
        ]);
      } else {
        const r = Math.max(2, Math.hypot(x1 - x0, y1 - y0) / (tiny ? 2 : 1));
        addElements([{ id: nextId(doc, "c"), kind: "circle", name: "Circle", group: addedGroup("circle"), cx: x0, cy: y0, r, ...base }]);
      }
      setTool("select");
    },
    [doc, addElements, makeDotted, addedGroup],
  );

  // --- pointer ---------------------------------------------------------------
  const onPointerDown = (e: React.PointerEvent<SVGSVGElement>) => {
    if (e.button !== 0) return;
    const p = toPage(e);
    const target = e.target as Element;
    const handle = target.closest("[data-handle]")?.getAttribute("data-handle") as Handle | null;
    const elId = target.closest("[data-el]")?.getAttribute("data-el") ?? null;
    (e.currentTarget as SVGSVGElement).setPointerCapture(e.pointerId);

    if (tool === "text") {
      const el: TextEl = {
        id: nextId(doc, "t"),
        kind: "text",
        name: "Text",
        group: addedGroup("text"),
        x: r2(p[0]),
        y: r2(p[1]),
        text: "Text",
        fontFamily: "comic",
        fontWeight: 400,
        fontSize: 14,
        anchor: "start",
        fill: INK,
        stroke: "none",
      };
      addElements([el]);
      setTool("select");
      window.setTimeout(() => textInputRef.current?.select(), 30);
      return;
    }
    if (tool === "dot") {
      addElements([
        { id: nextId(doc, "c"), kind: "circle", name: "Dot", group: addedGroup("dot"), cx: r2(p[0]), cy: r2(p[1]), r: 1.2, fill: INK, stroke: "none" },
      ]);
      return;
    }
    if (tool !== "select") {
      setDrag({ kind: "draw", tool, start: p, now: p });
      return;
    }
    if (handle && selBox) {
      if ((handle === "p1" || handle === "p2") && selEls.length === 1 && selEls[0]!.kind === "line") {
        setDrag({ kind: "endpoint", base: doc, id: selEls[0]!.id, handle });
      } else {
        setDrag({
          kind: "resize",
          base: doc,
          ids: selected,
          handle,
          from: selBox,
          keepAspect: selEls.some((el) => el.kind === "text"),
        });
      }
      return;
    }
    if (elId) {
      // Double click (pointer capture retargets dblclick, so detect it here): select the whole part.
      const now = Date.now();
      const isDouble = lastDown.current?.id === elId && now - lastDown.current.at < 380;
      lastDown.current = isDouble ? null : { id: elId, at: now };
      if (isDouble && !e.shiftKey) {
        const el = byId.get(elId);
        if (el?.kind === "text" && selected.length === 1 && selected[0] === elId) {
          window.setTimeout(() => textInputRef.current?.select(), 0);
        } else if (el) {
          setSelected(doc.elements.filter((x) => x.group === el.group).map((x) => x.id));
        }
        return;
      }
      let ids = selected;
      if (e.shiftKey) {
        ids = selected.includes(elId) ? selected.filter((i) => i !== elId) : [...selected, elId];
        setSelected(ids);
        return;
      }
      if (!selected.includes(elId)) {
        ids = [elId];
        setSelected(ids);
      }
      setDrag({ kind: "move", base: doc, ids, start: p, moved: false });
      return;
    }
    setDrag({ kind: "marquee", start: p, now: p, additive: e.shiftKey });
    if (!e.shiftKey) setSelected([]);
  };

  const onPointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!drag) return;
    const p = toPage(e);
    if (drag.kind === "move") {
      let dx = p[0] - drag.start[0];
      let dy = p[1] - drag.start[1];
      if (e.shiftKey) {
        if (Math.abs(dx) > Math.abs(dy)) dy = 0;
        else dx = 0;
      }
      if (!drag.moved && Math.hypot(dx, dy) * scale < 3) return;
      const set = new Set(drag.ids);
      preview({ ...drag.base, elements: drag.base.elements.map((el) => (set.has(el.id) ? moved(el, dx, dy) : el)) });
      if (!drag.moved) setDrag({ ...drag, moved: true });
    } else if (drag.kind === "resize") {
      const f = drag.from;
      const left = drag.handle === "nw" || drag.handle === "sw";
      const top = drag.handle === "nw" || drag.handle === "ne";
      const ax = left ? f.x + f.w : f.x;
      const ay = top ? f.y + f.h : f.y;
      let w = Math.max(2, left ? ax - p[0] : p[0] - ax);
      let h = Math.max(2, top ? ay - p[1] : p[1] - ay);
      if ((drag.keepAspect || e.shiftKey) && f.w && f.h) {
        const k = Math.max(w / f.w, h / f.h);
        w = f.w * k;
        h = f.h * k;
      }
      const to: Box = { x: left ? ax - w : ax, y: top ? ay - h : ay, w: f.w ? w : 0, h: f.h ? h : 0 };
      const set = new Set(drag.ids);
      preview({ ...drag.base, elements: drag.base.elements.map((el) => (set.has(el.id) ? resized(el, f, to) : el)) });
    } else if (drag.kind === "endpoint") {
      preview({
        ...drag.base,
        elements: drag.base.elements.map((el) => {
          if (el.id !== drag.id || el.kind !== "line") return el;
          const b = bakedLine(el);
          return drag.handle === "p1" ? { ...b, x1: p[0], y1: p[1] } : { ...b, x2: p[0], y2: p[1] };
        }),
      });
    } else {
      setDrag({ ...drag, now: p });
    }
  };

  const onPointerUp = () => {
    const d = drag;
    setDrag(null);
    if (!d) return;
    if (d.kind === "move") {
      if (d.moved) commit(doc, d.base);
    } else if (d.kind === "resize" || d.kind === "endpoint") {
      if (doc !== d.base) commit(doc, d.base);
    } else if (d.kind === "marquee") {
      const box: Box = {
        x: Math.min(d.start[0], d.now[0]),
        y: Math.min(d.start[1], d.now[1]),
        w: Math.abs(d.now[0] - d.start[0]),
        h: Math.abs(d.now[1] - d.start[1]),
      };
      if (box.w * scale < 3 && box.h * scale < 3) return;
      const inside = doc.elements
        .filter((el) => {
          const b = boundsOf(el);
          return boxesIntersect(box, b) && b.x >= box.x && b.y >= box.y && b.x + b.w <= box.x + box.w && b.y + b.h <= box.y + box.h;
        })
        .map((el) => el.id);
      setSelected((prev) => (d.additive ? [...new Set([...prev, ...inside])] : inside));
    } else if (d.kind === "draw") {
      finishDraw(d);
    }
  };

  // --- commands -------------------------------------------------------------
  const deleteSelected = useCallback(() => {
    if (!selected.length) return;
    const set = new Set(selected);
    commit({ ...doc, elements: doc.elements.filter((el) => !set.has(el.id)) });
    setSelected([]);
  }, [doc, selected, commit]);

  const duplicate = useCallback(
    (els: ActivityEl[], offset = 10) => {
      if (!els.length) return;
      let probe = doc;
      const copies: ActivityEl[] = [];
      for (const el of els) {
        const id = nextId(probe, el.id.replace(/\d+$/, "") || "e");
        const copy = { ...moved(el, offset, offset), id } as ActivityEl;
        copies.push(copy);
        probe = { ...probe, elements: [...probe.elements, copy] };
      }
      addElements(copies);
    },
    [doc, addElements],
  );

  const nudge = useCallback(
    (dx: number, dy: number) => {
      if (selected.length) updateEls(selected, (el) => moved(el, dx, dy));
    },
    [selected, updateEls],
  );

  const reorder = useCallback(
    (where: "front" | "back" | "up" | "down") => {
      if (!selected.length) return;
      const set = new Set(selected);
      const els = [...doc.elements];
      if (where === "front" || where === "back") {
        const picked = els.filter((e) => set.has(e.id));
        const rest = els.filter((e) => !set.has(e.id));
        commit({ ...doc, elements: where === "front" ? [...rest, ...picked] : [...picked, ...rest] });
        return;
      }
      if (where === "up") {
        for (let i = els.length - 2; i >= 0; i--) {
          if (set.has(els[i]!.id) && !set.has(els[i + 1]!.id)) [els[i], els[i + 1]] = [els[i + 1]!, els[i]!];
        }
      } else {
        for (let i = 1; i < els.length; i++) {
          if (set.has(els[i]!.id) && !set.has(els[i - 1]!.id)) [els[i], els[i - 1]] = [els[i - 1]!, els[i]!];
        }
      }
      commit({ ...doc, elements: els });
    },
    [doc, selected, commit],
  );

  const setVariant = (v: ActivityVariant) => {
    if (v !== doc.variant) commit(withVariant(doc, v));
  };

  const reset = () => {
    if (!window.confirm("Start over from the original sheet? Your edits on this device will be cleared (you can still Undo).")) return;
    commit(withVariant(original, doc.variant));
    setSelected([]);
    setNotice(null);
    try {
      window.localStorage.removeItem(draftKey(original.slug));
    } catch {
      /* ignore */
    }
  };

  const downloadPdf = async () => {
    setBusy(true);
    try {
      const { downloadActivityPdf } = await import("@/lib/resource/activity-pdf");
      await downloadActivityPdf(doc, activityFileName(doc, doc.variant, "-custom"));
    } catch (err) {
      console.error("[activity editor] pdf", err);
      window.alert("Could not make the PDF right now. Please try again, or use Print.");
    } finally {
      setBusy(false);
    }
  };

  const print = () => {
    setSelected([]);
    window.setTimeout(() => window.print(), 50);
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (isTyping(e.target)) return;
      const mod = e.metaKey || e.ctrlKey;
      const k = e.key.toLowerCase();
      if (mod && k === "z") {
        e.preventDefault();
        if (e.shiftKey) redo();
        else undo();
      } else if (mod && k === "y") {
        e.preventDefault();
        redo();
      } else if (mod && k === "a") {
        e.preventDefault();
        setSelected(doc.elements.map((el) => el.id));
      } else if (mod && k === "d") {
        e.preventDefault();
        duplicate(selEls);
      } else if (mod && k === "c") {
        clipboard.current = selEls;
      } else if (mod && k === "v") {
        e.preventDefault();
        duplicate(clipboard.current, 14);
      } else if (e.key === "Delete" || e.key === "Backspace") {
        if (selected.length) {
          e.preventDefault();
          deleteSelected();
        }
      } else if (e.key === "Escape") {
        setSelected([]);
        setTool("select");
      } else if (e.key.startsWith("Arrow") && selected.length) {
        e.preventDefault();
        const s = e.shiftKey ? 10 : 1;
        nudge(e.key === "ArrowLeft" ? -s : e.key === "ArrowRight" ? s : 0, e.key === "ArrowUp" ? -s : e.key === "ArrowDown" ? s : 0);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [doc, selected, selEls, undo, redo, duplicate, deleteSelected, nudge]);

  // --- inspector values ---------------------------------------------------------
  const one = selEls.length === 1 ? selEls[0]! : null;
  const first = selEls[0] ?? null;
  const texts = selEls.filter((el): el is TextEl => el.kind === "text");
  const fillable = selEls.filter((el) => el.kind !== "line");
  const strokeable = selEls;
  const groups = useMemo(() => {
    const m = new Map<string, ActivityEl[]>();
    for (const el of doc.elements) {
      const list = m.get(el.group);
      if (list) list.push(el);
      else m.set(el.group, [el]);
    }
    return [...m.entries()];
  }, [doc.elements]);

  const setBox = (patch: Partial<Box>) => {
    if (!selBox) return;
    const to = { ...selBox, ...patch };
    if (texts.length && (patch.w !== undefined || patch.h !== undefined) && selBox.w && selBox.h) {
      const k = patch.w !== undefined ? patch.w / selBox.w : (patch.h ?? selBox.h) / selBox.h;
      to.w = selBox.w * k;
      to.h = selBox.h * k;
    }
    updateEls(selected, (el) => resized(el, selBox, to));
  };

  // --- overlay -------------------------------------------------------------------
  const hs = 9 / scale; // handle size in page points
  const hitWidth = Math.max(6, 10 / scale);
  const marquee =
    drag?.kind === "marquee"
      ? {
          x: Math.min(drag.start[0], drag.now[0]),
          y: Math.min(drag.start[1], drag.now[1]),
          w: Math.abs(drag.now[0] - drag.start[0]),
          h: Math.abs(drag.now[1] - drag.start[1]),
        }
      : null;
  const drawPreview = drag?.kind === "draw" ? drag : null;
  const lineEnds =
    one && one.kind === "line"
      ? {
          p1: [scaleOf(one).sx * one.x1 + scaleOf(one).tx, scaleOf(one).sy * one.y1 + scaleOf(one).ty] as const,
          p2: [scaleOf(one).sx * one.x2 + scaleOf(one).tx, scaleOf(one).sy * one.y2 + scaleOf(one).ty] as const,
        }
      : null;

  const toolHint = TOOLS.find((t) => t.id === tool)?.hint ?? "";

  return (
    <div className="ckc-activity-editor">
      <style
        dangerouslySetInnerHTML={{
          __html: `${FONT_FACE_CSS}
@media screen{.ckc-activity-print{display:none}}
@media print{@page{size:letter;margin:0}html,body{background:#fff!important;margin:0!important;padding:0!important}
body>*:not(.ckc-activity-print){display:none!important}
.ckc-activity-print{display:block!important;width:8.5in;height:11in;margin:0;overflow:hidden;break-inside:avoid}
.ckc-activity-print svg{width:8.5in;height:11in;display:block}}`,
        }}
      />

      <div className="sticky top-0 z-20 -mx-1 flex flex-wrap items-center gap-1.5 border-b border-[#efe6da] bg-white/95 px-1 py-2 backdrop-blur">
        <div role="toolbar" aria-label="Tools" className="flex flex-wrap gap-1">
          {TOOLS.map((t) => (
            <button
              key={t.id}
              type="button"
              title={t.hint}
              aria-pressed={tool === t.id}
              onClick={() => setTool(t.id)}
              className={`${btn} ${tool === t.id ? btnOn : ""}`}
            >
              {t.label}
            </button>
          ))}
        </div>
        <span className="mx-1 hidden h-6 w-px bg-[#e7e3de] sm:block" aria-hidden />
        <button type="button" className={btn} onClick={undo} disabled={!hist.past.length} title="Undo (Ctrl+Z)">
          ↶ Undo
        </button>
        <button type="button" className={btn} onClick={redo} disabled={!hist.future.length} title="Redo (Ctrl+Shift+Z)">
          ↷ Redo
        </button>
        <button type="button" className={btn} onClick={reset} title="Back to the original sheet">
          Reset
        </button>
        <span className="mx-1 hidden h-6 w-px bg-[#e7e3de] sm:block" aria-hidden />
        <div role="group" aria-label="Sheet style" className="flex gap-1">
          {(["bw", "color"] as const).map((v) => (
            <button key={v} type="button" aria-pressed={doc.variant === v} onClick={() => setVariant(v)} className={`${btn} ${doc.variant === v ? btnOn : ""}`}>
              {ACTIVITY_VARIANT_LABELS[v]}
            </button>
          ))}
        </div>
        <div className="ml-auto flex gap-1.5">
          <button type="button" className={btn} onClick={print}>
            🖨 Print
          </button>
          <button type="button" className={primary} onClick={() => void downloadPdf()} disabled={busy}>
            {busy ? "Making PDF…" : "⬇ Download PDF"}
          </button>
        </div>
      </div>

      <p className="m-0 mt-2 text-xs text-[#6b7280]" aria-live="polite">
        {toolHint}
      </p>
      {notice ? (
        <p className="m-0 mt-2 rounded-lg border border-[#e8e0d6] bg-[#fdfaf7] px-3 py-2 text-xs text-[#4b5563]">{notice}</p>
      ) : null}

      <div className="mt-3 grid gap-4 lg:grid-cols-[minmax(0,1fr)_17rem]">
        <div ref={wrapRef} className="min-w-0 rounded-2xl border border-[#e8e0d6] bg-[#f6f3ef] p-2 sm:p-4">
          <svg
            ref={svgRef}
            xmlns="http://www.w3.org/2000/svg"
            viewBox={`0 0 ${doc.width} ${doc.height}`}
            className="mx-auto block h-auto w-full max-w-[816px] bg-white shadow-[0_6px_24px_rgba(28,28,28,0.12)]"
            style={{
              touchAction: "none",
              fontSynthesis: "none",
              userSelect: "none",
              WebkitUserSelect: "none",
              cursor: tool === "select" ? "default" : "crosshair",
            }}
            role="application"
            aria-label="Sheet editor. Select an element, then use the panel to change it."
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
          >
            <rect x={0} y={0} width={doc.width} height={doc.height} fill="#ffffff" />
            {doc.elements.map((el) => (
              <ElementShape
                key={el.id}
                el={el}
                hitWidth={hitWidth}
                textRef={
                  el.kind === "text"
                    ? (n) => {
                        if (n) textNodes.current.set(el.id, n);
                        else textNodes.current.delete(el.id);
                      }
                    : undefined
                }
              />
            ))}

            <g pointerEvents="none">
              {selEls.length > 1 &&
                selEls.map((el) => {
                  const b = boundsOf(el);
                  return (
                    <rect key={`o-${el.id}`} x={b.x - 1} y={b.y - 1} width={b.w + 2} height={b.h + 2} fill="none" stroke="#d35400" strokeOpacity={0.45} strokeWidth={0.6 / scale} />
                  );
                })}
              {selBox ? (
                <rect
                  x={selBox.x - 2}
                  y={selBox.y - 2}
                  width={selBox.w + 4}
                  height={selBox.h + 4}
                  fill="none"
                  stroke="#d35400"
                  strokeWidth={1.2 / scale}
                  strokeDasharray={`${4 / scale} ${3 / scale}`}
                />
              ) : null}
              {marquee ? (
                <rect x={marquee.x} y={marquee.y} width={marquee.w} height={marquee.h} fill="#d35400" fillOpacity={0.06} stroke="#d35400" strokeWidth={1 / scale} />
              ) : null}
              {drawPreview ? (
                drawPreview.tool === "rect" ? (
                  <rect
                    x={Math.min(drawPreview.start[0], drawPreview.now[0])}
                    y={Math.min(drawPreview.start[1], drawPreview.now[1])}
                    width={Math.abs(drawPreview.now[0] - drawPreview.start[0])}
                    height={Math.abs(drawPreview.now[1] - drawPreview.start[1])}
                    fill="none"
                    stroke={INK}
                    strokeWidth={1.6}
                  />
                ) : drawPreview.tool === "circle" ? (
                  <circle
                    cx={drawPreview.start[0]}
                    cy={drawPreview.start[1]}
                    r={Math.hypot(drawPreview.now[0] - drawPreview.start[0], drawPreview.now[1] - drawPreview.start[1])}
                    fill="none"
                    stroke={INK}
                    strokeWidth={1.6}
                  />
                ) : (
                  <line
                    x1={drawPreview.start[0]}
                    y1={drawPreview.start[1]}
                    x2={drawPreview.now[0]}
                    y2={drawPreview.now[1]}
                    stroke={INK}
                    strokeWidth={drawPreview.tool === "dotted" ? DOT.width : 1.6}
                    strokeDasharray={drawPreview.tool === "dotted" ? `${DOT.on} ${DOT.off}` : undefined}
                  />
                )
              ) : null}
            </g>

            {selBox && tool === "select" && !drag ? (
              <g>
                {lineEnds
                  ? (["p1", "p2"] as const).map((h) => (
                      <circle
                        key={h}
                        data-handle={h}
                        cx={lineEnds[h][0]}
                        cy={lineEnds[h][1]}
                        r={hs / 2}
                        fill="#ffffff"
                        stroke="#d35400"
                        strokeWidth={1.2 / scale}
                        style={{ cursor: "move" }}
                      />
                    ))
                  : (
                      [
                        ["nw", selBox.x - 2, selBox.y - 2, "nwse-resize"],
                        ["ne", selBox.x + selBox.w + 2, selBox.y - 2, "nesw-resize"],
                        ["sw", selBox.x - 2, selBox.y + selBox.h + 2, "nesw-resize"],
                        ["se", selBox.x + selBox.w + 2, selBox.y + selBox.h + 2, "nwse-resize"],
                      ] as const
                    ).map(([h, x, y, cursor]) => (
                      <rect
                        key={h}
                        data-handle={h}
                        x={x - hs / 2}
                        y={y - hs / 2}
                        width={hs}
                        height={hs}
                        rx={1 / scale}
                        fill="#ffffff"
                        stroke="#d35400"
                        strokeWidth={1.2 / scale}
                        style={{ cursor }}
                      />
                    ))}
              </g>
            ) : null}
          </svg>
          <p className="m-0 mt-2 text-center text-[11px] text-[#9ca3af]">
            Delete removes · arrows nudge (Shift = 10) · Ctrl+D duplicates · Ctrl+Z / Ctrl+Shift+Z undo and redo
          </p>
        </div>

        <aside aria-label="Selected element" className="space-y-4 text-sm">
          <section className="rounded-2xl border border-[#e8e0d6] bg-white p-3">
            {!selEls.length ? (
              <>
                <h2 className="m-0 text-sm font-bold text-[#1c1c1c]">Nothing selected</h2>
                <p className="m-0 mt-1 text-xs leading-relaxed text-[#6b7280]">
                  Click any line, dot, shape or word on the sheet. Double-click selects a whole part (a doodle, a write-in
                  line). Drag on empty paper to box-select.
                </p>
              </>
            ) : (
              <>
                <h2 className="m-0 truncate text-sm font-bold text-[#1c1c1c]">
                  {one ? one.name : `${selEls.length} elements selected`}
                </h2>
                <p className="m-0 mt-0.5 truncate text-xs text-[#6b7280]">{one ? one.group : "Changes apply to all of them"}</p>
                <div className="mt-2 flex flex-wrap gap-1">
                  {one ? (
                    <button
                      type="button"
                      className={`${btn} px-2 py-1 text-xs`}
                      onClick={() => setSelected(doc.elements.filter((x) => x.group === one.group).map((x) => x.id))}
                    >
                      Select whole part
                    </button>
                  ) : null}
                  <button type="button" className={`${btn} px-2 py-1 text-xs`} onClick={() => duplicate(selEls)}>
                    Duplicate
                  </button>
                  <button type="button" className={`${btn} px-2 py-1 text-xs text-[#b42318]`} onClick={deleteSelected}>
                    Delete
                  </button>
                </div>
                <div className="mt-2 flex flex-wrap gap-1">
                  <button type="button" className={`${btn} px-2 py-1 text-xs`} onClick={() => reorder("front")}>
                    To front
                  </button>
                  <button type="button" className={`${btn} px-2 py-1 text-xs`} onClick={() => reorder("up")}>
                    Forward
                  </button>
                  <button type="button" className={`${btn} px-2 py-1 text-xs`} onClick={() => reorder("down")}>
                    Backward
                  </button>
                  <button type="button" className={`${btn} px-2 py-1 text-xs`} onClick={() => reorder("back")}>
                    To back
                  </button>
                </div>
              </>
            )}
          </section>

          {one && one.kind === "text" ? (
            <section className="space-y-2 rounded-2xl border border-[#e8e0d6] bg-white p-3">
              <div>
                <label htmlFor="ae-text" className={label}>
                  Text
                </label>
                <input
                  id="ae-text"
                  ref={textInputRef}
                  value={one.text}
                  maxLength={500}
                  onFocus={() => {
                    textBase.current = doc;
                  }}
                  onChange={(e) => {
                    const v = e.target.value;
                    if (!textBase.current) textBase.current = doc;
                    preview({ ...doc, elements: doc.elements.map((x) => (x.id === one.id ? { ...x, text: v } : x)) });
                  }}
                  onBlur={() => {
                    const base = textBase.current;
                    textBase.current = null;
                    if (base && base !== doc) commit(doc, base);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === "Escape") (e.target as HTMLInputElement).blur();
                  }}
                  className={`${field} mt-1`}
                />
              </div>
            </section>
          ) : null}

          {texts.length ? (
            <section className="grid grid-cols-2 gap-2 rounded-2xl border border-[#e8e0d6] bg-white p-3">
              <div className="col-span-2">
                <label htmlFor="ae-font" className={label}>
                  Font
                </label>
                <select
                  id="ae-font"
                  value={texts[0]!.fontFamily}
                  onChange={(e) => updateEls(texts.map((t) => t.id), (el) => (el.kind === "text" ? { ...el, fontFamily: e.target.value as FontKey } : el))}
                  className={`${field} mt-1`}
                >
                  {(Object.keys(ACTIVITY_FONTS) as FontKey[]).map((k) => (
                    <option key={k} value={k}>
                      {ACTIVITY_FONTS[k].label}
                    </option>
                  ))}
                </select>
              </div>
              <NumberField
                id="ae-size"
                text="Size (pt)"
                min={4}
                value={texts[0]!.fontSize * Math.abs(scaleOf(texts[0]!).sy)}
                onChange={(v) =>
                  updateEls(texts.map((t) => t.id), (el) => (el.kind === "text" ? { ...el, fontSize: v / Math.abs(scaleOf(el).sy || 1) } : el))
                }
              />
              <div>
                <span className={label}>Style</span>
                <button
                  type="button"
                  aria-pressed={texts[0]!.fontWeight === 700}
                  className={`${btn} mt-1 w-full px-2 py-1 font-bold ${texts[0]!.fontWeight === 700 ? btnOn : ""}`}
                  onClick={() => {
                    const w = texts[0]!.fontWeight === 700 ? 400 : 700;
                    updateEls(texts.map((t) => t.id), (el) => (el.kind === "text" ? { ...el, fontWeight: w } : el));
                  }}
                >
                  Bold
                </button>
              </div>
              <div className="col-span-2">
                <span className={label}>Align</span>
                <div className="mt-1 flex gap-1">
                  {(["start", "middle", "end"] as const).map((a) => (
                    <button
                      key={a}
                      type="button"
                      aria-pressed={texts[0]!.anchor === a}
                      className={`${btn} flex-1 px-2 py-1 text-xs ${texts[0]!.anchor === a ? btnOn : ""}`}
                      onClick={() =>
                        updateEls(texts.map((t) => t.id), (el) => {
                          if (el.kind !== "text") return el;
                          // Keep the text where it is on the page when the anchor changes.
                          const b = boundsOf(el);
                          const t = scaleOf(el);
                          const px = a === "start" ? b.x : a === "middle" ? b.x + b.w / 2 : b.x + b.w;
                          return { ...el, anchor: a, x: (px - t.tx) / (t.sx || 1) };
                        })
                      }
                    >
                      {a === "start" ? "Left" : a === "middle" ? "Centre" : "Right"}
                    </button>
                  ))}
                </div>
              </div>
            </section>
          ) : null}

          {selEls.length ? (
            <section className="grid grid-cols-2 gap-2 rounded-2xl border border-[#e8e0d6] bg-white p-3">
              {fillable.length ? (
                <ColorField
                  id="ae-fill"
                  text={texts.length === fillable.length ? "Colour" : "Fill"}
                  value={fillable[0]!.fill}
                  noneLabel="None"
                  onChange={(v) => updateEls(fillable.map((x) => x.id), (el) => ({ ...el, fill: v }))}
                />
              ) : null}
              {strokeable.length ? (
                <ColorField
                  id="ae-stroke"
                  text="Line colour"
                  value={first!.stroke}
                  noneLabel="None"
                  onChange={(v) =>
                    updateEls(strokeable.map((x) => x.id), (el) => ({
                      ...el,
                      stroke: v,
                      strokeWidth: el.strokeWidth ?? (v === "none" ? undefined : 1),
                    }))
                  }
                />
              ) : null}
              {first && first.stroke !== "none" ? (
                <NumberField
                  id="ae-sw"
                  text="Line width (pt)"
                  min={0.1}
                  step={0.1}
                  value={paintedStrokeWidth(first)}
                  onChange={(v) =>
                    updateEls(strokeable.map((x) => x.id), (el) => ({
                      ...el,
                      strokeWidth: v / Math.sqrt(Math.abs(scaleOf(el).sx * scaleOf(el).sy) || 1),
                    }))
                  }
                />
              ) : null}
              {first && first.stroke !== "none" ? (
                <div>
                  <label htmlFor="ae-cap" className={label}>
                    Line ends
                  </label>
                  <select
                    id="ae-cap"
                    value={first.lineCap ?? "butt"}
                    onChange={(e) => updateEls(strokeable.map((x) => x.id), (el) => ({ ...el, lineCap: e.target.value as "butt" | "round" | "square" }))}
                    className={`${field} mt-1`}
                  >
                    <option value="butt">Flat</option>
                    <option value="round">Round</option>
                    <option value="square">Square</option>
                  </select>
                </div>
              ) : null}
            </section>
          ) : null}

          {selBox ? (
            <section className="grid grid-cols-2 gap-2 rounded-2xl border border-[#e8e0d6] bg-white p-3">
              <NumberField id="ae-x" text="X (pt)" value={selBox.x} onChange={(v) => setBox({ x: v })} />
              <NumberField id="ae-y" text="Y (pt)" value={selBox.y} onChange={(v) => setBox({ y: v })} />
              <NumberField id="ae-w" text="Width (pt)" min={0.5} value={selBox.w} onChange={(v) => setBox({ w: v })} />
              <NumberField id="ae-h" text="Height (pt)" min={0.5} value={selBox.h} onChange={(v) => setBox({ h: v })} />
              <p className="col-span-2 m-0 text-[11px] text-[#9ca3af]">Page is 612 × 792 pt (8.5 × 11 in).</p>
            </section>
          ) : null}

          <details className="rounded-2xl border border-[#e8e0d6] bg-white p-3">
            <summary className="cursor-pointer text-sm font-bold text-[#1c1c1c]">
              All parts ({doc.elements.length} elements)
            </summary>
            <ul className="m-0 mt-2 max-h-72 list-none space-y-1 overflow-auto p-0 text-xs">
              {groups.map(([g, els]) => (
                <li key={g}>
                  <button
                    type="button"
                    className="w-full truncate rounded-md px-2 py-1 text-left font-semibold text-[#1c1c1c] hover:bg-[#fff6ef]"
                    onClick={() => setSelected(els.map((x) => x.id))}
                  >
                    {g} <span className="font-normal text-[#9ca3af]">· {els.length}</span>
                  </button>
                  {els.length <= 12 ? (
                    <ul className="m-0 list-none p-0 pl-3">
                      {els.map((x) => (
                        <li key={x.id}>
                          <button
                            type="button"
                            aria-pressed={selected.includes(x.id)}
                            className={`w-full truncate rounded-md px-2 py-0.5 text-left text-[#4b5563] hover:bg-[#fff6ef] ${selected.includes(x.id) ? "bg-[#fff6ef] text-[#b8470a]" : ""}`}
                            onClick={(e) =>
                              setSelected((prev) => (e.shiftKey ? (prev.includes(x.id) ? prev.filter((i) => i !== x.id) : [...prev, x.id]) : [x.id]))
                            }
                          >
                            {x.name}
                          </button>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </li>
              ))}
            </ul>
          </details>
        </aside>
      </div>

      {portalReady
        ? createPortal(
            <div className="ckc-activity-print" aria-hidden>
              <SheetSvg doc={doc} />
            </div>,
            document.body,
          )
        : null}
    </div>
  );
}
