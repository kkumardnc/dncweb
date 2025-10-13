#!/usr/bin/env python3
"""
Revert paths from /dncweb/ to / for custom domain deployment.
"""

import os
import re
from pathlib import Path

def revert_paths_in_file(file_path):
    """Revert /dncweb/ paths back to / in a single file."""
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    original_content = content

    # Replace /dncweb/ with /
    content = content.replace('/dncweb/', '/')

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

        if revert_paths_in_file(html_file):
            print(f"Updated: {html_file}")
            updated_count += 1

    print(f"\nTotal files updated: {updated_count}")

if __name__ == '__main__':
    main()
