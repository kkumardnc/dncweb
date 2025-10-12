#!/usr/bin/env python3
"""Script to update navigation links across all HTML files"""

import os
import re
from pathlib import Path

# Define the replacements
replacements = [
    # Fix EcoExplorer link
    (r'<li><a href="/visit/#eco-explorer">EcoExplorer Guides</a></li>',
     '<li><a href="/ecoexplorer/">EcoExplorer Guides</a></li>'),
    (r'<li><a href="/eco0/">EcoExplorer Guides</a></li>',
     '<li><a href="/ecoexplorer/">EcoExplorer Guides</a></li>'),
    # Fix Shop link to point to WordPress shop
    (r'<li><a href="/shop/">Shop</a></li>',
     '<li><a href="https://www.demarestnaturecenter.org/shop/">Shop</a></li>'),
    # Fix Oktoberfest/Fall Festival link
    (r'<li><a href="/events/#oktoberfest">Oktoberfest/Fall Festival</a></li>',
     '<li><a href="/fall-festival/">Oktoberfest/Fall Festival</a></li>'),
    # Fix Scholarship link
    (r'<li><a href="/support/#scholarship">Scholarship</a></li>',
     '<li><a href="/scholarship/">Scholarship</a></li>'),
    # Fix Photo Contest link
    (r'<li><a href="/gallery/#photo-contest">Photo Contest</a></li>',
     '<li><a href="/photocontest/">Photo Contest</a></li>'),
    # Remove Newsletters from News and Events menu
    (r'\s*<li><a href="/events/#newsletters">Newsletters</a></li>\n',
     ''),
    # Remove Nature News from News and Events menu
    (r'\s*<li><a href="/events/#nature-news">Nature News</a></li>\n',
     ''),
    # Remove Camp SOAR from News and Events menu
    (r'\s*<li><a href="/programs/#camp-soar">Camp SOAR</a></li>\n',
     ''),
]

def update_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    original_content = content
    for pattern, replacement in replacements:
        content = re.sub(pattern, replacement, content)
    if content != original_content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        return True
    return False

def main():
    project_root = Path('/Users/kriskumar/dnc')
    html_files = list(project_root.rglob('*.html'))
    updated_count = 0
    for html_file in html_files:
        if update_file(html_file):
            print(f"Updated: {html_file}")
            updated_count += 1
    print(f"\nTotal files updated: {updated_count}")

if __name__ == '__main__':
    main()
