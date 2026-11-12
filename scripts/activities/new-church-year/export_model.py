#!/usr/bin/env python3
"""Export the 'Happy New Church Year' sheet as an editable element model (JSON).

Runs build_sheet.draw_page() against a recording canvas, so every line, dot, shape
and text in the PDF becomes its own element with the exact same geometry.
Coordinates are PDF points in SVG space (origin top-left, y down), page 612 x 792.
Dashed write-in lines are expanded into one element per dot so each dot is editable.

  python scripts/activities/new-church-year/export_model.py
  -> src/data/activities/happy-new-church-year.model.json (served only by the Plus editor API)
"""
from __future__ import annotations

import functools
import json
import math
import sys
import tempfile
from pathlib import Path

from reportlab.lib.colors import Color
from reportlab.pdfgen import canvas as rl_canvas

ROOT = Path(__file__).resolve().parent
sys.path.insert(0, str(ROOT))
import build_sheet as bs  # noqa: E402

PAGE_H = 792.0

# The shipped PDFs embed only the Regular faces (Baloo2-Bold.ttf shares the Regular face
# name, so ReportLab reuses Baloo2-Regular). Record what the PDF actually shows: weight 400.
FONT_MAP = {
    "Baloo": ("baloo", 400),
    "Baloo-Bold": ("baloo", 400),
    "ComicRelief": ("comic", 400),
    "ComicRelief-Bold": ("comic", 700),
}


def r3(v: float) -> float:
    return round(float(v), 3)


def hexc(c) -> str:
    if c is None:
        return "none"
    if isinstance(c, Color):
        r, g, b = (max(0, min(255, round(x * 255))) for x in (c.red, c.green, c.blue))
        return f"#{r:02x}{g:02x}{b:02x}"
    raise TypeError(c)


def fy(y: float) -> float:
    return r3(PAGE_H - y)


class RecPath:
    def __init__(self):
        self.ops: list[str] = []

    def moveTo(self, x, y):
        self.ops.append(f"M{r3(x)} {fy(y)}")

    def lineTo(self, x, y):
        self.ops.append(f"L{r3(x)} {fy(y)}")

    def curveTo(self, x1, y1, x2, y2, x3, y3):
        self.ops.append(f"C{r3(x1)} {fy(y1)} {r3(x2)} {fy(y2)} {r3(x3)} {fy(y3)}")

    def close(self):
        self.ops.append("Z")

    def d(self) -> str:
        return " ".join(self.ops)


CAPS = {0: "butt", 1: "round", 2: "square"}
JOINS = {0: "miter", 1: "round", 2: "bevel"}


class RecCanvas(rl_canvas.Canvas):
    """Records drawing calls instead of (as well as) painting them."""

    def __init__(self, *a, **k):
        super().__init__(*a, **k)
        self.els: list[dict] = []
        self.g_fill = Color(0, 0, 0)
        self.g_stroke = Color(0, 0, 0)
        self.g_lw = 1.0
        self.g_cap = 0
        self.g_join = 0
        self.g_dash = None
        self.g_font = ("Baloo", 12)
        self.group = "Page"

    # --- state -------------------------------------------------------------
    def setFillColor(self, c, alpha=None):
        self.g_fill = c
        super().setFillColor(c, alpha)

    def setStrokeColor(self, c, alpha=None):
        self.g_stroke = c
        super().setStrokeColor(c, alpha)

    def setLineWidth(self, w):
        self.g_lw = w
        super().setLineWidth(w)

    def setLineCap(self, m):
        self.g_cap = m
        super().setLineCap(m)

    def setLineJoin(self, m):
        self.g_join = m
        super().setLineJoin(m)

    def setDash(self, array=[], phase=0):  # noqa: B006
        if array == [] or array is None:
            self.g_dash = None
        elif isinstance(array, (int, float)):
            self.g_dash = (float(array), float(phase))
        else:
            self.g_dash = tuple(array)
        super().setDash(array, phase)

    def setFont(self, name, size, leading=None):
        self.g_font = (name, size)
        super().setFont(name, size, leading)

    def beginPath(self):
        return RecPath()

    # --- helpers -------------------------------------------------------------
    def _paint(self, fill: int, stroke: int) -> dict:
        out = {"fill": hexc(self.g_fill) if fill else "none", "stroke": hexc(self.g_stroke) if stroke else "none"}
        if stroke:
            out["strokeWidth"] = r3(self.g_lw)
            out["lineCap"] = CAPS[self.g_cap]
            out["lineJoin"] = JOINS[self.g_join]
        return out

    def _add(self, el: dict):
        el["group"] = self.group
        self.els.append(el)

    # --- drawing -------------------------------------------------------------
    def rect(self, x, y, w, h, stroke=1, fill=0):
        if x == 0 and y == 0 and w >= 611 and h >= 791:
            return  # white paper background
        self._add({"kind": "rect", "x": r3(x), "y": fy(y + h), "w": r3(w), "h": r3(h), "rx": 0, **self._paint(fill, stroke)})

    def roundRect(self, x, y, w, h, radius, stroke=1, fill=0):
        self._add({"kind": "rect", "x": r3(x), "y": fy(y + h), "w": r3(w), "h": r3(h), "rx": r3(radius), **self._paint(fill, stroke)})

    def circle(self, x_cen, y_cen, r, stroke=1, fill=0):
        self._add({"kind": "circle", "cx": r3(x_cen), "cy": fy(y_cen), "r": r3(r), **self._paint(fill, stroke)})

    def line(self, x1, y1, x2, y2):
        paint = self._paint(0, 1)
        if self.g_dash:
            on, off = self.g_dash[0], self.g_dash[1] if len(self.g_dash) > 1 else self.g_dash[0]
            length = math.hypot(x2 - x1, y2 - y1)
            ux, uy = (x2 - x1) / length, (y2 - y1) / length
            t = 0.0
            while t < length - 1e-9:
                t1 = min(length, t + on)
                self._add({
                    "kind": "line", "name": "Dot",
                    "x1": r3(x1 + ux * t), "y1": fy(y1 + uy * t), "x2": r3(x1 + ux * t1), "y2": fy(y1 + uy * t1),
                    **paint,
                })
                t += on + off
            return
        self._add({"kind": "line", "x1": r3(x1), "y1": fy(y1), "x2": r3(x2), "y2": fy(y2), **paint})

    def drawPath(self, path, stroke=1, fill=0, fillMode=None, **kw):
        self._add({"kind": "path", "d": path.d(), **self._paint(fill, stroke)})

    def _text(self, x, y, text, anchor):
        family, weight = FONT_MAP[self.g_font[0]]
        self._add({
            "kind": "text", "x": r3(x), "y": fy(y), "text": text, "fontFamily": family, "fontWeight": weight,
            "fontSize": r3(self.g_font[1]), "anchor": anchor, "fill": hexc(self.g_fill), "stroke": "none",
        })

    def drawString(self, x, y, text, *a, **k):
        self._text(x, y, text, "start")

    def drawCentredString(self, x, y, text, *a, **k):
        self._text(x, y, text, "middle")

    def drawRightString(self, x, y, text, *a, **k):
        self._text(x, y, text, "end")


def grouped(label_fn):
    """Decorator factory: run a draw function with canvas.group set to a label."""
    def deco(fn):
        @functools.wraps(fn)
        def inner(c, *a, **k):
            prev = c.group
            c.group = label_fn(*a, **k) if callable(label_fn) else label_fn
            try:
                return fn(c, *a, **k)
            finally:
                c.group = prev
        return inner
    return deco


def patch_groups():
    bs.draw_header = grouped("Title")(bs.draw_header)
    bs.draw_footer = grouped("Footer")(bs.draw_footer)
    bs.draw_write_line = grouped(lambda x, y, label, end_x: f"Write-in: {label.rstrip(':')}")(bs.draw_write_line)
    bs.draw_key = grouped("Colour key")(bs.draw_key)
    bs.draw_wheel = grouped("Wheel")(bs.draw_wheel)
    bs.draw_cross = grouped("Centre cross")(bs.draw_cross)
    orig_label = bs.place_label_inside

    def label(c, cx, cy, r_in, r_out, w):
        prev = c.group
        c.group = f"Label: {w['name']}{' (' + w['hint'] + ')' if w['hint'] else ''}"
        try:
            orig_label(c, cx, cy, r_in, r_out, w)
        finally:
            c.group = prev
    bs.place_label_inside = label
    names = {"wreath": "Doodle: 4 candles", "star": "Doodle: star", "sprout": "Doodle: sprout",
             "leaf": "Doodle: leaf", "cross": "Doodle: cross", "sunrise": "Doodle: sunrise"}
    for key, fn in list(bs.DOODLES.items()):
        bs.DOODLES[key] = grouped(names[key])(fn)


def record(colored: bool) -> list[dict]:
    c = RecCanvas(str(Path(tempfile.gettempdir()) / "ckc-activity-rec.pdf"), pagesize=bs.letter)
    bs.draw_page(c, colored=colored)
    return c.els


def default_name(el: dict) -> str:
    if el.get("name"):
        return el["name"]
    k = el["kind"]
    if k == "text":
        return f"Text: {el['text'][:40]}"
    if k == "line":
        return "Line"
    if k == "circle":
        return "Circle"
    if k == "rect":
        return "Box"
    return "Shape"


def main() -> None:
    bs.register_fonts()
    patch_groups()
    bw = record(False)
    color = record(True)
    assert len(bw) == len(color), (len(bw), len(color))
    elements = []
    counters: dict[str, int] = {}
    for a, b in zip(bw, color):
        assert a["kind"] == b["kind"]
        el = dict(a)
        el["name"] = default_name(a)
        if a.get("fill") != b.get("fill"):
            el["palette"] = {"bw": a["fill"], "color": b["fill"]}
        prefix = {"text": "t", "line": "l", "circle": "c", "rect": "r", "path": "p"}[a["kind"]]
        counters[prefix] = counters.get(prefix, 0) + 1
        el["id"] = f"{prefix}{counters[prefix]}"
        elements.append(el)
    doc = {
        "version": 1,
        "slug": "happy-new-church-year",
        "title": "Happy New Church Year",
        "width": 612,
        "height": 792,
        "variant": "bw",
        "elements": elements,
    }
    out = ROOT.parents[2] / "src" / "data" / "activities" / "happy-new-church-year.model.json"
    out.write_text(json.dumps(doc, ensure_ascii=False, separators=(",", ":")) + "\n", encoding="utf-8")
    kinds: dict[str, int] = {}
    for e in elements:
        kinds[e["kind"]] = kinds.get(e["kind"], 0) + 1
    print(f"wrote {out} ({len(elements)} elements: {kinds}, palette on {sum(1 for e in elements if 'palette' in e)})")


if __name__ == "__main__":
    main()
