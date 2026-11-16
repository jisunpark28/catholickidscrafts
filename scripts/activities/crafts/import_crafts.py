"""Make the public previews of ready-made craft PDFs (<name>-color.pdf + <name>-coloring.pdf).

  python scripts/activities/crafts/import_crafts.py <folder with the PDFs>  (crafts not in the folder are skipped)

  -> public/images/activities/<slug>/preview-bw.webp, preview-color.webp
     (page 1 only, 600 x 776, the same preview size as the other activities; the cut-out
     template pages are never public)

The PDFs themselves are NOT copied into the repo: upload them to the private Blob store with
  pnpm exec tsx scripts/activities/crafts/upload_crafts_to_blob.ts --src <folder> [--src <folder2>]
The catalog entries live in src/lib/resource/activities.ts (CRAFTS).
"""
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[3]
SLUGS = [
    "advent-bank", "advent-lantern", "fiat-flag", "gabriel-wings", "joseph-lily", "birthday-card",
    "swaddle-baby", "gloria-trumpet", "shepherd-crook", "bethlehem-star", "magi-gifts",
    # Crafts2
    "angel-choir", "baptism-dove-mobile", "christmas-eve-lantern", "emmanuel-door-hanger", "epiphany-chalk-blessing",
    "flight-into-egypt", "heart-ornaments", "holy-family-mobile", "john-the-baptist-card", "magi-finger-puppets",
    "manger-banner", "newborn-king-crown", "pondering-heart", "visitation-popup",
]


def main() -> None:
    src = Path(sys.argv[1])
    if not shutil.which("pdftoppm"):
        sys.exit("needs pdftoppm (poppler)")
    for slug in SLUGS:
        if not (src / f"{slug}-color.pdf").exists():
            continue  # each batch folder holds only its own crafts
        img = ROOT / "public" / "images" / "activities" / slug
        img.mkdir(parents=True, exist_ok=True)
        for variant, name in (("bw", f"{slug}-coloring.pdf"), ("color", f"{slug}-color.pdf")):
            pdf = src / name
            with tempfile.TemporaryDirectory() as tmp:
                base = Path(tmp) / "p1"
                subprocess.run(["pdftoppm", "-png", "-r", "110", "-f", "1", "-l", "1", "-singlefile", str(pdf), str(base)], check=True)
                im = Image.open(f"{base}.png").convert("RGB").resize((600, 776), Image.LANCZOS)
                im.save(img / f"preview-{variant}.webp", "WEBP", quality=82, method=6)
        print(slug, "ok")


if __name__ == "__main__":
    main()
