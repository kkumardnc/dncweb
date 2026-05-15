#!/usr/bin/env python3
"""Generate manifest.json for the 2026 photo contest slideshow.

Scans the current folder for image files and parses filenames into
{title, photographer} entries based on the convention used for entries:

    title_photographername.ext        # underscore separator
    title-photographername.ext        # dash separator
    CamelCaseTitle-photographer.ext   # CamelCase title gets split on case

The title and photographer parts are split on the LAST `-` or `_` so that
multi-word titles like `barred_owlet_anonymous.png` still work
("Barred Owlet" / "Anonymous"). The result is title-cased.
"""

import json
import re
from pathlib import Path

IMAGE_EXTS = {".jpg", ".jpeg", ".png", ".webp", ".gif", ".avif"}
HERE = Path(__file__).resolve().parent
MANIFEST_PATH = HERE / "manifest.json"


def split_camel(s: str) -> str:
    s = re.sub(r"(?<=[a-z])(?=[A-Z])", " ", s)
    s = re.sub(r"(?<=[A-Z])(?=[A-Z][a-z])", " ", s)
    return s


def pretty(s: str) -> str:
    s = re.sub(r"[_\-]+", " ", s).strip()
    s = split_camel(s)
    s = re.sub(r"\s+", " ", s)
    return s.title()


def parse(stem: str):
    # Split on the rightmost `-` or `_` so multi-word titles work.
    m = re.search(r"[-_](?=[^-_]*$)", stem)
    if m:
        return pretty(stem[: m.start()]), pretty(stem[m.end() :])
    return pretty(stem), ""


def main():
    entries = []
    for path in sorted(HERE.iterdir(), key=lambda p: p.name.lower()):
        if not path.is_file() or path.suffix.lower() not in IMAGE_EXTS:
            continue
        title, photographer = parse(path.stem)
        entries.append({
            "file": path.name,
            "title": title,
            "photographer": photographer,
        })
    MANIFEST_PATH.write_text(json.dumps(entries, indent=2) + "\n")
    print(f"Wrote {len(entries)} entries to {MANIFEST_PATH.name}")
    for e in entries:
        print(f"  {e['file']:40s} -> {e['title']!r} / {e['photographer']!r}")


if __name__ == "__main__":
    main()
