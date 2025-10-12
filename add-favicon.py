#!/usr/bin/env python3
import os
import re
from pathlib import Path

favicon_link = '  <link rel="icon" type="image/png" href="/assets/images/favicon.png">\n'

def add_favicon_to_file(filepath):
    """Add favicon link to HTML file if it doesn't already have one."""
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Check if favicon is already present
    if 'favicon' in content.lower():
        return False

    # Find the </head> tag and insert favicon before it
    # Look for </head> with possible whitespace before it
    pattern = r'(\s*)</head>'
    replacement = f'{favicon_link}\\1</head>'

    new_content = re.sub(pattern, replacement, content, count=1)

    if new_content != content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        return True

    return False

# Find all HTML files
html_files = []
for root, dirs, files in os.walk('.'):
    # Skip hidden directories and node_modules
    dirs[:] = [d for d in dirs if not d.startswith('.') and d != 'node_modules']

    for file in files:
        if file.endswith('.html'):
            html_files.append(os.path.join(root, file))

updated_count = 0
skipped_count = 0

for filepath in sorted(html_files):
    if add_favicon_to_file(filepath):
        print(f"✓ Added favicon to {filepath}")
        updated_count += 1
    else:
        print(f"- Skipped {filepath} (already has favicon)")
        skipped_count += 1

print(f"\n✓ Added favicon to {updated_count} files")
print(f"- Skipped {skipped_count} files (already had favicon)")
