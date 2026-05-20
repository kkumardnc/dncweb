#!/usr/bin/env node
// Updates the homepage carousel with the next 6 upcoming events from the
// public Google Calendar ICS feed.  Slide 1 (static nature photo) is left
// untouched.  Event slides are injected between CAROUSEL-EVENTS-START /
// CAROUSEL-EVENTS-END markers and the existing static slides 2-4 are kept.
//
// Run locally:  node scripts/update-carousel-from-calendar.mjs

import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const CALENDAR_ID = 'c_981c56b4d09b99b96af9481e68dcc181cf7102482f19fcbcf71f453dc493d6d2@group.calendar.google.com';
const ICS_URL = `https://calendar.google.com/calendar/ical/${encodeURIComponent(CALENDAR_ID)}/public/basic.ics`;
const EVENT_SLIDE_COUNT = 6;
const STATIC_FIRST = 1;   // slide 1 is always kept
const STATIC_REST  = 3;   // slides 2-4 are always kept at the end
const TIME_ZONE    = 'America/New_York';

// YYYY-MM-DD calendar date for `date` in `tz`.  Lexicographic ordering on
// the result matches calendar-date ordering, so callers can compare event
// dates against today with a simple `>=`.
function dateKey(date, tz) {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit',
  }).format(date);
}

const repoRoot  = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const indexPath = path.join(repoRoot, 'index.html');

async function fetchIcs() {
  const res = await fetch(ICS_URL);
  if (!res.ok) throw new Error(`ICS fetch failed: ${res.status} ${res.statusText}`);
  return res.text();
}

function unfold(ics) {
  return ics.replace(/\r?\n[ \t]/g, '');
}

function parseDate(value, params) {
  const isDateOnly = /VALUE=DATE(?!-TIME)/.test(params);
  if (isDateOnly) {
    const m = value.match(/^(\d{4})(\d{2})(\d{2})/);
    if (!m) return null;
    return new Date(Date.UTC(+m[1], +m[2] - 1, +m[3]));
  }
  const m = value.match(/^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})(Z?)/);
  if (!m) return null;
  return new Date(Date.UTC(+m[1], +m[2] - 1, +m[3], +m[4], +m[5], +m[6]));
}

function unescapeIcsText(s) {
  return s
    .replace(/\\n/gi, '\n')
    .replace(/\\,/g, ',')
    .replace(/\\;/g, ';')
    .replace(/\\\\/g, '\\');
}

function parseEvents(ics) {
  const lines = unfold(ics).split(/\r?\n/);
  const events = [];
  let cur = null;
  for (const line of lines) {
    if (line === 'BEGIN:VEVENT') { cur = { allDay: false }; continue; }
    if (line === 'END:VEVENT')   { if (cur) events.push(cur); cur = null; continue; }
    if (!cur) continue;
    const colon = line.indexOf(':');
    if (colon < 0) continue;
    const left  = line.slice(0, colon);
    const value = line.slice(colon + 1);
    const semi  = left.indexOf(';');
    const name   = (semi < 0 ? left : left.slice(0, semi)).toUpperCase();
    const params = semi < 0 ? '' : left.slice(semi);

    if      (name === 'DTSTART')     { cur.start = parseDate(value, params); cur.allDay = /VALUE=DATE(?!-TIME)/.test(params); }
    else if (name === 'DESCRIPTION') cur.description = unescapeIcsText(value);
    else if (name === 'X-ALT-DESC')  cur.altDesc     = unescapeIcsText(value);
    else if (name === 'SUMMARY')     cur.summary     = unescapeIcsText(value);
    else if (name === 'STATUS')      cur.status      = value;
    else if (name === 'UID')         cur.uid         = value;
  }
  return events;
}

function collectUrls(text) {
  if (!text) return [];
  const found = new Set();
  // href="..." / href='...' attributes (HTML versions in X-ALT-DESC may
  // carry the full URL where the plain-text DESCRIPTION only shows a
  // truncated display label).
  for (const m of text.matchAll(/href\s*=\s*["']([^"']+)["']/gi)) {
    if (/^https?:\/\//i.test(m[1])) found.add(decodeGoogleRedirect(m[1]));
  }
  // Bare URLs in plain text (after stripping HTML tags).
  const stripped = text.replace(/<[^>]+>/g, ' ');
  for (const u of stripped.match(/https?:\/\/[^\s<>"']+/g) || []) {
    found.add(decodeGoogleRedirect(u));
  }
  return [...found];
}

function decodeGoogleRedirect(url) {
  // Google Calendar wraps outbound links as https://www.google.com/url?q=<real>&...
  const m = url.match(/^https?:\/\/www\.google\.com\/url\?(?:[^&]*&)*q=([^&]+)/i);
  if (!m) return url;
  try { return decodeURIComponent(m[1]); } catch { return url; }
}

function extractUrls(event) {
  const urls = [
    ...collectUrls(event.description),
    ...collectUrls(event.altDesc),
  ];
  if (urls.length === 0) return { imageUrl: null, linkUrl: null };
  const imgExt = /\.(jpe?g|png|gif|webp|avif|svg)(\?|#|$)/i;
  const imageUrl = urls.find((u) => imgExt.test(u)) || urls[0];
  // Prefer the deepest/longest non-image URL so a generic
  // "https://example.com/" doesn't beat "https://example.com/specific/page".
  const candidates = [...new Set(urls.filter((u) => u !== imageUrl))];
  const linkUrl = candidates.length
    ? candidates.reduce((a, b) => (b.length > a.length ? b : a))
    : null;
  return { imageUrl, linkUrl, allUrls: urls };
}

function escapeAttr(s) {
  return s.replace(/&/g, '&amp;').replace(/"/g, '&quot;');
}

function buildEventSlide(event, imageUrl, linkUrl) {
  const title   = escapeAttr(event.summary || 'Upcoming Event');
  const dateStr = event.start.toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric',
    timeZone: 'America/New_York',
  });
  const imgTag = `<img src="${imageUrl}" alt="${title}">`;
  const imgHtml = linkUrl
    ? `<a href="${escapeAttr(linkUrl)}" target="_blank" rel="noopener">${imgTag}</a>`
    : imgTag;
  const button = linkUrl
    ? `<a href="${escapeAttr(linkUrl)}" target="_blank" rel="noopener" class="btn btn-primary">Learn More</a>`
    : `<a href="/events/" class="btn btn-primary">View Events</a>`;
  return `\
          <div class="carousel-slide">
            ${imgHtml}
            <div class="carousel-caption">
              <div class="container">
                <h2>${title}</h2>
                <p>${dateStr}</p>
                ${button}
              </div>
            </div>
          </div>`;
}

function buildIndicators(totalSlides) {
  return Array.from({ length: totalSlides }, (_, i) =>
    `          <button${i === 0 ? ' class="active"' : ''} aria-label="Slide ${i + 1}"></button>`
  ).join('\n');
}

function updateCarousel(html, events, imageUrls, linkUrls) {
  // Replace event slide zone
  const eventSlidesHtml = events.length
    ? '\n' + events.map((e, i) => buildEventSlide(e, imageUrls[i], linkUrls[i])).join('\n') + '\n          '
    : '';

  let updated = html.replace(
    /<!-- CAROUSEL-EVENTS-START -->[\s\S]*?<!-- CAROUSEL-EVENTS-END -->/,
    `<!-- CAROUSEL-EVENTS-START -->${eventSlidesHtml}<!-- CAROUSEL-EVENTS-END -->`,
  );

  // Rebuild indicators for total slide count
  const totalSlides = STATIC_FIRST + events.length + STATIC_REST;
  const indicators  = buildIndicators(totalSlides);

  updated = updated.replace(
    /<!-- CAROUSEL-INDICATORS-START -->[\s\S]*?<!-- CAROUSEL-INDICATORS-END -->/,
    `<!-- CAROUSEL-INDICATORS-START -->\n${indicators}\n          <!-- CAROUSEL-INDICATORS-END -->`,
  );

  return updated;
}

// ── Main ──────────────────────────────────────────────────────────────────────

const ics      = await fetchIcs();
const events   = parseEvents(ics);
const todayKey = dateKey(new Date(), TIME_ZONE);
// All-day events are parsed as UTC midnight on the event date, so their
// calendar date lives in UTC; timed events use TIME_ZONE for their date.
const upcoming = events
  .filter((e) => e.start && e.status !== 'CANCELLED'
    && dateKey(e.start, e.allDay ? 'UTC' : TIME_ZONE) >= todayKey)
  .sort((a, b) => a.start - b.start);

const imageUrls   = [];
const linkUrls    = [];
const usedEvents  = [];
const debugUrls   = [];
for (const event of upcoming) {
  if (imageUrls.length >= EVENT_SLIDE_COUNT) break;
  const { imageUrl, linkUrl, allUrls } = extractUrls(event);
  if (imageUrl) {
    imageUrls.push(imageUrl);
    linkUrls.push(linkUrl);
    usedEvents.push(event);
    debugUrls.push(allUrls);
  }
}

if (imageUrls.length === 0) {
  console.log('No upcoming events with image URLs found; clearing event slides.');
}

const html    = await readFile(indexPath, 'utf8');
const updated = updateCarousel(html, usedEvents, imageUrls, linkUrls);

console.log(`Found ${upcoming.length} upcoming event(s); inserting ${usedEvents.length} event slide(s):`);
usedEvents.forEach((e, i) => {
  console.log(`  Slide ${STATIC_FIRST + i + 1}: ${e.summary || '(untitled)'} @ ${e.start.toISOString()}`);
  console.log(`           -> img: ${imageUrls[i]}`);
  if (linkUrls[i]) console.log(`           -> link: ${linkUrls[i]}`);
  if (debugUrls[i] && debugUrls[i].length > 1) {
    console.log(`           -> all URLs found: ${debugUrls[i].join(' | ')}`);
  }
});

if (updated === html) {
  console.log(`No change detected in the next ${usedEvents.length} event(s); carousel slides are already up to date — site will not be updated.`);
  process.exit(0);
}

await writeFile(indexPath, updated);
console.log(`Calendar events changed; wrote ${indexPath}`);
