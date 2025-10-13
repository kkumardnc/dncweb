#!/usr/bin/env python3
"""
Fix absolute paths for GitHub Pages deployment.
Adds /dncweb/ base path to all absolute URLs.
"""

import os
import re
from pathlib import Path

# Base path for GitHub Pages
BASE_PATH = "/dncweb"

def fix_paths_in_file(file_path):
    """Fix absolute paths in a single file."""
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    original_content = content

    # Fix paths in href and src attributes
    # Match: href="/" or src="/" but not href="http" or href="https" or href="//"
    patterns = [
        (r'(href|src)="(/(?!/)(?!http))', rf'\1="{BASE_PATH}\2'),  # href="/path" -> href="/dncweb/path"
        (r"(href|src)='(/(?!/)(?!http))", rf"\1='{BASE_PATH}\2"),  # href='/path' -> href='/dncweb/path'
    ]

    for pattern, replacement in patterns:
        content = re.sub(pattern, replacement, content)

    # Only write if content changed
    if content != original_content:
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        return True
    return False

def main():
    """Process all HTML files in the project."""
    base_dir = Path('/Users/kriskumar/dnc')
    html_files = list(base_dir.glob('**/*.html'))

    updated_count = 0
    for html_file in html_files:
        # Skip hidden directories and node_modules
        if any(part.startswith('.') for part in html_file.parts):
            continue
        if 'node_modules' in html_file.parts:
            continue

        if fix_paths_in_file(html_file):
            print(f"Updated: {html_file}")
            updated_count += 1

    print(f"\nTotal files updated: {updated_count}")

if __name__ == '__main__':
    main()
