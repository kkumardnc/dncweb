#!/usr/bin/env node
// Updates the homepage carousel slide images from the public Google Calendar
// feed. The first https:// URL found in each upcoming event's description is
// used as the slide image, ordered by event start time (soonest first).
//
// Run locally:  node scripts/update-carousel-from-calendar.mjs

import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const CALENDAR_ID = 'c_581c56b4d09b99b96af9481e68dcc181cf7102482f19fcbcf71f453dc493d6d2@group.calendar.google.com';
const ICS_URL = `https://calendar.google.com/calendar/ical/${encodeURIComponent(CALENDAR_ID)}/public/basic.ics`;
const SLIDE_COUNT = 4;

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
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
    if (line === 'END:VEVENT') { if (cur) events.push(cur); cur = null; continue; }
    if (!cur) continue;
    const colon = line.indexOf(':');
    if (colon < 0) continue;
    const left = line.slice(0, colon);
    const value = line.slice(colon + 1);
    const semi = left.indexOf(';');
    const name = (semi < 0 ? left : left.slice(0, semi)).toUpperCase();
    const params = semi < 0 ? '' : left.slice(semi);

    if (name === 'DTSTART') cur.start = parseDate(value, params);
    else if (name === 'DESCRIPTION') cur.description = unescapeIcsText(value);
    else if (name === 'SUMMARY') cur.summary = unescapeIcsText(value);
    else if (name === 'STATUS') cur.status = value;
    else if (name === 'UID') cur.uid = value;
  }
  return events;
}

function extractImageUrl(description) {
  if (!description) return null;
  // Strip HTML tags Google sometimes wraps URLs in (<a href="...">...</a>).
  const stripped = description.replace(/<[^>]+>/g, ' ');
  const urls = stripped.match(/https?:\/\/[^\s<>"']+/g);
  if (!urls) return null;
  const imgExt = /\.(jpe?g|png|gif|webp|avif|svg)(\?|#|$)/i;
  const imageMatch = urls.find((u) => imgExt.test(u));
  return imageMatch || urls[0];
}

function updateCarousel(html, imageUrls) {
  const slideRe = /(<div class="carousel-slide[^"]*">\s*<img\s+src=")[^"]+(")/g;
  let i = 0;
  let replacements = 0;
  const updated = html.replace(slideRe, (match, p1, p2) => {
    const url = imageUrls[i++];
    if (!url) return match;
    replacements++;
    return p1 + url + p2;
  });
  return { updated, replacements };
}

const ics = await fetchIcs();
const events = parseEvents(ics);
const now = Date.now();
const upcoming = events
  .filter((e) => e.start && e.start.getTime() >= now && e.status !== 'CANCELLED')
  .sort((a, b) => a.start - b.start);

const imageUrls = [];
const usedEvents = [];
for (const event of upcoming) {
  if (imageUrls.length >= SLIDE_COUNT) break;
  const url = extractImageUrl(event.description);
  if (url) {
    imageUrls.push(url);
    usedEvents.push(event);
  }
}

if (imageUrls.length === 0) {
  console.log('No upcoming events with image URLs found; nothing to update.');
  process.exit(0);
}

const html = await readFile(indexPath, 'utf8');
const { updated, replacements } = updateCarousel(html, imageUrls);

console.log(`Found ${upcoming.length} upcoming event(s); applied ${replacements} slide image update(s):`);
usedEvents.forEach((e, i) => {
  console.log(`  Slide ${i + 1}: ${e.summary || '(untitled)'} @ ${e.start.toISOString()}`);
  console.log(`           -> ${imageUrls[i]}`);
});

if (updated === html) {
  console.log('Carousel already matches calendar; no file changes.');
  process.exit(0);
}

await writeFile(indexPath, updated);
console.log(`Wrote ${indexPath}`);
