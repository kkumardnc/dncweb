#!/usr/bin/env python3
"""Extract winner images from WordPress page"""

import re
import requests
from html.parser import HTMLParser

class ImageExtractor(HTMLParser):
    def __init__(self):
        super().__init__()
        self.images = []
        self.in_figure = False
        self.current_award = None
        self.current_photographer = None

    def handle_starttag(self, tag, attrs):
        attrs_dict = dict(attrs)

        if tag == 'img':
            src = attrs_dict.get('src', '')
            if '/wp-content/uploads/' in src and ('logo' not in src.lower()):
                self.images.append({
                    'src': src,
                    'alt': attrs_dict.get('alt', ''),
                    'award': self.current_award,
                    'photographer': self.current_photographer
                })

    def handle_data(self, data):
        data = data.strip()
        if 'Prize Winner' in data or 'Place in' in data or 'Honorable Mention' in data:
            self.current_award = data
        # Check if it might be a photographer name (short text, not award text)
        elif data and len(data) < 50 and not any(word in data for word in ['Prize', 'Place', 'Category', 'Honorable']):
            if self.current_award and not self.current_photographer:
                self.current_photographer = data

url = 'https://www.demarestnaturecenter.org/2025-john-c-goodwin-photo-contest-winners/'
response = requests.get(url)
html = response.text

parser = ImageExtractor()
parser.feed(html)

print("Found images:")
for i, img in enumerate(parser.images, 1):
    print(f"\n{i}. {img['src']}")
    print(f"   Award: {img['award']}")
    print(f"   Photographer: {img['photographer']}")
