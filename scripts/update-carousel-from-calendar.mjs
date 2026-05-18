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
    if (line === 'BEGIN:VEVENT') { cur = {}; continue; }
    if (line === 'END:VEVENT')   { if (cur) events.push(cur); cur = null; continue; }
    if (!cur) continue;
    const colon = line.indexOf(':');
    if (colon < 0) continue;
    const left  = line.slice(0, colon);
    const value = line.slice(colon + 1);
    const semi  = left.indexOf(';');
    const name   = (semi < 0 ? left : left.slice(0, semi)).toUpperCase();
    const params = semi < 0 ? '' : left.slice(semi);

    if      (name === 'DTSTART')     cur.start       = parseDate(value, params);
    else if (name === 'DESCRIPTION') cur.description = unescapeIcsText(value);
    else if (name === 'SUMMARY')     cur.summary     = unescapeIcsText(value);
    else if (name === 'STATUS')      cur.status      = value;
    else if (name === 'UID')         cur.uid         = value;
  }
  return events;
}

function extractUrls(description) {
  if (!description) return { imageUrl: null, linkUrl: null };
  const stripped = description.replace(/<[^>]+>/g, ' ');
  const urls = stripped.match(/https?:\/\/[^\s<>"']+/g);
  if (!urls) return { imageUrl: null, linkUrl: null };
  const imgExt = /\.(jpe?g|png|gif|webp|avif|svg)(\?|#|$)/i;
  const imageUrl = urls.find((u) => imgExt.test(u)) || urls[0];
  const linkUrl = urls.find((u) => u !== imageUrl) || null;
  return { imageUrl, linkUrl };
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
  return `\
          <div class="carousel-slide">
            ${imgHtml}
            <div class="carousel-caption">
              <div class="container">
                <h2>${title}</h2>
                <p>${dateStr}</p>
                <a href="/events/" class="btn btn-primary">View Events</a>
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
const now      = Date.now();
const upcoming = events
  .filter((e) => e.start && e.start.getTime() >= now && e.status !== 'CANCELLED')
  .sort((a, b) => a.start - b.start);

const imageUrls   = [];
const linkUrls    = [];
const usedEvents  = [];
for (const event of upcoming) {
  if (imageUrls.length >= EVENT_SLIDE_COUNT) break;
  const { imageUrl, linkUrl } = extractUrls(event.description);
  if (imageUrl) { imageUrls.push(imageUrl); linkUrls.push(linkUrl); usedEvents.push(event); }
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
});

if (updated === html) {
  console.log(`No change detected in the next ${usedEvents.length} event(s); carousel slides are already up to date — site will not be updated.`);
  process.exit(0);
}

await writeFile(indexPath, updated);
console.log(`Calendar events changed; wrote ${indexPath}`);
