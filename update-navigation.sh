#!/bin/bash

# Script to update navigation across all HTML files to match original site

# Define the new navigation HTML
NEW_NAV='      <nav id="mainNav">
        <ul>
          <li><a href="/">Home</a></li>
          <li class="has-dropdown">
            <a href="/about/">About</a>
            <ul class="dropdown">
              <li><a href="/about/">About</a></li>
              <li><a href="https://www.demarestnaturecenter.org/wp-content/uploads/2024/01/History-of-Demarest.pdf" target="_blank" rel="noopener">History of DNC</a></li>
              <li><a href="/about/#board">Board of Trustees</a></li>
              <li><a href="/about/#mission">Our Mission</a></li>
              <li><a href="/about/#policies">Policies</a></li>
              <li><a href="/about/#meetings">Monthly Board Meetings</a></li>
              <li><a href="/contact/">Contact</a></li>
            </ul>
          </li>
          <li class="has-dropdown">
            <a href="/visit/">Maps and Trails</a>
            <ul class="dropdown">
              <li><a href="/visit/#getting-here">Getting Here</a></li>
              <li><a href="/visit/#eco-explorer">EcoExplorer Guides</a></li>
              <li><a href="/visit/#trail-maps">Trail Map</a></li>
            </ul>
          </li>
          <li class="has-dropdown">
            <a href="/events/">News and Events</a>
            <ul class="dropdown">
              <li><a href="/events/#newsletters">Newsletters</a></li>
              <li><a href="/events/#nature-news">Nature News</a></li>
              <li><a href="/events/">Upcoming Events</a></li>
              <li><a href="/programs/#camp-soar">Camp SOAR</a></li>
              <li><a href="/events/#nature-walks">Nature Walks</a></li>
              <li><a href="/events/#oktoberfest">Oktoberfest/Fall Festival</a></li>
              <li><a href="/events/#crafter-vendor">Crafter & Vendor</a></li>
              <li><a href="/support/#scholarship">Scholarship</a></li>
              <li><a href="/gallery/#photo-contest">Photo Contest</a></li>
            </ul>
          </li>
          <li class="has-dropdown">
            <a href="/programs/">Public Services</a>
            <ul class="dropdown">
              <li><a href="/support/volunteer.html">Volunteer Program</a></li>
              <li><a href="/programs/">Educational Programs</a></li>
              <li><a href="/programs/#what-we-sponsor">What We Sponsor</a></li>
              <li><a href="/about/#preservation">Preservation</a></li>
            </ul>
          </li>
          <li><a href="/events/#calendar">Calendar</a></li>
          <li><a href="/shop/">Shop</a></li>
        </ul>
      </nav>'

# List of HTML files to update
HTML_FILES=(
  "index.html"
  "contact/index.html"
  "gallery/index.html"
  "about/index.html"
  "programs/index.html"
  "support/index.html"
  "support/volunteer.html"
  "support/membership.html"
  "support/donate.html"
  "events/index.html"
  "visit/index.html"
  "fairy.html"
  "sitemap.html"
  "terms.html"
  "privacy.html"
)

echo "Updating navigation in HTML files..."

for file in "${HTML_FILES[@]}"; do
  if [ -f "$file" ]; then
    echo "Updating $file..."

    # Using perl to do multi-line replacement
    perl -i -0pe 's/<nav id="mainNav">.*?<\/nav>/'"$NEW_NAV"'/s' "$file"

    echo "  ✓ Updated $file"
  else
    echo "  ✗ File not found: $file"
  fi
done

echo "Navigation update complete!"
