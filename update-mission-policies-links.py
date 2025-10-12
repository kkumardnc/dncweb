#!/usr/bin/env python3
"""Update mission and policies links in all HTML files"""

import re
from pathlib import Path

# Find all HTML files
html_files = list(Path('.').rglob('*.html'))

# Replacement patterns
replacements = [
    # Update mission link
    (r'href="/about/#mission"', 'href="/about/mission.html"'),
    # Update policies link
    (r'href="/about/#policies"', 'href="/about/policies.html"'),
    # Update meetings link
    (r'href="/about/#meetings"', 'href="/about/policies.html#meetings"'),
]

updated_count = 0

for html_file in html_files:
    try:
        content = html_file.read_text()
        original_content = content

        # Apply all replacements
        for pattern, replacement in replacements:
            content = re.sub(pattern, replacement, content)

        # Only write if something changed
        if content != original_content:
            html_file.write_text(content)
            updated_count += 1
            print(f"Updated: {html_file}")

    except Exception as e:
        print(f"Error processing {html_file}: {e}")

print(f"\nTotal files updated: {updated_count}")
