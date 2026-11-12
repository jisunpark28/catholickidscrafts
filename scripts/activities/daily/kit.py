"""Shared drawing kit for the daily Advent activity sheets (ReportLab, US Letter).

Everything is drawn with plain lines, rects, circles, paths and strings so the
export step can turn each mark into one editable element for the Plus editor.
Colour versions only change fills (never the shapes), so B&W and colour share
one element model.
"""
from __future__ import annotations

import math
from contextlib import contextmanager
from pathlib import Path

from reportlab.lib.colors import Color, white
from reportlab.lib.pagesizes import letter
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont

ROOT = Path(__file__).resolve().parent
REPO = ROOT.parents[2]
FONT_DIR = REPO / "public" / "fonts" / "activities"
ASSET_DIR = REPO / "assets" / "activities"

W, H = letter
INK = Color(0.08, 0.08, 0.08)
MUTED = Color(0.30, 0.30, 0.30)
SOFT_RULE = Color(0.6, 0.6, 0.6)
MARGIN = 36
SAFE = 44
STROKE = 2.0

# Soft print colours for the colour versions.
VIOLET = Color(0.78, 0.70, 0.86)
DEEP_VIOLET = Color(0.62, 0.50, 0.75)
ROSE = Color(0.97, 0.76, 0.84)
GOLD = Color(0.98, 0.91, 0.62)
FLAME = Color(1.0, 0.82, 0.42)
GREEN = Color(0.72, 0.85, 0.70)
DARK_GREEN = Color(0.55, 0.74, 0.55)
BROWN = Color(0.86, 0.73, 0.58)
STRAW = Color(0.97, 0.88, 0.58)
SKY = Color(0.80, 0.89, 0.97)
NIGHT = Color(0.66, 0.72, 0.88)
RED = Color(0.96, 0.70, 0.68)
CREAM = Color(1.0, 0.97, 0.90)
BLUE = Color(0.70, 0.82, 0.95)
GREY = Color(0.88, 0.88, 0.88)


def register_fonts() -> None:
    pdfmetrics.registerFont(TTFont("Baloo", str(FONT_DIR / "Baloo2-Regular.ttf")))
    pdfmetrics.registerFont(TTFont("Baloo-Bold", str(FONT_DIR / "Baloo2-Bold.ttf")))
    pdfmetrics.registerFont(TTFont("ComicRelief", str(FONT_DIR / "ComicRelief-Regular.ttf")))
    pdfmetrics.registerFont(TTFont("ComicRelief-Bold", str(FONT_DIR / "ComicRelief-Bold.ttf")))


@contextmanager
def group(c, label: str):
    """Name the part being drawn (the editor's "Select whole part")."""
    prev = getattr(c, "group", None)
    c.group = label
    try:
        yield
    finally:
        c.group = prev


def fill(c, colored: bool, color: Color) -> None:
    c.setFillColor(color if colored else white)


def ink(c, width: float = STROKE) -> None:
    c.setStrokeColor(INK)
    c.setLineWidth(width)
    c.setLineCap(1)
    c.setLineJoin(1)


def text(c, x, y, s, font="Baloo-Bold", size=12, color=INK, align="left"):
    c.setFillColor(color)
    c.setFont(font, size)
    if align == "center":
        c.drawCentredString(x, y, s)
    elif align == "right":
        c.drawRightString(x, y, s)
    else:
        c.drawString(x, y, s)


def wrap(s: str, font: str, size: float, max_w: float) -> list[str]:
    words, lines, cur = s.split(), [], ""
    for w in words:
        t = f"{cur} {w}".strip()
        if pdfmetrics.stringWidth(t, font, size) <= max_w or not cur:
            cur = t
        else:
            lines.append(cur)
            cur = w
    if cur:
        lines.append(cur)
    return lines


def para(c, x, y, s, font="ComicRelief", size=11, max_w=400, leading=None, color=INK, align="left") -> float:
    leading = leading or size * 1.3
    for i, line in enumerate(wrap(s, font, size, max_w)):
        text(c, x, y - i * leading, line, font, size, color, align)
    return y - len(wrap(s, font, size, max_w)) * leading


# --- page furniture ---------------------------------------------------------

def header(c, title: str, question: str, answer: str, kicker: str = "Advent activity") -> float:
    """Kicker, big title, the Q&A question and a short site answer. Returns the y under it."""
    top = H - MARGIN
    with group(c, "Title"):
        text(c, W / 2, top - 12, kicker.upper(), "Baloo", 10, MUTED, "center")
        size = 30
        while pdfmetrics.stringWidth(title, "Baloo-Bold", size) > W - 2 * SAFE and size > 20:
            size -= 1
        text(c, W / 2, top - 44, title, "Baloo-Bold", size, INK, "center")
    with group(c, "Question"):
        text(c, W / 2, top - 66, question, "ComicRelief-Bold", 12.5, INK, "center")
        y = para(c, W / 2, top - 83, answer, "ComicRelief", 10.5, W - 2 * SAFE - 40, 13.5, MUTED, "center")
    return y - 6


def footer(c) -> None:
    with group(c, "Footer"):
        y = MARGIN + 6
        c.setStrokeColor(SOFT_RULE)
        c.setLineWidth(0.8)
        c.setLineCap(0)
        c.line(MARGIN, y + 14, W - MARGIN, y + 14)
        text(c, W / 2, y, "catholickidscrafts.com", "ComicRelief", 9, MUTED, "center")


def write_line(c, x, y, label: str, end_x: float, size: float = 12) -> None:
    with group(c, f"Write-in: {label.rstrip(':') or 'line'}"):
        lw = 0.0
        if label:
            text(c, x, y, label, "ComicRelief", size, INK)
            lw = pdfmetrics.stringWidth(label + "  ", "ComicRelief", size)
        dotted(c, x + lw, y - 1, end_x, y - 1)


def dotted(c, x0, y0, x1, y1, width=1.1) -> None:
    c.setStrokeColor(INK)
    c.setLineWidth(width)
    c.setLineCap(1)
    c.setDash(1, 3)
    c.line(x0, y0, x1, y1)
    c.setDash()


def cut_line(c, x0, y0, x1, y1) -> None:
    """Dashed cut line (each dash becomes its own element)."""
    c.setStrokeColor(MUTED)
    c.setLineWidth(1.0)
    c.setLineCap(0)
    c.setDash(4, 3)
    c.line(x0, y0, x1, y1)
    c.setDash()


def cut_rect(c, x, y, w, h) -> None:
    cut_line(c, x, y, x + w, y)
    cut_line(c, x + w, y, x + w, y + h)
    cut_line(c, x + w, y + h, x, y + h)
    cut_line(c, x, y + h, x, y)


def cut_circle(c, cx, cy, r, n=None) -> None:
    n = n or max(16, int(2 * math.pi * r / 7))
    c.setStrokeColor(MUTED)
    c.setLineWidth(1.0)
    c.setLineCap(0)
    for i in range(n):
        a0 = 2 * math.pi * i / n
        a1 = 2 * math.pi * (i + 0.55) / n
        c.line(cx + r * math.cos(a0), cy + r * math.sin(a0), cx + r * math.cos(a1), cy + r * math.sin(a1))


def scissors(c, x, y, s=1.0) -> None:
    """Tiny scissors mark for cut lines."""
    with group(c, "Scissors"):
        ink(c, 1.0)
        c.setFillColor(white)
        c.circle(x - 3 * s, y + 3 * s, 2.4 * s, stroke=1, fill=1)
        c.circle(x - 3 * s, y - 3 * s, 2.4 * s, stroke=1, fill=1)
        c.line(x - 1 * s, y + 2 * s, x + 7 * s, y - 2.5 * s)
        c.line(x - 1 * s, y - 2 * s, x + 7 * s, y + 2.5 * s)


def steps(c, x, y, items: list[str], max_w: float, size: float = 11) -> float:
    with group(c, "Steps"):
        for i, s in enumerate(items, 1):
            ink(c, 1.4)
            c.setFillColor(white)
            c.circle(x + 8, y + 4, 8, stroke=1, fill=1)
            text(c, x + 8, y + 0.5, str(i), "Baloo-Bold", 10, INK, "center")
            y = para(c, x + 22, y, s, "ComicRelief", size, max_w - 22, size * 1.3) - 5
    return y


def check_box(c, x, y, s=14, rx=3) -> None:
    ink(c, 1.4)
    c.setFillColor(white)
    c.roundRect(x, y, s, s, rx, stroke=1, fill=1)


def frame(c, x, y, w, h, r=14, width=1.6, colored=False, color=None) -> None:
    ink(c, width)
    if colored and color is not None:
        c.setFillColor(color)
    else:
        c.setFillColor(white)
    c.roundRect(x, y, w, h, r, stroke=1, fill=1)


# --- shapes -------------------------------------------------------------------

def P(c):
    return c.beginPath()


def draw(c, p, fill_on=True, stroke_on=True):
    c.drawPath(p, fill=1 if fill_on else 0, stroke=1 if stroke_on else 0)


def ellipse_path(c, cx, cy, rx, ry):
    k = 0.5523
    p = P(c)
    p.moveTo(cx + rx, cy)
    p.curveTo(cx + rx, cy + k * ry, cx + k * rx, cy + ry, cx, cy + ry)
    p.curveTo(cx - k * rx, cy + ry, cx - rx, cy + k * ry, cx - rx, cy)
    p.curveTo(cx - rx, cy - k * ry, cx - k * rx, cy - ry, cx, cy - ry)
    p.curveTo(cx + k * rx, cy - ry, cx + rx, cy - k * ry, cx + rx, cy)
    p.close()
    return p


def ellipse(c, cx, cy, rx, ry, colored, color, width=STROKE):
    ink(c, width)
    fill(c, colored, color)
    draw(c, ellipse_path(c, cx, cy, rx, ry))


def poly(c, pts, colored=False, color=None, width=STROKE, closed=True, fill_on=True):
    ink(c, width)
    if color is not None:
        fill(c, colored, color)
    else:
        c.setFillColor(white)
    p = P(c)
    p.moveTo(*pts[0])
    for pt in pts[1:]:
        p.lineTo(*pt)
    if closed:
        p.close()
    draw(c, p, fill_on=fill_on and closed)


def star(c, cx, cy, r, colored, color=GOLD, points=5, inner=0.45, width=1.6, rot=90):
    pts = []
    for i in range(points * 2):
        rr = r if i % 2 == 0 else r * inner
        a = math.radians(rot + 180 * i / points)
        pts.append((cx + rr * math.cos(a), cy + rr * math.sin(a)))
    poly(c, pts, colored, color, width)


def heart(c, cx, cy, s, colored, color=RED, width=1.6):
    ink(c, width)
    fill(c, colored, color)
    p = P(c)
    p.moveTo(cx, cy - s)
    p.curveTo(cx - 1.2 * s, cy - 0.2 * s, cx - 1.0 * s, cy + 0.9 * s, cx, cy + 0.45 * s)
    p.curveTo(cx + 1.0 * s, cy + 0.9 * s, cx + 1.2 * s, cy - 0.2 * s, cx, cy - s)
    p.close()
    draw(c, p)


def flame(c, cx, base_y, s, colored, color=FLAME, width=1.6):
    ink(c, width)
    fill(c, colored, color)
    p = P(c)
    p.moveTo(cx, base_y)
    p.curveTo(cx - 0.75 * s, base_y, cx - 0.7 * s, base_y + 0.9 * s, cx, base_y + 1.8 * s)
    p.curveTo(cx + 0.7 * s, base_y + 0.9 * s, cx + 0.75 * s, base_y, cx, base_y)
    p.close()
    draw(c, p)


def candle(c, x, y, w, h, colored, color, lit=True, label=None, width=STROKE):
    """Candle body with a wick and flame, bottom-left at (x, y)."""
    ink(c, width)
    fill(c, colored, color)
    c.roundRect(x, y, w, h, min(6, w / 4), stroke=1, fill=1)
    # little drip
    ink(c, width * 0.7)
    c.line(x + w * 0.25, y + h, x + w * 0.25, y + h - h * 0.12)
    ink(c, 1.4)
    c.line(x + w / 2, y + h, x + w / 2, y + h + 7)
    if lit:
        flame(c, x + w / 2, y + h + 5, w * 0.32, colored)
    if label:
        text(c, x + w / 2, y + h * 0.42, label, "Baloo-Bold", max(8, min(13, w / 3.6)), INK, "center")


def leaf(c, cx, cy, l, angle, colored, color=GREEN, width=1.4):
    a = math.radians(angle)
    ux, uy = math.cos(a), math.sin(a)
    nx, ny = -uy, ux
    tip = (cx + ux * l, cy + uy * l)
    p = P(c)
    ink(c, width)
    fill(c, colored, color)
    p.moveTo(cx, cy)
    p.curveTo(cx + ux * l * 0.3 + nx * l * 0.35, cy + uy * l * 0.3 + ny * l * 0.35,
              cx + ux * l * 0.75 + nx * l * 0.3, cy + uy * l * 0.75 + ny * l * 0.3, *tip)
    p.curveTo(cx + ux * l * 0.75 - nx * l * 0.3, cy + uy * l * 0.75 - ny * l * 0.3,
              cx + ux * l * 0.3 - nx * l * 0.35, cy + uy * l * 0.3 - ny * l * 0.35, cx, cy)
    p.close()
    draw(c, p)
    ink(c, 0.9)
    c.line(cx + ux * l * 0.12, cy + uy * l * 0.12, cx + ux * l * 0.8, cy + uy * l * 0.8)


def flower(c, cx, cy, r, colored, petal=white, centre=GOLD, petals=6, width=1.5):
    for i in range(petals):
        a = 2 * math.pi * i / petals + math.pi / 2
        ellipse_rot(c, cx + math.cos(a) * r * 0.62, cy + math.sin(a) * r * 0.62, r * 0.5, r * 0.3, a, colored, petal, width)
    ink(c, width)
    fill(c, colored, centre)
    c.circle(cx, cy, r * 0.3, stroke=1, fill=1)


def ellipse_rot(c, cx, cy, rx, ry, a, colored, color, width=1.5):
    k = 0.5523
    ca, sa = math.cos(a), math.sin(a)

    def T(x, y):
        return cx + x * ca - y * sa, cy + x * sa + y * ca

    p = P(c)
    p.moveTo(*T(rx, 0))
    p.curveTo(*T(rx, k * ry), *T(k * rx, ry), *T(0, ry))
    p.curveTo(*T(-k * rx, ry), *T(-rx, k * ry), *T(-rx, 0))
    p.curveTo(*T(-rx, -k * ry), *T(-k * rx, -ry), *T(0, -ry))
    p.curveTo(*T(k * rx, -ry), *T(rx, -k * ry), *T(rx, 0))
    p.close()
    ink(c, width)
    fill(c, colored, color)
    draw(c, p)


def rose(c, cx, cy, r, colored, color=RED, width=1.5):
    """Simple cartoon rose: round bloom with a spiral and two petals."""
    ink(c, width)
    fill(c, colored, color)
    c.circle(cx, cy, r, stroke=1, fill=1)
    ink(c, width * 0.8)
    p = P(c)
    p.moveTo(cx - r * 0.15, cy + r * 0.05)
    p.curveTo(cx - r * 0.15, cy + r * 0.35, cx + r * 0.3, cy + r * 0.35, cx + r * 0.3, cy)
    p.curveTo(cx + r * 0.3, cy - r * 0.5, cx - r * 0.55, cy - r * 0.45, cx - r * 0.55, cy + r * 0.05)
    p.curveTo(cx - r * 0.55, cy + r * 0.6, cx + r * 0.2, cy + r * 0.75, cx + r * 0.62, cy + r * 0.4)
    draw(c, p, fill_on=False)
    p = P(c)
    p.moveTo(cx - r * 0.95, cy - r * 0.25)
    p.curveTo(cx - r * 0.6, cy - r * 0.95, cx + r * 0.6, cy - r * 0.95, cx + r * 0.95, cy - r * 0.25)
    draw(c, p, fill_on=False)


def cross(c, cx, cy, s, colored=False, color=GOLD, width=1.6):
    t = s * 0.28
    pts = [
        (cx - t / 2, cy - s), (cx + t / 2, cy - s), (cx + t / 2, cy + s * 0.35), (cx + s * 0.55, cy + s * 0.35),
        (cx + s * 0.55, cy + s * 0.35 + t), (cx + t / 2, cy + s * 0.35 + t), (cx + t / 2, cy + s * 0.85),
        (cx - t / 2, cy + s * 0.85), (cx - t / 2, cy + s * 0.35 + t), (cx - s * 0.55, cy + s * 0.35 + t),
        (cx - s * 0.55, cy + s * 0.35), (cx - t / 2, cy + s * 0.35),
    ]
    poly(c, pts, colored, color, width)


def smiley(c, cx, cy, r, colored, color=GOLD, width=1.5):
    ink(c, width)
    fill(c, colored, color)
    c.circle(cx, cy, r, stroke=1, fill=1)
    c.setFillColor(INK)
    c.circle(cx - r * 0.33, cy + r * 0.2, r * 0.1, stroke=0, fill=1)
    c.circle(cx + r * 0.33, cy + r * 0.2, r * 0.1, stroke=0, fill=1)
    ink(c, width * 0.8)
    p = P(c)
    p.moveTo(cx - r * 0.45, cy - r * 0.15)
    p.curveTo(cx - r * 0.25, cy - r * 0.55, cx + r * 0.25, cy - r * 0.55, cx + r * 0.45, cy - r * 0.15)
    draw(c, p, fill_on=False)


def moon(c, cx, cy, r, colored, color=GOLD, width=1.6):
    ink(c, width)
    fill(c, colored, color)
    p = P(c)
    k = 0.5523
    p.moveTo(cx, cy + r)
    p.curveTo(cx - k * r * 1.8, cy + r, cx - k * r * 1.8, cy - r, cx, cy - r)
    p.curveTo(cx - r * 0.55, cy - r * 0.55, cx - r * 0.55, cy + r * 0.55, cx, cy + r)
    p.close()
    draw(c, p)


def cloud(c, cx, cy, s, colored, color=white, width=1.5):
    ink(c, width)
    fill(c, colored, color)
    p = P(c)
    p.moveTo(cx - s, cy)
    p.curveTo(cx - s * 1.25, cy + s * 0.55, cx - s * 0.55, cy + s * 0.75, cx - s * 0.35, cy + s * 0.5)
    p.curveTo(cx - s * 0.2, cy + s * 1.05, cx + s * 0.55, cy + s * 1.0, cx + s * 0.55, cy + s * 0.45)
    p.curveTo(cx + s * 1.1, cy + s * 0.6, cx + s * 1.3, cy, cx + s, cy)
    p.close()
    draw(c, p)


def sparkle(c, cx, cy, s, width=1.2):
    ink(c, width)
    c.line(cx - s, cy, cx + s, cy)
    c.line(cx, cy - s, cx, cy + s)


def sprinkle(c, pts, s=4):
    with group(c, "Sparkles"):
        for x, y in pts:
            sparkle(c, x, y, s)


def gift(c, x, y, w, h, colored, color=RED, ribbon=GOLD, width=STROKE):
    ink(c, width)
    fill(c, colored, color)
    c.rect(x, y, w, h * 0.78, stroke=1, fill=1)
    c.rect(x - w * 0.06, y + h * 0.78, w * 1.12, h * 0.22, stroke=1, fill=1)
    fill(c, colored, ribbon)
    c.rect(x + w * 0.42, y, w * 0.16, h, stroke=1, fill=1)
    ellipse_rot(c, x + w * 0.38, y + h + h * 0.1, w * 0.16, w * 0.08, math.radians(25), colored, ribbon, width * 0.8)
    ellipse_rot(c, x + w * 0.62, y + h + h * 0.1, w * 0.16, w * 0.08, math.radians(-25), colored, ribbon, width * 0.8)


def crown(c, cx, cy, w, colored, color=GOLD, width=1.6):
    h = w * 0.6
    pts = [(cx - w / 2, cy - h / 2), (cx + w / 2, cy - h / 2), (cx + w / 2, cy + h / 2), (cx + w / 4, cy + h * 0.05),
           (cx, cy + h / 2), (cx - w / 4, cy + h * 0.05), (cx - w / 2, cy + h / 2)]
    poly(c, pts, colored, color, width)
    for x in (cx - w / 2, cx, cx + w / 2):
        ink(c, 1.2)
        fill(c, colored, RED)
        c.circle(x, cy + h / 2 + 2.5, 2.5, stroke=1, fill=1)


def key_shape(c, cx, cy, s, colored, color=GOLD, width=1.6):
    ink(c, width)
    fill(c, colored, color)
    c.circle(cx - s * 0.55, cy, s * 0.35, stroke=1, fill=1)
    c.setFillColor(white)
    c.circle(cx - s * 0.55, cy, s * 0.13, stroke=1, fill=1)
    fill(c, colored, color)
    poly(c, [(cx - s * 0.2, cy - s * 0.08), (cx + s * 0.75, cy - s * 0.08), (cx + s * 0.75, cy - s * 0.3),
             (cx + s * 0.6, cy - s * 0.3), (cx + s * 0.6, cy - s * 0.18), (cx + s * 0.45, cy - s * 0.18),
             (cx + s * 0.45, cy - s * 0.3), (cx + s * 0.3, cy - s * 0.3), (cx + s * 0.3, cy - s * 0.08),
             (cx + s * 0.3, cy + s * 0.08), (cx - s * 0.2, cy + s * 0.08)], colored, color, width)


def scroll(c, cx, cy, w, h, colored, color=CREAM, width=1.6):
    ink(c, width)
    fill(c, colored, color)
    c.rect(cx - w / 2, cy - h / 2, w, h, stroke=1, fill=1)
    for y in (cy - h / 2, cy + h / 2):
        c.roundRect(cx - w / 2 - 5, y - 4, w + 10, 8, 4, stroke=1, fill=1)
    ink(c, 0.9)
    for i in range(3):
        yy = cy + h / 4 - i * h / 4
        c.line(cx - w * 0.32, yy, cx + w * 0.32, yy)


def book(c, cx, cy, w, h, colored, color=VIOLET, width=1.6):
    poly(c, [(cx, cy - h / 2), (cx - w / 2, cy - h / 2 + 4), (cx - w / 2, cy + h / 2), (cx, cy + h / 2 - 4)], colored, color, width)
    poly(c, [(cx, cy - h / 2), (cx + w / 2, cy - h / 2 + 4), (cx + w / 2, cy + h / 2), (cx, cy + h / 2 - 4)], colored, color, width)
    ink(c, 0.9)
    for i in range(3):
        yy = cy + h / 4 - i * h / 5
        c.line(cx - w * 0.38, yy, cx - w * 0.1, yy - 1)
        c.line(cx + w * 0.1, yy - 1, cx + w * 0.38, yy)


def ladder(c, cx, cy, w, h, colored, color=BROWN, width=1.6):
    ink(c, width)
    fill(c, colored, color)
    c.roundRect(cx - w / 2, cy - h / 2, w * 0.16, h, 2, stroke=1, fill=1)
    c.roundRect(cx + w / 2 - w * 0.16, cy - h / 2, w * 0.16, h, 2, stroke=1, fill=1)
    for i in range(4):
        yy = cy - h / 2 + h * (i + 0.7) / 4.4
        c.rect(cx - w / 2 + w * 0.16, yy, w * 0.68, 3.5, stroke=1, fill=1)


def ark(c, cx, cy, w, colored, color=BROWN, width=1.6):
    h = w * 0.3
    p = P(c)
    ink(c, width)
    fill(c, colored, color)
    p.moveTo(cx - w / 2, cy)
    p.lineTo(cx + w / 2, cy)
    p.curveTo(cx + w * 0.4, cy - h, cx - w * 0.4, cy - h, cx - w / 2, cy)
    p.close()
    draw(c, p)
    fill(c, colored, GOLD)
    c.rect(cx - w * 0.22, cy, w * 0.44, h * 0.8, stroke=1, fill=1)
    poly(c, [(cx - w * 0.28, cy + h * 0.8), (cx, cy + h * 1.4), (cx + w * 0.28, cy + h * 0.8)], colored, RED, width)
    c.setFillColor(white)
    ink(c, 1.1)
    c.rect(cx - w * 0.06, cy + h * 0.2, w * 0.12, h * 0.35, stroke=1, fill=1)


def stump(c, cx, cy, w, colored, color=BROWN, width=1.6):
    h = w * 0.55
    poly(c, [(cx - w / 2, cy - h / 2), (cx + w / 2, cy - h / 2), (cx + w * 0.34, cy + h / 2), (cx - w * 0.34, cy + h / 2)], colored, color, width)
    ellipse(c, cx, cy + h / 2, w * 0.34, w * 0.1, colored, CREAM, 1.4)
    ink(c, 1.4)
    c.line(cx + w * 0.05, cy + h / 2, cx + w * 0.1, cy + h / 2 + w * 0.45)
    leaf(c, cx + w * 0.1, cy + h / 2 + w * 0.35, w * 0.3, 30, colored)
    leaf(c, cx + w * 0.08, cy + h / 2 + w * 0.2, w * 0.25, 150, colored)


def mitre(c, cx, cy, w, colored, color=RED, width=1.6):
    h = w * 1.25
    p = P(c)
    ink(c, width)
    fill(c, colored, color)
    p.moveTo(cx - w / 2, cy - h / 2)
    p.lineTo(cx + w / 2, cy - h / 2)
    p.curveTo(cx + w / 2, cy + h * 0.1, cx + w * 0.2, cy + h * 0.35, cx, cy + h / 2)
    p.curveTo(cx - w * 0.2, cy + h * 0.35, cx - w / 2, cy + h * 0.1, cx - w / 2, cy - h / 2)
    p.close()
    draw(c, p)
    cross(c, cx, cy - h * 0.02, w * 0.22, colored, GOLD, 1.2)
    fill(c, colored, GOLD)
    c.rect(cx - w / 2, cy - h / 2, w, h * 0.12, stroke=1, fill=1)


def sun(c, cx, cy, r, colored, color=GOLD, width=1.6, rays=10, half=False):
    ink(c, width)
    for i in range(rays):
        a = math.pi * i / (rays - 1) if half else 2 * math.pi * i / rays
        c.line(cx + math.cos(a) * r * 1.25, cy + math.sin(a) * r * 1.25, cx + math.cos(a) * r * 1.6, cy + math.sin(a) * r * 1.6)
    fill(c, colored, color)
    if half:
        p = P(c)
        k = 0.5523
        p.moveTo(cx - r, cy)
        p.curveTo(cx - r, cy + k * r, cx - k * r, cy + r, cx, cy + r)
        p.curveTo(cx + k * r, cy + r, cx + r, cy + k * r, cx + r, cy)
        p.close()
        ink(c, width)
        draw(c, p)
    else:
        ink(c, width)
        c.circle(cx, cy, r, stroke=1, fill=1)


def house(c, x, y, w, h, colored, color=CREAM, roof=RED, width=STROKE):
    ink(c, width)
    fill(c, colored, color)
    c.rect(x, y, w, h * 0.62, stroke=1, fill=1)
    poly(c, [(x - w * 0.08, y + h * 0.62), (x + w / 2, y + h), (x + w * 1.08, y + h * 0.62)], colored, roof, width)
    fill(c, colored, BROWN)
    c.roundRect(x + w * 0.4, y, w * 0.2, h * 0.34, 3, stroke=1, fill=1)
    fill(c, colored, SKY)
    c.rect(x + w * 0.12, y + h * 0.3, w * 0.18, w * 0.16, stroke=1, fill=1)
    c.rect(x + w * 0.7, y + h * 0.3, w * 0.18, w * 0.16, stroke=1, fill=1)


def manger(c, cx, y, w, colored, color=BROWN, width=STROKE):
    """Empty wooden manger: a trough on two crossed (X) legs. Straw goes on top."""
    h = w * 0.3
    ink(c, width + 1)
    for sx in (-1, 1):
        a, b = cx + sx * w * 0.44, cx + sx * w * 0.24
        c.line(a, y, b, y + h * 1.3)
        c.line(b, y, a, y + h * 1.3)
    ink(c, width)
    fill(c, colored, color)
    p = P(c)
    p.moveTo(cx - w / 2, y + h * 2.0)
    p.lineTo(cx + w / 2, y + h * 2.0)
    p.lineTo(cx + w * 0.4, y + h * 0.95)
    p.lineTo(cx - w * 0.4, y + h * 0.95)
    p.close()
    draw(c, p)
    ink(c, 1.1)
    for i in range(1, 3):
        yy = y + h * 0.95 + h * 1.05 * i / 3
        t = i / 3
        half = w * 0.4 + (w * 0.5 - w * 0.4) * t
        c.line(cx - half, yy, cx + half, yy)
    return y + h * 2.0
