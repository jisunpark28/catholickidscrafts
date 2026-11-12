#!/usr/bin/env python3
"""US Letter 'Happy New Church Year' liturgical-year wheel (ReportLab).

  pip install reportlab && python scripts/activities/new-church-year/build_sheet.py
  -> assets/activities/happy-new-church-year/*.pdf (served only by the signed-in download route)
  Then run export_model.py to refresh the Plus editor model.

Printable activity sheet for catholickidscrafts review only.
Wedge sizes are simplified so every season is wide enough for kids
to colour and to label inside the ring. The new Church year still
begins on the First Sunday of Advent, 29 November 2026.
"""

from __future__ import annotations

import math
from pathlib import Path

from reportlab.lib.colors import Color, white
from reportlab.lib.pagesizes import letter
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfgen import canvas

ROOT = Path(__file__).resolve().parent
REPO = ROOT.parents[2]
# Same OFL font files the Plus editor uses (public/fonts/activities).
FONT_DIR = REPO / "public" / "fonts" / "activities"
OUT_DIR = REPO / "assets" / "activities" / "happy-new-church-year"

# Simplified shares for a kids' colouring wheel (not exact day counts).
# Advent / Christmas / first Ordinary Time are enlarged so a label fits inside.
SEASONS = [
    {"name": "Advent", "hint": "", "color_name": "Violet", "share": 0.09, "doodle": "wreath"},
    {"name": "Christmas", "hint": "", "color_name": "White or gold", "share": 0.08, "doodle": "star"},
    {"name": "Ordinary Time", "hint": "after Christmas", "color_name": "Green", "share": 0.09, "doodle": "sprout"},
    {"name": "Lent", "hint": "", "color_name": "Violet", "share": 0.13, "doodle": "cross"},
    {"name": "Easter", "hint": "", "color_name": "White or gold", "share": 0.14, "doodle": "sunrise"},
    {"name": "Ordinary Time", "hint": "after Pentecost", "color_name": "Green", "share": 0.47, "doodle": "leaf"},
]
assert abs(sum(s["share"] for s in SEASONS) - 1.0) < 1e-9

FILLS = {
    "Violet": Color(0.78, 0.70, 0.86),
    "White or gold": Color(0.98, 0.93, 0.72),
    "Green": Color(0.72, 0.85, 0.70),
}

INK = Color(0.08, 0.08, 0.08)
MUTED = Color(0.28, 0.28, 0.28)
MARGIN = 36  # 0.5 in
SAFE = 40
STROKE = 2.2


def register_fonts() -> None:
    pdfmetrics.registerFont(TTFont("Baloo", str(FONT_DIR / "Baloo2-Regular.ttf")))
    pdfmetrics.registerFont(TTFont("Baloo-Bold", str(FONT_DIR / "Baloo2-Bold.ttf")))
    pdfmetrics.registerFont(TTFont("ComicRelief", str(FONT_DIR / "ComicRelief-Regular.ttf")))
    pdfmetrics.registerFont(TTFont("ComicRelief-Bold", str(FONT_DIR / "ComicRelief-Bold.ttf")))


def std_from_clock(clock_deg: float) -> float:
    """Clock degrees (0 at 12 o'clock, clockwise) -> standard (0 at 3 o'clock, CCW)."""
    return 90.0 - clock_deg


def polar(cx: float, cy: float, r: float, clock_deg: float) -> tuple[float, float]:
    a = math.radians(std_from_clock(clock_deg))
    return cx + r * math.cos(a), cy + r * math.sin(a)


def _arc_delta(a0: float, a1: float, clockwise: bool) -> float:
    """Signed radian delta from a0 to a1 in the requested direction, in (-2π, 0] or [0, 2π)."""
    if clockwise:
        delta = (a0 - a1) % (2 * math.pi)
        return -delta if delta != 0 else 0.0
    delta = (a1 - a0) % (2 * math.pi)
    return delta


def add_arc(path, cx: float, cy: float, r: float, clock0: float, clock1: float, clockwise: bool) -> None:
    """Append a circular arc as cubic Beziers, continuing the current subpath.

    Do not use reportlab path.arc() here: that issues a moveTo and starts a
    new subpath, which breaks donut sectors into gaps and flat chords.
    """
    a = math.radians(std_from_clock(clock0))
    a_end = math.radians(std_from_clock(clock1))
    delta = _arc_delta(a, a_end, clockwise)
    if abs(delta) < 1e-12:
        return
    # Split into pieces of at most 90 degrees so the Bezier fit stays accurate.
    n = max(1, int(math.ceil(abs(delta) / (math.pi / 2 - 1e-9))))
    step = delta / n
    for _ in range(n):
        a2 = a + step
        k = (4.0 / 3.0) * math.tan(step / 4.0)
        x0, y0 = cx + r * math.cos(a), cy + r * math.sin(a)
        x3, y3 = cx + r * math.cos(a2), cy + r * math.sin(a2)
        # Tangent for increasing angle is (-sin, cos). For step<0 this still holds.
        x1 = x0 + k * r * (-math.sin(a))
        y1 = y0 + k * r * (math.cos(a))
        x2 = x3 - k * r * (-math.sin(a2))
        y2 = y3 - k * r * (math.cos(a2))
        path.curveTo(x1, y1, x2, y2, x3, y3)
        a = a2


def sector_path(c: canvas.Canvas, cx, cy, r_in, r_out, a0, a1):
    """Closed annular sector, clockwise from clock angle a0 to a1."""
    p = c.beginPath()
    x, y = polar(cx, cy, r_out, a0)
    p.moveTo(x, y)
    add_arc(p, cx, cy, r_out, a0, a1, clockwise=True)
    x, y = polar(cx, cy, r_in, a1)
    p.lineTo(x, y)
    add_arc(p, cx, cy, r_in, a1, a0, clockwise=False)
    p.close()
    return p


def season_wedges() -> list[dict]:
    a = 0.0
    wedges = []
    for s in SEASONS:
        extent = s["share"] * 360.0
        wedges.append({**s, "a0": a, "a1": a + extent, "mid": a + extent / 2, "extent": extent})
        a += extent
    # Snap the last edge to 360 so the ring closes exactly on the start ray.
    wedges[-1]["a1"] = 360.0
    wedges[-1]["mid"] = (wedges[-1]["a0"] + 360.0) / 2
    wedges[-1]["extent"] = 360.0 - wedges[-1]["a0"]
    return wedges


def draw_cross(c: canvas.Canvas, cx, cy, stem=26, arm=16, thickness=4.6):
    """A simple Latin cross (no corpus) for the hub."""
    c.setFillColor(INK)
    c.roundRect(cx - thickness / 2, cy - stem * 0.62, thickness, stem, 1.1, fill=1, stroke=0)
    c.roundRect(cx - arm / 2, cy + stem * 0.08, arm, thickness, 1.1, fill=1, stroke=0)


def fit_centered(c: canvas.Canvas, text: str, font: str, max_size: float, max_width: float) -> float:
    size = max_size
    while size > 8 and c.stringWidth(text, font, size) > max_width:
        size -= 0.5
    return size


def draw_header(c: canvas.Canvas, width: float, top: float) -> float:
    page_cx = width / 2
    title = "Happy New Church Year"
    size = fit_centered(c, title, "Baloo-Bold", 32, width - 2 * SAFE)
    c.setFillColor(INK)
    c.setFont("Baloo-Bold", size)
    # Baloo has a short descender; leave a full line of air before the subtitle.
    c.drawCentredString(page_cx, top - size, title)
    y = top - size - 22

    sub = "Colour the seasons of the Church year."
    c.setFont("Baloo", 13)
    c.setFillColor(INK)
    c.drawCentredString(page_cx, y, sub)
    y -= 20

    line = "The new Church year begins on the First Sunday of Advent — November 29, 2026."
    size2 = fit_centered(c, line, "ComicRelief", 11, width - 2 * SAFE)
    c.setFont("ComicRelief", size2)
    c.setFillColor(MUTED)
    c.drawCentredString(page_cx, y, line)
    return y - 12


# ---------------------------------------------------------------------------
# Small line-art doodles kids can colour. All are stroked, not filled.
# ---------------------------------------------------------------------------

def _set_doodle(c: canvas.Canvas, width=1.5) -> None:
    c.setStrokeColor(INK)
    c.setFillColor(INK)
    c.setLineWidth(width)
    c.setLineCap(1)
    c.setLineJoin(1)


def doodle_wreath(c: canvas.Canvas, x: float, y: float, s: float = 1.0) -> None:
    """Four simple Advent candles with little flames. No wreath or ring."""
    _set_doodle(c, 1.4)
    body_w = 3.0 * s
    body_h = 12.0 * s
    # Same horizontal spacing as the old candles, group centered on (x, y).
    by0 = y - 6.0 * s
    by1 = by0 + body_h
    for dx in (-7.2 * s, -2.4 * s, 2.4 * s, 7.2 * s):
        bx = x + dx
        c.roundRect(bx - body_w / 2, by0, body_w, body_h, 0.7 * s, fill=0, stroke=1)
        # short wick
        c.setLineWidth(1.1)
        c.line(bx, by1, bx, by1 + 1.2 * s)
        c.setLineWidth(1.4)
        # teardrop flame
        p = c.beginPath()
        p.moveTo(bx, by1 + 1.6 * s)
        p.curveTo(bx + 1.8 * s, by1 + 4.0 * s, bx + 0.2 * s, by1 + 7.0 * s, bx, by1 + 7.4 * s)
        p.curveTo(bx - 0.2 * s, by1 + 7.0 * s, bx - 1.8 * s, by1 + 4.0 * s, bx, by1 + 1.6 * s)
        p.close()
        c.drawPath(p, fill=0, stroke=1)


def doodle_star(c: canvas.Canvas, x: float, y: float, s: float = 1.0) -> None:
    """A 5-point star, outline only."""
    _set_doodle(c, 1.4)
    r_out = 11 * s
    r_in = 4.4 * s
    pts = []
    for i in range(10):
        r = r_out if i % 2 == 0 else r_in
        pts.append(polar(x, y, r, i * 36))
    p = c.beginPath()
    p.moveTo(*pts[0])
    for q in pts[1:]:
        p.lineTo(*q)
    p.close()
    c.drawPath(p, fill=0, stroke=1)


def doodle_sprout(c: canvas.Canvas, x: float, y: float, s: float = 1.0) -> None:
    """A little sprout: stem plus two clear leaves kids can colour."""
    _set_doodle(c, 1.5)
    c.line(x, y - 11 * s, x, y + 6 * s)
    def almond(tip, mid, back):
        p = c.beginPath()
        p.moveTo(*back)
        p.curveTo(mid[0], mid[1], tip[0] + (mid[0]-back[0])*0.15, tip[1] + (mid[1]-back[1])*0.15, *tip)
        # other side: mirror mid across back-tip axis is overkill; pass the other mid.
        return p
    # left leaf
    p = c.beginPath()
    p.moveTo(x, y - 1 * s)
    p.curveTo(x - 5 * s, y - 1 * s, x - 11 * s, y + 2 * s, x - 11 * s, y + 7 * s)
    p.curveTo(x - 6 * s, y + 8 * s, x - 2 * s, y + 5 * s, x, y + 2 * s)
    p.close()
    c.drawPath(p, fill=0, stroke=1)
    # right leaf, a little higher
    p = c.beginPath()
    p.moveTo(x, y + 1 * s)
    p.curveTo(x + 5 * s, y + 1 * s, x + 11 * s, y + 4 * s, x + 10.5 * s, y + 9 * s)
    p.curveTo(x + 6 * s, y + 10 * s, x + 2 * s, y + 7 * s, x, y + 4 * s)
    p.close()
    c.drawPath(p, fill=0, stroke=1)


def doodle_leaf(c: canvas.Canvas, x: float, y: float, s: float = 1.0) -> None:
    """A single simple leaf."""
    _set_doodle(c, 1.5)
    p = c.beginPath()
    p.moveTo(x, y - 11 * s)
    p.curveTo(x + 9 * s, y - 4 * s, x + 9 * s, y + 6 * s, x, y + 11 * s)
    p.curveTo(x - 9 * s, y + 6 * s, x - 9 * s, y - 4 * s, x, y - 11 * s)
    p.close()
    c.drawPath(p, fill=0, stroke=1)
    c.line(x, y - 10 * s, x, y + 10 * s)


def doodle_cross(c: canvas.Canvas, x: float, y: float, s: float = 1.0) -> None:
    """Outlined Latin cross (longer stem below the arm; no corpus)."""
    _set_doodle(c, 1.5)
    t = 2.8 * s
    top = y + 11 * s
    bot = y - 11 * s
    arm_c = y + 3.2 * s
    arm_y0, arm_y1 = arm_c - t, arm_c + t
    left, right = x - 8 * s, x + 8 * s
    p = c.beginPath()
    p.moveTo(x - t, bot)
    p.lineTo(x + t, bot)
    p.lineTo(x + t, arm_y0)
    p.lineTo(right, arm_y0)
    p.lineTo(right, arm_y1)
    p.lineTo(x + t, arm_y1)
    p.lineTo(x + t, top)
    p.lineTo(x - t, top)
    p.lineTo(x - t, arm_y1)
    p.lineTo(left, arm_y1)
    p.lineTo(left, arm_y0)
    p.lineTo(x - t, arm_y0)
    p.close()
    c.drawPath(p, fill=0, stroke=1)


def draw_sunrise_fixed(c: canvas.Canvas, x: float, y: float, s: float = 1.0) -> None:
    """A little sunrise: upper semicircle and rays over a horizon."""
    _set_doodle(c, 1.5)
    r = 8 * s
    horizon_y = y - 2 * s
    c.line(x - 13 * s, horizon_y, x + 13 * s, horizon_y)
    p = c.beginPath()
    p.moveTo(x - r, horizon_y)
    a0, a1 = math.pi, 0.0  # left to right via the top
    n = 2
    step = (a1 - a0) / n
    a = a0
    for _ in range(n):
        a2 = a + step
        k = (4.0 / 3.0) * math.tan(step / 4.0)
        x3, y3 = x + r * math.cos(a2), horizon_y + r * math.sin(a2)
        x1c = (x + r * math.cos(a)) + k * r * (-math.sin(a))
        y1c = (horizon_y + r * math.sin(a)) + k * r * (math.cos(a))
        x2c = x3 - k * r * (-math.sin(a2))
        y2c = y3 - k * r * (math.cos(a2))
        p.curveTo(x1c, y1c, x2c, y2c, x3, y3)
        a = a2
    c.drawPath(p, fill=0, stroke=1)
    for deg in (90, 60, 120, 30, 150):
        rad = math.radians(deg)
        x0 = x + (r + 2 * s) * math.cos(rad)
        y0 = horizon_y + (r + 2 * s) * math.sin(rad)
        x1 = x + (r + 6.5 * s) * math.cos(rad)
        y1 = horizon_y + (r + 6.5 * s) * math.sin(rad)
        c.line(x0, y0, x1, y1)


DOODLES = {
    "wreath": doodle_wreath,
    "star": doodle_star,
    "sprout": doodle_sprout,
    "leaf": doodle_leaf,
    "cross": doodle_cross,
    "sunrise": draw_sunrise_fixed,
}


def draw_wheel(c: canvas.Canvas, cx, cy, r_in, r_out, colored: bool) -> list[dict]:
    wedges = season_wedges()

    # 1) Fill sectors only — no per-sector stroke, so edges meet with no double outline.
    c.setStrokeColor(INK)
    c.setLineWidth(STROKE)
    c.setLineJoin(1)
    c.setLineCap(0)
    for w in wedges:
        path = sector_path(c, cx, cy, r_in, r_out, w["a0"], w["a1"])
        c.setFillColor(FILLS[w["color_name"]] if colored else white)
        c.drawPath(path, fill=1, stroke=0)

    # 2) White hub disk, then the two clean rings, then each radial once.
    c.setFillColor(white)
    c.circle(cx, cy, r_in, fill=1, stroke=0)

    c.setStrokeColor(INK)
    c.setLineWidth(STROKE)
    c.setLineCap(1)
    c.setLineJoin(1)
    c.circle(cx, cy, r_out, fill=0, stroke=1)
    c.circle(cx, cy, r_in, fill=0, stroke=1)

    # Radials inset so caps don't poke through the ring strokes.
    inset = STROKE * 0.5
    c.setLineCap(0)
    c.setLineWidth(STROKE)
    seen = set()
    for w in wedges:
        for ang in (w["a0"], w["a1"]):
            key = round(ang % 360.0, 8)
            if key in seen:
                continue
            seen.add(key)
            x0, y0 = polar(cx, cy, r_in + inset, ang)
            x1, y1 = polar(cx, cy, r_out - inset, ang)
            c.line(x0, y0, x1, y1)

    # Hub art
    draw_cross(c, cx, cy + 5)
    c.setFillColor(INK)
    c.setFont("Baloo-Bold", 9)
    c.drawCentredString(cx, cy - r_in + 13, "Jesus")

    # "Start here" lives fully outside the ring, on the Advent start ray.
    x_tip, y_tip = polar(cx, cy, r_out + 2, 0)
    left = polar(cx, cy, r_out + 12, -3.4)
    right = polar(cx, cy, r_out + 12, 3.4)
    p = c.beginPath()
    p.moveTo(x_tip, y_tip)
    p.lineTo(*left)
    p.lineTo(*right)
    p.close()
    c.setFillColor(INK)
    c.setStrokeColor(INK)
    c.setLineWidth(1.0)
    c.drawPath(p, fill=1, stroke=0)
    c.setFont("Baloo-Bold", 10)
    c.drawRightString(cx - 14, y_tip + 14, "Start here")

    # Labels inside each slice — no leader lines.
    for w in wedges:
        place_label_inside(c, cx, cy, r_in, r_out, w)

    return wedges


def place_label_inside(c: canvas.Canvas, cx, cy, r_in, r_out, w: dict) -> None:
    mid = w["mid"]
    name = w["name"]
    hint = w["hint"]
    # Sit in the outer half of the ring, where the slice is widest.
    r = r_in + 0.62 * (r_out - r_in)
    lx, ly = polar(cx, cy, r, mid)

    # Two-line "Ordinary / Time" for the narrower first Ordinary Time.
    if name == "Ordinary Time" and w["extent"] < 60:
        lines = [("Ordinary", "Baloo-Bold", 9.5), ("Time", "Baloo-Bold", 9.5)]
        if hint:
            lines.append((hint, "Baloo", 7.5))
    elif name == "Ordinary Time":
        lines = [("Ordinary Time", "Baloo-Bold", 11)]
        if hint:
            lines.append((hint, "Baloo", 8.5))
    else:
        size = 11 if w["extent"] >= 30 else 10
        lines = [(name, "Baloo-Bold", size)]

    # Stack centered on (lx, ly).
    line_h = 11
    total_h = line_h * (len(lines) - 1)
    y0 = ly + total_h / 2
    for i, (text, font, size) in enumerate(lines):
        c.setFont(font, size)
        c.setFillColor(INK if font.endswith("Bold") else MUTED)
        c.drawCentredString(lx, y0 - i * line_h, text)


def place_doodles(c: canvas.Canvas, cx, cy, r_out, wedges: list[dict], page_w, page_h, header_bottom, key_top) -> None:
    """Park a small colouring doodle just outside each season, not crossing the ring."""
    r = r_out + 28
    for w in wedges:
        dx, dy = polar(cx, cy, r, w["mid"])
        # Keep doodles on the page and out of the header / key.
        dx = min(max(dx, SAFE + 16), page_w - SAFE - 16)
        dy = min(dy, header_bottom - 16)
        dy = max(dy, key_top + 16)
        fn = DOODLES[w["doodle"]]
        fn(c, dx, dy, 1.15)


def draw_key(c: canvas.Canvas, cx: float, y: float, colored: bool) -> float:
    items = [
        ("Violet", "Advent and Lent"),
        ("White or gold", "Christmas and Easter"),
        ("Green", "Ordinary Time"),
    ]
    box = 16
    c.setFont("Baloo", 10)
    c.setFillColor(MUTED)
    c.drawCentredString(cx, y, "Church colours")
    y -= 22

    cols = []
    for name, uses in items:
        name_w = pdfmetrics.stringWidth(name, "Baloo-Bold", 10.5)
        use_w = pdfmetrics.stringWidth(uses, "Baloo", 8.5)
        cols.append(max(box + 6 + name_w, use_w))
    gap = 22
    total = sum(cols) + gap * (len(items) - 1)
    x = cx - total / 2
    for (name, uses), w in zip(items, cols):
        c.setStrokeColor(INK)
        c.setLineWidth(1.6)
        c.setFillColor(FILLS[name] if colored else white)
        c.roundRect(x, y - 1, box, box, 3, fill=1, stroke=1)
        c.setFillColor(INK)
        c.setFont("Baloo-Bold", 10.5)
        c.drawString(x + box + 6, y + 2, name)
        c.setFont("Baloo", 8.5)
        c.setFillColor(MUTED)
        c.drawString(x, y - 13, uses)
        x += w + gap
    return y - 22


def draw_write_line(c: canvas.Canvas, x: float, y: float, label: str, end_x: float) -> None:
    c.setFillColor(INK)
    c.setFont("ComicRelief", 12)
    c.drawString(x, y, label)
    label_w = c.stringWidth(label + "  ", "ComicRelief", 12)
    c.setStrokeColor(INK)
    c.setLineWidth(1.1)
    c.setDash(1, 3)
    c.line(x + label_w, y - 1, end_x, y - 1)
    c.setDash()


def draw_footer(c: canvas.Canvas, width: float, y: float) -> None:
    c.setStrokeColor(Color(0.6, 0.6, 0.6))
    c.setLineWidth(0.8)
    c.line(MARGIN, y + 14, width - MARGIN, y + 14)
    c.setFillColor(MUTED)
    c.setFont("ComicRelief", 9)
    c.drawCentredString(width / 2, y, "catholickidscrafts.com")


def draw_page(c: canvas.Canvas, colored: bool) -> None:
    width, height = letter
    c.setFillColor(white)
    c.rect(0, 0, width, height, fill=1, stroke=0)

    header_bottom = draw_header(c, width, height - MARGIN)

    footer_y = MARGIN + 6
    draw_footer(c, width, footer_y)

    prompt_y = footer_y + 40
    inner_x = SAFE + 8
    end_x = width - SAFE - 8
    draw_write_line(c, inner_x, prompt_y + 22, "My favorite feast:", end_x)
    draw_write_line(c, inner_x, prompt_y, "This Advent I will:", end_x)

    key_top = prompt_y + 96
    draw_key(c, width / 2, key_top, colored)

    # Wheel is centered; labels sit inside the slices, doodles just outside.
    r_out = 188
    r_in = 54
    cx = width / 2
    # Leave a band above the rim for "Start here" and the Advent wreath.
    avail_top = header_bottom - 8
    avail_bottom = key_top + 28
    cy = (avail_top + avail_bottom) / 2
    if cy + r_out + 36 > avail_top:
        cy = avail_top - r_out - 36
    if cy - r_out - 28 < avail_bottom:
        # Shrink equally if the doodle band would collide with the key.
        overflow = (avail_bottom + 28) - (cy - r_out)
        r_out = max(160, r_out - overflow)

    wedges = draw_wheel(c, cx, cy, r_in, r_out, colored)
    place_doodles(c, cx, cy, r_out, wedges, width, height, header_bottom, key_top)


def build() -> None:
    register_fonts()
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    bw_path = OUT_DIR / "happy-new-church-year.pdf"
    color_path = OUT_DIR / "happy-new-church-year-color.pdf"

    c = canvas.Canvas(str(bw_path), pagesize=letter)
    c.setTitle("Happy New Church Year")
    c.setAuthor("Catholic Kids Crafts")
    c.setSubject("Colour the seasons of the Church year")
    draw_page(c, colored=False)
    c.showPage()
    c.save()

    c = canvas.Canvas(str(color_path), pagesize=letter)
    c.setTitle("Happy New Church Year (colour)")
    c.setAuthor("Catholic Kids Crafts")
    c.setSubject("Colour the seasons of the Church year")
    draw_page(c, colored=True)
    c.showPage()
    c.save()
    print(f"wrote {bw_path}")
    print(f"wrote {color_path}")


if __name__ == "__main__":
    build()
