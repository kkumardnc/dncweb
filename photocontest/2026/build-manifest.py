#!/usr/bin/env python3
"""Generate manifest.json for the 2026 photo contest slideshow.

Scans photocontest/2026/images/ for image files and parses filenames of the
form `title_photographername.ext` into structured entries. Underscores and
hyphens within the title or photographer parts are treated as word separators
and the result is title-cased.
"""

import json
import re
from pathlib import Path

IMAGE_EXTS = {".jpg", ".jpeg", ".png", ".webp", ".gif", ".avif"}
HERE = Path(__file__).resolve().parent
IMAGES_DIR = HERE / "images"
MANIFEST_PATH = HERE / "manifest.json"


def pretty(s: str) -> str:
    s = re.sub(r"[_\-]+", " ", s).strip()
    s = re.sub(r"\s+", " ", s)
    return s.title()


def parse(stem: str):
    # Filename: title_photographername  (split on the LAST underscore so
    # multi-word titles like "morning mist_jane doe" still work).
    if "_" in stem:
        title_part, photographer_part = stem.rsplit("_", 1)
    else:
        title_part, photographer_part = stem, ""
    return pretty(title_part), pretty(photographer_part)


def main():
    if not IMAGES_DIR.exists():
        IMAGES_DIR.mkdir(parents=True)
    entries = []
    for path in sorted(IMAGES_DIR.iterdir()):
        if not path.is_file() or path.suffix.lower() not in IMAGE_EXTS:
            continue
        title, photographer = parse(path.stem)
        entries.append({
            "file": f"images/{path.name}",
            "title": title,
            "photographer": photographer,
        })
    MANIFEST_PATH.write_text(json.dumps(entries, indent=2) + "\n")
    print(f"Wrote {len(entries)} entries to {MANIFEST_PATH.relative_to(HERE.parent.parent)}")


if __name__ == "__main__":
    main()
