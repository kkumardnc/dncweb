#!/bin/bash
#
# Keeps the site navigation identical on every page.
#
# The canonical menu is the NAV heredoc below. Edit the menu there, then run
# this script: it replaces the <nav id="mainNav"> ... </nav> block on every
# page that has one, keeping each page's own indentation.
#
#   ./update-navigation.sh           apply the menu to every page
#   ./update-navigation.sh --check   list the pages that would change, write nothing
#
# Pages are discovered automatically, so a new page picks up the menu as soon
# as it contains a <nav id="mainNav"> block. Nothing else on the page is
# touched.

set -euo pipefail
cd "$(dirname "$0")"

CHECK=0
if [ "${1:-}" = "--check" ]; then
  CHECK=1
elif [ -n "${1:-}" ]; then
  echo "usage: $0 [--check]" >&2
  exit 2
fi

NAV_FILE="$(mktemp)"
TMP_OUT="$(mktemp)"
trap 'rm -f "$NAV_FILE" "$TMP_OUT"' EXIT

# --- Canonical navigation -----------------------------------------------
# Written with a two-space indent step; the indent step of each page is
# detected and reproduced, so this stays readable here without reformatting
# pages that nest more deeply.
cat > "$NAV_FILE" <<'NAV'
<nav id="mainNav">
  <ul>
    <li><a href="/">Home</a></li>
    <li class="has-dropdown">
      <a href="/about/">About</a>
      <ul class="dropdown">
        <li><a href="/about/">About</a></li>
        <li><a href="/assets/History-of-Demarest.pdf" target="_blank" rel="noopener">History of Demarest</a></li>
        <li><a href="/about/board.html">Board of Trustees</a></li>
        <li><a href="/about/mission.html">Our Mission</a></li>
        <li><a href="/about/policies.html">Policies</a></li>
        <li><a href="/about/policies.html#meetings">Monthly Board Meetings</a></li>
        <li><a href="/support/membership.html">Membership</a></li>
        <li><a href="/contact/">Contact</a></li>
      </ul>
    </li>
    <li class="has-dropdown">
      <a href="/visit/">Maps and Trails</a>
      <ul class="dropdown">
        <li><a href="/visit/#getting-here">Getting Here</a></li>
        <li><a href="/eco0/">EcoExplorer Guides</a></li>
        <li><a href="/visit/#trail-maps">Trail Map</a></li>
      </ul>
    </li>
    <li class="has-dropdown">
      <a href="/events/">News and Events</a>
      <ul class="dropdown">
        <li><a href="/events/">Upcoming Events</a></li>
        <li><a href="/events/#nature-walks">Nature Walks</a></li>
        <li><a href="/newsletter/">Newsletter</a></li>
        <li><a href="/fall-festival/">Oktoberfest/Fall Festival</a></li>
        <li><a href="/events/#crafter-vendor">Crafter &amp; Vendor</a></li>
        <li><a href="/scholarship/">Scholarship</a></li>
        <li><a href="/photocontest/">John C. Goodwin Photo Contest</a></li>
        <li><a href="/photocontest/2026-winners/">2026 Photo Contest Winners</a></li>
      </ul>
    </li>
    <li class="has-dropdown">
      <a href="/programs/">Public Services</a>
      <ul class="dropdown">
        <li><a href="/support/volunteer.html">Volunteer Program</a></li>
        <li><a href="/programs/">Educational Programs</a></li>
        <li><a href="/programs/#what-we-sponsor">What We Sponsor</a></li>
        <li><a href="/about/#preservation">Preservation</a></li>
        <li class="has-submenu"><a href="/research/">Research</a>
          <ul class="submenu">
            <li><a href="/research/deer.html">Deer Population</a></li>
          </ul>
        </li>
      </ul>
    </li>
    <li><a href="/events/#calendar">Calendar</a></li>
    <li><a href="https://dncshop.merchologysolutions.com/" target="_blank" rel="noopener noreferrer">Shop</a></li>
  </ul>
</nav>
NAV
# ------------------------------------------------------------------------

mapfile -t FILES < <(
  grep -rl --include='*.html' --exclude-dir=node_modules \
    '<nav id="mainNav">' . | sed 's|^\./||' | sort
)

if [ "${#FILES[@]}" -eq 0 ]; then
  echo "No pages with a <nav id=\"mainNav\"> block found." >&2
  exit 1
fi

changed=0
unchanged=0

for file in "${FILES[@]}"; do
  # Rebuild the nav block with this page's own base indent and indent step.
  if ! NAV_FILE="$NAV_FILE" perl -0777 -e '
    my $src = do { local $/; <STDIN> };
    my $nav = do {
      open my $fh, "<", $ENV{NAV_FILE} or die "$!";
      local $/; my $t = <$fh>; close $fh; $t =~ s/\s+\z//; $t;
    };

    my $hits = 0;
    $src =~ s{^([ \t]*)<nav id="mainNav">(.*?)</nav>}{
      my ($tag_indent, $body) = ($1, $2);
      $hits++;

      # Derive the indentation from the nav contents rather than from the
      # opening tag: on several pages the <nav> tag itself sits at a stray
      # indent much deeper than the menu inside it, and following that would
      # push the whole menu across the page.
      my ($ul_indent) = $body =~ /\n([ \t]*)<ul\b/;
      my ($li_indent) = $body =~ /\n([ \t]*)<li\b/;

      my $step = "  ";
      if (defined $ul_indent && defined $li_indent
          && length($li_indent) > length($ul_indent)) {
        $step = " " x (length($li_indent) - length($ul_indent));
      }

      my $base = $tag_indent;
      if (defined $ul_indent && length($ul_indent) >= length($step)) {
        # <nav> sits one step shallower than the <ul> it contains.
        $base = " " x (length($ul_indent) - length($step));
      }

      my $out = $nav;
      # The template is written with a two-space step; re-emit it at the
      # step this page uses, under this page@s base indent.
      $out =~ s{^([ ]*)}{$base . ($step x (length($1) / 2))}gme;
      $out;
    }gems;

    die "expected exactly one nav block, found $hits\n" unless $hits == 1;
    print $src;
  ' < "$file" > "$TMP_OUT"; then
    echo "  ! skipped $file (nav block could not be rewritten)" >&2
    continue
  fi

  # Never let a failed rewrite truncate a page.
  if [ ! -s "$TMP_OUT" ]; then
    echo "  ! skipped $file (rewrite produced an empty file)" >&2
    continue
  fi

  if cmp -s "$file" "$TMP_OUT"; then
    unchanged=$((unchanged + 1))
    continue
  fi

  changed=$((changed + 1))
  if [ "$CHECK" -eq 1 ]; then
    echo "  would update $file"
  else
    cat "$TMP_OUT" > "$file"
    echo "  ✓ updated $file"
  fi
done

echo
if [ "$CHECK" -eq 1 ]; then
  echo "$changed page(s) would change, $unchanged already current."
else
  echo "$changed page(s) updated, $unchanged already current."
fi
