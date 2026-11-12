#!/usr/bin/env python3
"""Export each daily Advent sheet (and the candle craft) as an editable element model.

Uses the same recording canvas as the Happy New Church Year exporter, so every line, dot,
shape and word on the page becomes its own element. B&W and colour runs are diffed into
a per-element palette.

  python scripts/activities/daily/export_models.py [slug ...]
  -> src/data/activities/<slug>.model.json (served only by the Plus editor API)
"""
from __future__ import annotations

import json
import sys
import tempfile
from pathlib import Path

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE))
sys.path.insert(0, str(HERE.parent / "new-church-year"))
from export_model import RecCanvas, default_name  # noqa: E402
from kit import REPO, register_fonts  # noqa: E402
from reportlab.lib.pagesizes import letter  # noqa: E402
from sheets import SHEETS  # noqa: E402

TITLES = {
    "jesse-tree-ornaments": "Jesse Tree Ornaments",
    "prepare-the-way": "Prepare the Way",
    "yes-with-a-smile": "Yes With a Smile",
    "white-flower-for-mary": "A White Flower for Mary",
    "come-lord-jesus": "Come, Lord Jesus",
    "straw-for-the-manger": "Straw for the Manger",
    "jesse-tree-picture-a-day": "Jesse Tree: One Picture a Day",
    "helping-hands-like-mary": "Helping Hands Like Mary",
    "secret-kindness-notes": "Secret Kindness Notes",
    "roses-for-mary": "Roses for Mary",
    "o-antiphon-ornaments": "O Antiphon Ornaments",
    "family-advent-calendar": "Family Advent Calendar",
    "colour-the-advent-candles": "Colour the Advent Candles",
    "paper-advent-wreath": "Paper Advent Wreath",
    "light-the-advent-candle": "Light the Advent Candle",
    "advent-candle-craft": "Advent Candle Craft",
}


def record(slug: str, colored: bool) -> list[dict]:
    c = RecCanvas(str(Path(tempfile.gettempdir()) / "ckc-activity-rec.pdf"), pagesize=letter)
    SHEETS[slug](c, colored)
    for el in c.els:
        if not el.get("group"):
            el["group"] = "Page"
    return c.els


def export(slug: str) -> None:
    bw, color = record(slug, False), record(slug, True)
    assert len(bw) == len(color), (slug, len(bw), len(color))
    elements, counters = [], {}
    for a, b in zip(bw, color):
        assert a["kind"] == b["kind"], slug
        el = dict(a)
        el["name"] = default_name(a)
        if a.get("fill") != b.get("fill"):
            el["palette"] = {"bw": a["fill"], "color": b["fill"]}
        prefix = {"text": "t", "line": "l", "circle": "c", "rect": "r", "path": "p"}[a["kind"]]
        counters[prefix] = counters.get(prefix, 0) + 1
        el["id"] = f"{prefix}{counters[prefix]}"
        elements.append(el)
    doc = {"version": 1, "slug": slug, "title": TITLES[slug], "width": 612, "height": 792, "variant": "bw", "elements": elements}
    out = REPO / "src" / "data" / "activities" / f"{slug}.model.json"
    out.write_text(json.dumps(doc, ensure_ascii=False, separators=(",", ":")) + "\n", encoding="utf-8")
    kinds: dict[str, int] = {}
    for e in elements:
        kinds[e["kind"]] = kinds.get(e["kind"], 0) + 1
    print(f"{slug}: {len(elements)} elements {kinds}, palette on {sum(1 for e in elements if 'palette' in e)}")


if __name__ == "__main__":
    register_fonts()
    for s in sys.argv[1:] or list(SHEETS):
        export(s)
