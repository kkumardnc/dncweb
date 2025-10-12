#!/usr/bin/env python3
"""
Download all EcoExplorer images from the WordPress site.
This script downloads the actual images (not HTML) from the main website.
"""

import subprocess
import sys

# All image downloads: (URL, destination_path)
downloads = [
    # Tenakill Brook - 6 images
    ("https://www.demarestnaturecenter.org/wp-content/uploads/2024/08/Screenshot-2024-08-31-at-7.38.09-PM-776x1024.png",
     "assets/images/ecoexplorer/tenakill-brook/brook-1.png"),
    ("https://www.demarestnaturecenter.org/wp-content/uploads/2024/08/Screenshot-2024-08-31-at-7.40.11-PM-771x1024.png",
     "assets/images/ecoexplorer/tenakill-brook/brook-2.png"),
    ("https://www.demarestnaturecenter.org/wp-content/uploads/2024/08/Screenshot-2024-08-31-at-7.39.23-PM-769x1024.png",
     "assets/images/ecoexplorer/tenakill-brook/brook-3.png"),
    ("https://www.demarestnaturecenter.org/wp-content/uploads/2024/08/Screenshot-2024-08-29-at-2.30.31-PM-2-781x1024.png",
     "assets/images/ecoexplorer/tenakill-brook/brook-4.png"),
    ("https://www.demarestnaturecenter.org/wp-content/uploads/2024/08/Screenshot-2024-08-29-at-3.20.15-PM-767x1024.png",
     "assets/images/ecoexplorer/tenakill-brook/brook-5.png"),
    ("https://www.demarestnaturecenter.org/wp-content/uploads/2024/08/Screenshot-2024-08-31-at-7.38.09-PM-776x1024.png",
     "assets/images/ecoexplorer/tenakill-brook/brook-6.png"),

    # Cottonwood - 6 images
    ("https://www.demarestnaturecenter.org/wp-content/uploads/2024/08/Screenshot-2024-08-16-at-11.34.00-AM-769x1024.png",
     "assets/images/ecoexplorer/cottonwood/stump-1.png"),
    ("https://www.demarestnaturecenter.org/wp-content/uploads/2024/08/Screenshot-2024-08-16-at-11.19.44-AM.png",
     "assets/images/ecoexplorer/cottonwood/timeline.png"),
    ("https://www.demarestnaturecenter.org/wp-content/uploads/2024/08/Screenshot-2024-08-16-at-11.35.54-AM-2-769x1024.png",
     "assets/images/ecoexplorer/cottonwood/bark.png"),
    ("https://www.demarestnaturecenter.org/wp-content/uploads/2024/08/Screenshot-2024-08-16-at-12.30.19-PM-760x1024.png",
     "assets/images/ecoexplorer/cottonwood/leaves.png"),
    ("https://www.demarestnaturecenter.org/wp-content/uploads/2024/08/Screenshot-2024-08-16-at-12.30.35-PM-1024x766.png",
     "assets/images/ecoexplorer/cottonwood/tree.png"),
    ("https://www.demarestnaturecenter.org/wp-content/uploads/2024/08/Screenshot-2024-08-16-at-11.34.00-AM-769x1024.png",
     "assets/images/ecoexplorer/cottonwood/stump-2.png"),  # Using stump-1 for stump-2

    # Ash Tree - 5 images (need to find from WordPress)
    # Using placeholder URLs that I'll update
    ("https://www.demarestnaturecenter.org/wp-content/uploads/2024/08/Screenshot-2024-08-27-at-9.15.05-AM-1024x716.png",
     "assets/images/ecoexplorer/ash-tree/trunk-bark.png"),
    ("https://www.demarestnaturecenter.org/wp-content/uploads/2024/08/Screenshot-2024-08-27-at-9.14.54-AM-1024x708.png",
     "assets/images/ecoexplorer/ash-tree/leaves.png"),
    ("https://www.demarestnaturecenter.org/wp-content/uploads/2024/08/Screenshot-2024-08-27-at-9.14.43-AM-1024x719.png",
     "assets/images/ecoexplorer/ash-tree/samaras.png"),
    ("https://www.demarestnaturecenter.org/wp-content/uploads/2024/08/Screenshot-2024-08-27-at-9.14.34-AM-1024x713.png",
     "assets/images/ecoexplorer/ash-tree/landscape.png"),
    ("https://www.demarestnaturecenter.org/wp-content/uploads/2024/08/Screenshot-2024-08-27-at-9.14.24-AM-1024x745.png",
     "assets/images/ecoexplorer/ash-tree/closeup.png"),

    # Meadow - 6 images (need to find from WordPress)
    ("https://www.demarestnaturecenter.org/wp-content/uploads/2024/08/Screenshot-2024-08-27-at-9.33.12-AM-1024x729.png",
     "assets/images/ecoexplorer/meadow/wildflowers.png"),
    ("https://www.demarestnaturecenter.org/wp-content/uploads/2024/08/Screenshot-2024-08-27-at-9.33.01-AM-1024x727.png",
     "assets/images/ecoexplorer/meadow/pollinator.png"),
    ("https://www.demarestnaturecenter.org/wp-content/uploads/2024/08/Screenshot-2024-08-27-at-9.32.49-AM-1024x781.png",
     "assets/images/ecoexplorer/meadow/grasses.png"),
    ("https://www.demarestnaturecenter.org/wp-content/uploads/2024/08/Screenshot-2024-08-27-at-9.32.38-AM-1024x731.png",
     "assets/images/ecoexplorer/meadow/butterfly.png"),
    ("https://www.demarestnaturecenter.org/wp-content/uploads/2024/08/Screenshot-2024-08-27-at-9.32.29-AM-1024x707.png",
     "assets/images/ecoexplorer/meadow/ecosystem.png"),
    ("https://www.demarestnaturecenter.org/wp-content/uploads/2024/08/Screenshot-2024-08-27-at-9.32.20-AM-1024x757.png",
     "assets/images/ecoexplorer/meadow/birds.png"),
]

def download_image(url, dest):
    """Download an image using curl."""
    print(f"Downloading {dest}...")
    result = subprocess.run(
        ["curl", "-L", "-f", "-s", "-o", dest, url],
        capture_output=True
    )
    if result.returncode == 0:
        # Verify it's actually an image
        check_result = subprocess.run(
            ["file", dest],
            capture_output=True,
            text=True
        )
        if "PNG image data" in check_result.stdout:
            print(f"  ✓ Downloaded successfully")
            return True
        else:
            print(f"  ✗ Downloaded but not a valid PNG: {check_result.stdout.strip()}")
            return False
    else:
        print(f"  ✗ Failed to download")
        return False

def main():
    success_count = 0
    fail_count = 0

    for url, dest in downloads:
        if download_image(url, dest):
            success_count += 1
        else:
            fail_count += 1

    print(f"\n{'='*60}")
    print(f"Download complete: {success_count} successful, {fail_count} failed")
    print(f"{'='*60}")

    return 0 if fail_count == 0 else 1

if __name__ == "__main__":
    sys.exit(main())
