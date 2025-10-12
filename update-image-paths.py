#!/usr/bin/env python3
import os
import re

# Mapping of old image URLs to new local paths
replacements = [
    # Tenakill Brook images
    ('https://www.demarestnaturecenter.org/wp-content/uploads/2024/08/Screenshot-2024-08-27-at-9.26.18-AM-1024x734.png',
     '/assets/images/ecoexplorer/tenakill-brook/brook-1.png'),
    ('https://www.demarestnaturecenter.org/wp-content/uploads/2024/08/Screenshot-2024-08-27-at-9.27.45-AM-1024x771.png',
     '/assets/images/ecoexplorer/tenakill-brook/brook-2.png'),
    ('https://www.demarestnaturecenter.org/wp-content/uploads/2024/08/Screenshot-2024-08-27-at-9.28.06-AM-1024x768.png',
     '/assets/images/ecoexplorer/tenakill-brook/brook-3.png'),
    ('https://www.demarestnaturecenter.org/wp-content/uploads/2024/08/Screenshot-2024-08-27-at-9.28.26-AM-768x1024.png',
     '/assets/images/ecoexplorer/tenakill-brook/brook-4.png'),
    ('https://www.demarestnaturecenter.org/wp-content/uploads/2024/08/Screenshot-2024-08-27-at-9.28.35-AM-1024x768.png',
     '/assets/images/ecoexplorer/tenakill-brook/brook-5.png'),
    ('https://www.demarestnaturecenter.org/wp-content/uploads/2024/08/Screenshot-2024-08-27-at-9.28.44-AM-1024x768.png',
     '/assets/images/ecoexplorer/tenakill-brook/brook-6.png'),

    # Cottonwood images
    ('https://www.demarestnaturecenter.org/wp-content/uploads/2024/08/Screenshot-2024-08-16-at-11.19.44-AM.png',
     '/assets/images/ecoexplorer/cottonwood/timeline.png'),
    ('https://www.demarestnaturecenter.org/wp-content/uploads/2024/08/Screenshot-2024-08-27-at-10.25.39-AM-768x1024.png',
     '/assets/images/ecoexplorer/cottonwood/stump-1.png'),
    ('https://www.demarestnaturecenter.org/wp-content/uploads/2024/08/Screenshot-2024-08-27-at-10.26.10-AM-768x1024.png',
     '/assets/images/ecoexplorer/cottonwood/stump-2.png'),
    ('https://www.demarestnaturecenter.org/wp-content/uploads/2024/08/Screenshot-2024-08-27-at-10.26.24-AM-768x1024.png',
     '/assets/images/ecoexplorer/cottonwood/bark.png'),
    ('https://www.demarestnaturecenter.org/wp-content/uploads/2024/08/Screenshot-2024-08-27-at-10.26.38-AM-1024x768.png',
     '/assets/images/ecoexplorer/cottonwood/leaves.png'),
    ('https://www.demarestnaturecenter.org/wp-content/uploads/2024/08/Screenshot-2024-08-27-at-10.26.50-AM-1024x768.png',
     '/assets/images/ecoexplorer/cottonwood/tree.png'),

    # Ash tree images
    ('https://www.demarestnaturecenter.org/wp-content/uploads/2024/08/Screenshot-2024-08-28-at-10.13.36-AM-768x1024.png',
     '/assets/images/ecoexplorer/ash-tree/trunk-bark.png'),
    ('https://www.demarestnaturecenter.org/wp-content/uploads/2024/08/Screenshot-2024-08-28-at-10.13.53-AM-768x1024.png',
     '/assets/images/ecoexplorer/ash-tree/leaves.png'),
    ('https://www.demarestnaturecenter.org/wp-content/uploads/2024/08/Screenshot-2024-08-28-at-10.14.09-AM-768x1024.png',
     '/assets/images/ecoexplorer/ash-tree/samaras.png'),
    ('https://www.demarestnaturecenter.org/wp-content/uploads/2024/08/Screenshot-2024-08-28-at-10.14.17-AM-768x1024.png',
     '/assets/images/ecoexplorer/ash-tree/landscape.png'),
    ('https://www.demarestnaturecenter.org/wp-content/uploads/2024/08/Screenshot-2024-08-28-at-10.14.25-AM-768x1024.png',
     '/assets/images/ecoexplorer/ash-tree/closeup.png'),

    # Meadow images
    ('https://www.demarestnaturecenter.org/wp-content/uploads/2024/08/Screenshot-2024-08-29-at-2.00.11-PM-783x1024.png',
     '/assets/images/ecoexplorer/meadow/wildflowers.png'),
    ('https://www.demarestnaturecenter.org/wp-content/uploads/2024/08/Screenshot-2024-08-28-at-3.51.37-PM-769x1024.png',
     '/assets/images/ecoexplorer/meadow/pollinator.png'),
    ('https://www.demarestnaturecenter.org/wp-content/uploads/2024/08/Screenshot-2024-08-29-at-2.00.50-PM-761x1024.png',
     '/assets/images/ecoexplorer/meadow/grasses.png'),
    ('https://www.demarestnaturecenter.org/wp-content/uploads/2024/08/Screenshot-2024-08-29-at-2.00.39-PM-769x1024.png',
     '/assets/images/ecoexplorer/meadow/butterfly.png'),
    ('https://www.demarestnaturecenter.org/wp-content/uploads/2024/08/Screenshot-2024-08-29-at-2.00.31-PM-1024x760.png',
     '/assets/images/ecoexplorer/meadow/ecosystem.png'),
    ('https://www.demarestnaturecenter.org/wp-content/uploads/2024/08/Screenshot-2024-08-29-at-2.00.19-PM-782x1024.png',
     '/assets/images/ecoexplorer/meadow/birds.png'),
]

# Files to update
files_to_update = [
    'ecoexplorer/index.html',
    'ecoexplorer/tenakill-brook.html',
    'ecoexplorer/cottonwood-stump.html',
    'ecoexplorer/ash-tree.html',
    'ecoexplorer/meadow.html',
]

updated_count = 0

for filepath in files_to_update:
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    original_content = content
    for old_url, new_path in replacements:
        content = content.replace(old_url, new_path)

    if content != original_content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"✓ Updated {filepath}")
        updated_count += 1
    else:
        print(f"- No changes needed in {filepath}")

print(f"\nTotal files updated: {updated_count}")
