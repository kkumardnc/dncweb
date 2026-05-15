#!/usr/bin/env python3
"""Generate manifest.json for the 2026 photo contest slideshow.

Scans the current folder for image files and parses filenames into
{title, photographer} entries.

Naming convention:

    title_words-photographer_name.ext

That is: use `_` for spaces within the title or photographer, and a
single `-` to separate title from photographer. Examples:

    eastern_phoebe-joel.jpg                 -> "Eastern Phoebe" / "Joel"
    what_is_left_of_deer-tyler_kim.jpg      -> "What Is Left Of Deer" / "Tyler Kim"

For backwards compatibility with older filenames that use only `_`,
the script falls back to splitting on the last underscore:

    barred_owlet_anonymous.png              -> "Barred Owlet" / "Anonymous"

CamelCase titles like `RubyCrownedKinglet-JOEL.jpg` are split on case.
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
    # Prefer `-` as the explicit title/photographer boundary so that
    # photographer names with spaces (encoded as `_`) work correctly.
    # Fall back to splitting on the last `_` for older filenames.
    if "-" in stem:
        title_part, photog_part = stem.rsplit("-", 1)
    elif "_" in stem:
        title_part, photog_part = stem.rsplit("_", 1)
    else:
        title_part, photog_part = stem, ""
    return pretty(title_part), pretty(photog_part)


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
