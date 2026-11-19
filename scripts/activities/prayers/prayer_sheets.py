"""Prayer worksheets for the /prayers carousel: Little (circle the missing word), Growing (fill in the
blanks) and Ready (write each line from a clue), one US Letter page each.

The words come from src/data/prayers/prayer-phrases.json, the same data as the carousel activities.
A prayer too long for one page is split into parts ("Part 1 of 2"). Drawn with the daily-sheet kit so
the export step turns every mark into one editable element (B&W and colour share one model).
"""
from __future__ import annotations

import json
import re
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE.parent / "daily"))
from reportlab.pdfbase import pdfmetrics  # noqa: E402

from kit import (  # noqa: E402
    CREAM, GOLD, H, INK, MARGIN, MUTED, REPO, ROSE, SAFE, SKY, SOFT_RULE, W,
    cross, fill, flower, footer, frame, group, heart, ink, para, star, text, wrap,
)

DATA = json.loads((REPO / "src" / "data" / "prayers" / "prayer-phrases.json").read_text("utf-8"))
PRAYERS = {p["slug"]: p for p in DATA["prayers"]}

LEVELS = {
    "little": ("Little", "Circle the missing word in each line.", "Then pray the whole prayer slowly."),
    "growing": ("Growing", "Fill in the missing words. Use the word bank.", "Then pray the whole prayer slowly."),
    "ready": ("Ready", "Read each clue and write the line of the prayer.", "Need help? The first letters are at the bottom of the page."),
}

TOP = 640.0  # first row baseline area (under the header)
BOTTOM = 72.0  # above the footer
LEFT = SAFE + 4
NUM_W = 26
RIGHT = W - SAFE


def clean(t: str) -> str:
    """Line text without V./R. markers or the brackets around optional lines."""
    return re.sub(r"^(V|R)/\.\s*", "", t).replace("[", "").replace("]", "")


def core(tok: str) -> str:
    return re.sub(r"^[^\w]+|[^\w]+$", "", tok).lower()


def blank_tokens(t: str, blanks: list[str]) -> list[tuple[str, bool]]:
    """Split a line into (token, is_blank). A blank can span words ("Holy Father"); trailing punctuation stays."""
    toks = clean(t).split()
    out: list[tuple[str, bool]] = []
    todo = [b.split() for b in blanks]
    i = 0
    while i < len(toks):
        hit = None
        for k, words in enumerate(todo):
            n = len(words)
            if [core(x) for x in toks[i:i + n]] == [w.lower() for w in words]:
                hit = k
                break
        if hit is None:
            out.append((toks[i], False))
            i += 1
            continue
        n = len(todo[hit])
        last = toks[i + n - 1]
        tail = re.search(r"[^\w]*$", last).group(0)
        head = re.match(r"^[^\w]*", toks[i]).group(0)
        if head:
            out.append((head, False))
        out.append((" ".join(todo[hit]), True))
        if tail:
            out.append((tail, False))
        todo.pop(hit)
        i += n
    assert not todo, (t, blanks)
    return out


def sw(s: str, font: str, size: float) -> float:
    return pdfmetrics.stringWidth(s, font, size)


def activity_phrases(p: dict, level: str) -> list[dict]:
    ph = [x for x in p["phrases"] if "opens" not in x]
    if level == "little":
        ph = [x for x in ph if "little" in x]
    return ph


def levels_for(p: dict) -> list[str]:
    return [lv for lv in LEVELS if activity_phrases(p, lv)]


# --- row layout (measure and draw share one function) ---------------------------------------------

def layout_tokens(items: list[tuple[str, float, bool]], max_w: float, space: float) -> list[list[tuple[str, float, bool, float]]]:
    """Greedy wrap of (label, width, is_blank) items; returns lines of (label, width, is_blank, x)."""
    lines: list[list[tuple[str, float, bool, float]]] = [[]]
    x = 0.0
    for label, w, is_blank in items:
        punct = not is_blank and not re.search(r"\w", label)
        gap = 0 if (not lines[-1] or punct) else space
        if lines[-1] and x + gap + w > max_w and not punct:
            lines.append([])
            x, gap = 0.0, 0
        lines[-1].append((label, w, is_blank, x + gap))
        x += gap + w
    return lines


def number_badge(c, n: int, y: float, colored: bool, size: float) -> None:
    with group(c, f"Line {n}: number"):
        r = size * 0.62
        ink(c, 1.3)
        fill(c, colored, GOLD)
        c.circle(LEFT + r, y + size * 0.32, r, stroke=1, fill=1)
        text(c, LEFT + r, y + size * 0.32 - size * 0.3, str(n), "Baloo-Bold", size * 0.8, INK, "center")


def little_row(c, ph: dict, n: int, y: float, size: float, colored: bool, draw_on: bool) -> float:
    ans = ph["little"]["answer"]
    opts = ph["little"]["options"]
    k = ph["n"] % 3
    opts = opts[k:] + opts[:k]  # answer is not always first
    bw = max(sw(o, "Baloo-Bold", size) for o in opts) + 18
    items = [(lab, bw if b else sw(lab, "ComicRelief", size), b) for lab, b in blank_tokens(ph["text"], [ans])]
    x0 = LEFT + NUM_W
    lines = layout_tokens(items, RIGHT - x0, sw(" ", "ComicRelief", size))
    lead = size * 1.55
    oh = size + 10
    if draw_on:
        number_badge(c, n, y, colored, size)
        with group(c, f"Line {n}: words"):
            for li, line in enumerate(lines):
                yy = y - li * lead
                for lab, w, b, x in line:
                    if b:
                        ink(c, 1.2)
                        c.line(x0 + x, yy - 3, x0 + x + w, yy - 3)
                    else:
                        text(c, x0 + x, yy, lab, "ComicRelief", size, INK)
        with group(c, f"Line {n}: choices"):
            yy = y - (len(lines) - 1) * lead - lead - oh + size * 0.55
            x = x0
            for o in opts:
                ow = sw(o, "Baloo-Bold", size) + 22
                ink(c, 1.3)
                fill(c, colored, CREAM)
                c.roundRect(x, yy, ow, oh, oh / 2, stroke=1, fill=1)
                text(c, x + ow / 2, yy + oh / 2 - size * 0.32, o, "Baloo-Bold", size, INK, "center")
                x += ow + 14
    return len(lines) * lead + oh + size * 0.9


def growing_row(c, ph: dict, n: int, y: float, size: float, colored: bool, draw_on: bool) -> float:
    items = []
    for lab, b in blank_tokens(ph["text"], ph["blanks"]):
        items.append((lab, (sw(lab, "ComicRelief", size) * 1.25 + 22) if b else sw(lab, "ComicRelief", size), b))
    x0 = LEFT + NUM_W
    lines = layout_tokens(items, RIGHT - x0, sw(" ", "ComicRelief", size))
    lead = size * 2.15
    if draw_on:
        number_badge(c, n, y, colored, size)
        with group(c, f"Line {n}"):
            for li, line in enumerate(lines):
                yy = y - li * lead
                for lab, w, b, x in line:
                    if b:
                        ink(c, 1.2)
                        c.line(x0 + x, yy - 3, x0 + x + w, yy - 3)
                    else:
                        text(c, x0 + x, yy, lab, "ComicRelief", size, INK)
    return len(lines) * lead + size * 0.35


GENERIC_PROMPT = "Look at the picture and write this line."


def ready_clue(ph: dict) -> str:
    """The clue question; lines with only the generic picture prompt use the picture's title on paper."""
    if ph["prompt"] == GENERIC_PROMPT:
        return f"Picture clue: \u201c{ph['art']}\u201d. Write this line."
    return ph["prompt"]


def ready_row(c, ph: dict, n: int, y: float, size: float, colored: bool, draw_on: bool) -> float:
    clue = f"{ready_clue(ph)} ({ph['words']} word{'s' if ph['words'] != 1 else ''})"
    x0 = LEFT + NUM_W
    clue_size = size * 0.85
    clue_lines = wrap(clue, "ComicRelief", clue_size, RIGHT - x0)
    n_lines = 1 if len(clean(ph["text"])) <= 44 else 2
    gap = size * 2.0
    if draw_on:
        number_badge(c, n, y, colored, size)
        with group(c, f"Line {n}: clue"):
            for i, s in enumerate(clue_lines):
                text(c, x0, y - i * clue_size * 1.25, s, "ComicRelief", clue_size, MUTED)
        with group(c, f"Line {n}: write-in"):
            base = y - (len(clue_lines) - 1) * clue_size * 1.25
            c.setStrokeColor(SOFT_RULE)
            c.setLineWidth(1.0)
            c.setLineCap(1)
            for k in range(n_lines):
                ly = base - gap * (k + 1) + size * 0.4
                c.line(x0, ly, RIGHT, ly)
    return (len(clue_lines) - 1) * clue_size * 1.25 + gap * n_lines + size * 0.8


ROWS = {"little": little_row, "growing": growing_row, "ready": ready_row}
SIZES = [16, 15, 14, 13, 12.5, 12, 11.5, 11, 10.5]


def word_bank(c, words: list[str], y: float, size: float, colored: bool, draw_on: bool) -> float:
    x0, x1 = LEFT, RIGHT
    items = [(w, sw(w, "Baloo-Bold", size) + 18, False) for w in words]
    lines = layout_tokens(items, x1 - x0 - 24 - sw("Word bank:", "Baloo-Bold", size), 10)
    lead = size + 12
    h = len(lines) * lead + 14
    if draw_on:
        with group(c, "Word bank"):
            frame(c, x0, y - h, x1 - x0, h, 12, 1.4, colored, SKY)
            lab_w = sw("Word bank:", "Baloo-Bold", size) + 12
            text(c, x0 + 12, y - 7 - size, "Word bank:", "Baloo-Bold", size, INK)
            for li, line in enumerate(lines):
                yy = y - 7 - size - li * lead
                for lab, w, _b, x in line:
                    text(c, x0 + 12 + lab_w + x + w / 2, yy, lab, "ComicRelief", size, INK, "center")
    return h + 14


def hints_box(c, phs: list[dict], start: int, size: float, colored: bool, draw_on: bool) -> float:
    s = 9.5
    parts = [f"{start + i}. {ph['letters']}" for i, ph in enumerate(phs)]
    lines = wrap("     ".join(parts), "ComicRelief", s, RIGHT - LEFT - 24)
    h = len(lines) * s * 1.35 + s + 18
    if draw_on:
        with group(c, "Hints"):
            y = BOTTOM + h
            frame(c, LEFT, BOTTOM, RIGHT - LEFT, h, 10, 1.1, colored, CREAM)
            text(c, LEFT + 12, y - 6 - s, "Hints (first letters):", "Baloo-Bold", s + 0.5, MUTED)
            for i, line in enumerate(lines):
                text(c, LEFT + 12, y - 8 - s - (i + 1) * s * 1.35, line, "ComicRelief", s, MUTED)
    return h + 10


def bank_words(phs: list[dict]) -> list[str]:
    words = [b for ph in phs for b in ph["blanks"]]
    seen, out = set(), []
    for w in sorted(words, key=lambda x: (x.lower(), x)):
        if w.lower() not in seen:
            seen.add(w.lower())
            out.append(w)
    return out


def measure(level: str, phs: list[dict], size: float, start: int) -> float:
    h = 0.0
    if level == "growing":
        h += word_bank(None, bank_words(phs), TOP, size * 0.85, False, False)
    if level == "ready":
        h += hints_box(None, phs, start, size, False, False)
    for i, ph in enumerate(phs):
        h += ROWS[level](None, ph, start + i, 0, size, False, False)
    return h


def plan(p: dict, level: str) -> list[tuple[list[dict], float, int]]:
    """Split a level's lines into pages: [(phrases, font size, first line number)]."""
    phs = activity_phrases(p, level)
    avail = TOP - BOTTOM
    for parts in range(1, 5):
        per = -(-len(phs) // parts)
        chunks = [phs[i:i + per] for i in range(0, len(phs), per)]
        out = []
        for k, ch in enumerate(chunks):
            start = 1 + k * per
            size = next((s for s in SIZES if measure(level, ch, s, start) <= avail), None)
            if size is None or (parts < 4 and size < 11 and len(ch) > 1):
                out = None
                break
            out.append((ch, size, start))
        if out:
            return out
    raise RuntimeError(f"{p['slug']} {level} does not fit")


def sheet_slug(prayer_slug: str, level: str, part: int, parts: int) -> str:
    return f"{prayer_slug}-{level}-worksheet" + (f"-part-{part}" if parts > 1 else "")


def sheet_title(p: dict, level: str, part: int, parts: int) -> str:
    return f"{p['title']}: {LEVELS[level][0]} Worksheet" + (f" (Part {part} of {parts})" if parts > 1 else "")


def sheet_header(c, title: str, question: str, answer: str, kicker: str) -> float:
    """Like kit.header, with room for the corner crosses (long titles shrink further)."""
    top = H - MARGIN
    with group(c, "Title"):
        text(c, W / 2, top - 12, kicker.upper(), "Baloo", 10, MUTED, "center")
        size = 30
        while sw(title, "Baloo-Bold", size) > W - 2 * SAFE - 90 and size > 15:
            size -= 1
        text(c, W / 2, top - 44, title, "Baloo-Bold", size, INK, "center")
    with group(c, "Question"):
        text(c, W / 2, top - 66, question, "ComicRelief-Bold", 12.5, INK, "center")
        y = para(c, W / 2, top - 83, answer, "ComicRelief", 10.5, W - 2 * SAFE - 40, 13.5, MUTED, "center")
    return y - 6


def draw_sheet(c, p: dict, level: str, part: int, parts: int, phs: list[dict], size: float, start: int, colored: bool) -> None:
    name, question, answer = LEVELS[level]
    title = p["title"] + (f" (Part {part} of {parts})" if parts > 1 else "")
    kicker = f"Prayer worksheet  ·  {name}"
    sheet_header(c, title, question, answer, kicker)
    with group(c, "Doodles"):
        cross(c, SAFE + 18, H - MARGIN - 34, 16, colored, GOLD)
        cross(c, W - SAFE - 18, H - MARGIN - 34, 16, colored, GOLD)
        dx = W / 2 - sw(kicker.upper(), "Baloo", 10) / 2 - 16
        dy = H - MARGIN - 9
        if level == "little":
            flower(c, dx, dy, 6, colored)
        elif level == "growing":
            star(c, dx, dy, 7, colored, GOLD)
        else:
            heart(c, dx, dy + 1, 6, colored, ROSE)
    y = TOP
    if level == "growing":
        y -= word_bank(c, bank_words(phs), y, size * 0.85, colored, True)
    if level == "ready":
        hints_box(c, phs, start, size, colored, True)
    y -= size * 0.6
    # Share the spare room between the lines (more writing space), up to about one line each.
    spare = (TOP - BOTTOM) - measure(level, phs, size, start)
    extra = max(0.0, min(spare / max(1, len(phs)), size * 1.6))
    for i, ph in enumerate(phs):
        y -= ROWS[level](c, ph, start + i, y, size, colored, True) + extra
    footer(c)


def all_sheets() -> list[dict]:
    """Every prayer worksheet, in carousel order: slug, title, prayer slug, level, part, parts, draw."""
    out = []
    for p in DATA["prayers"]:
        for level in levels_for(p):
            pages = plan(p, level)
            for k, (phs, size, start) in enumerate(pages, 1):
                def draw(c, colored, p=p, level=level, k=k, n=len(pages), phs=phs, size=size, start=start):
                    draw_sheet(c, p, level, k, n, phs, size, start, colored)
                out.append({
                    "slug": sheet_slug(p["slug"], level, k, len(pages)), "title": sheet_title(p, level, k, len(pages)),
                    "prayer": p["slug"], "prayerTitle": p["title"], "level": level, "part": k, "parts": len(pages),
                    "draw": draw,
                })
    return out
