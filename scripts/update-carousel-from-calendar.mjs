#!/usr/bin/env node
// Updates the homepage carousel with the next 6 upcoming events from the
// public Google Calendar ICS feed.  Slide 1 (static nature photo) is left
// untouched.  Slides 1-2 are the Summer Solstice launch video and the Explore
// Nature photo.  Event slides are injected between CAROUSEL-EVENTS-START /
// CAROUSEL-EVENTS-END markers and the kept static slides 2-4 follow them.
//
// Run locally:  node scripts/update-carousel-from-calendar.mjs

import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const CALENDAR_ID = 'c_981c56b4d09b99b96af9481e68dcc181cf7102482f19fcbcf71f453dc493d6d2@group.calendar.google.com';
const ICS_URL = `https://calendar.google.com/calendar/ical/${encodeURIComponent(CALENDAR_ID)}/public/basic.ics`;
const EVENT_SLIDE_COUNT = 6;
const STATIC_FIRST = 2;   // slide 1 (Summer Solstice video) + Explore Nature are always kept
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
    else if (name === 'RECURRENCE-ID') cur.recurrenceId = value;
    else if (name === 'RRULE')       cur.rrule       = value;
    else if (name === 'EXDATE') {
      // One occurrence date (calendar-date key) per EXDATE value to skip.
      const dateOnly = /VALUE=DATE(?!-TIME)/.test(params);
      cur.exDates = cur.exDates || [];
      for (const part of value.split(',')) {
        const d = parseDate(part, params);
        if (d) cur.exDates.push(dateKey(d, dateOnly ? 'UTC' : TIME_ZONE));
      }
    }
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

// When a single instance of a recurring event is edited, the ICS feed carries
// BOTH the RRULE "master" VEVENT and a separate RECURRENCE-ID "override" VEVENT
// for that occurrence, sharing the same date.  Collapse those (and any
// accidental exact duplicates) to one event per date+title, preferring the
// override since it holds the edited details.
function dedupeEvents(events) {
  const keyOf = (e) => `${dateKey(e.start, e.allDay ? 'UTC' : TIME_ZONE)}|${e.summary || ''}`;
  const chosen = new Map();
  for (const e of events) {
    const key = keyOf(e);
    const existing = chosen.get(key);
    if (!existing || (e.recurrenceId && !existing.recurrenceId)) chosen.set(key, e);
  }
  return events.filter((e) => chosen.get(keyOf(e)) === e);
}

// ── Recurrence expansion ────────────────────────────────────────────────────
//
// Google's basic.ics represents a recurring event as one or more RRULE "master"
// VEVENTs plus per-occurrence RECURRENCE-ID overrides.  A master's DTSTART is
// only the series anchor, NOT a guaranteed real occurrence: it may be removed by
// EXDATE or fall outside UNTIL.  Treating DTSTART as a literal event date is what
// surfaced a phantom "Monthly Community Trail Walk" on Aug 1 (a leftover
// "this-and-following" segment whose single date is excluded by its own EXDATE).
// So we expand each RRULE master into its actual occurrences, honoring
// FREQ/INTERVAL/COUNT/UNTIL/BYDAY/BYMONTHDAY and EXDATE, instead of trusting
// DTSTART.  Non-recurring VEVENTs (plain events and RECURRENCE-ID overrides) are
// kept as-is.

const WD = { SU: 0, MO: 1, TU: 2, WE: 3, TH: 4, FR: 5, SA: 6 };

function parseByDay(tok) {
  const m = tok.trim().match(/^([+-]?\d+)?(SU|MO|TU|WE|TH|FR|SA)$/i);
  if (!m) return null;
  return { ord: m[1] ? parseInt(m[1], 10) : 0, wd: WD[m[2].toUpperCase()] };
}

function parseRRule(s) {
  const out = { freq: null, interval: 1, count: null, until: null, byDay: [], byMonthDay: [] };
  for (const part of s.split(';')) {
    const [k, v = ''] = part.split('=');
    switch (k.toUpperCase()) {
      case 'FREQ':       out.freq = v.toUpperCase(); break;
      case 'INTERVAL':   out.interval = Math.max(1, parseInt(v, 10) || 1); break;
      case 'COUNT':      out.count = parseInt(v, 10) || null; break;
      case 'UNTIL':      out.until = v; break;
      case 'BYDAY':      out.byDay = v.split(',').map(parseByDay).filter(Boolean); break;
      case 'BYMONTHDAY': out.byMonthDay = v.split(',').map((n) => parseInt(n, 10)).filter(Number.isFinite); break;
    }
  }
  return out;
}

function daysInMonth(y, mo) { return new Date(Date.UTC(y, mo + 1, 0)).getUTCDate(); }
function weekdayOf(y, mo, d) { return new Date(Date.UTC(y, mo, d)).getUTCDay(); }

function nthWeekdayOfMonth(y, mo, wd, ord) {
  const dim = daysInMonth(y, mo);
  if (ord > 0) {
    const day = 1 + ((wd - weekdayOf(y, mo, 1) + 7) % 7) + (ord - 1) * 7;
    return day <= dim ? day : null;
  }
  // ord < 0: count back from the last day of the month.
  const day = dim - ((weekdayOf(y, mo, dim) - wd + 7) % 7) + (ord + 1) * 7;
  return day >= 1 ? day : null;
}

function untilKey(rawUntil) {
  if (!rawUntil) return null;
  const dateOnly = /^\d{8}$/.test(rawUntil);
  const d = parseDate(rawUntil, dateOnly ? 'VALUE=DATE' : '');
  return d ? dateKey(d, dateOnly ? 'UTC' : TIME_ZONE) : null;
}

// Expand one RRULE master VEVENT into concrete occurrence events that fall in
// [todayKey, horizonKey].  Returns [] when the rule produces nothing upcoming.
function expandEvent(event, todayKey, horizonKey) {
  const rule = parseRRule(event.rrule || '');
  if (!rule.freq || !event.start) return [];

  const tz       = event.allDay ? 'UTC' : TIME_ZONE;
  const exSet    = new Set(event.exDates || []);
  const uKey     = untilKey(rule.until);
  const startKey = dateKey(event.start, tz);
  const sY = event.start.getUTCFullYear(), sMo = event.start.getUTCMonth(), sD = event.start.getUTCDate();
  const hh = event.start.getUTCHours(), mm = event.start.getUTCMinutes(), ss = event.start.getUTCSeconds();
  const mk = (y, mo, d) => new Date(Date.UTC(y, mo, d, hh, mm, ss));

  const out = [];
  let generated = 0;
  let stopped = false;
  // Returns false to signal "stop expanding the series".
  const step = (occ) => {
    const k = dateKey(occ, tz);
    if (k < startKey) return true;              // before the series anchor
    if (uKey && k > uKey) return false;         // past UNTIL
    if (k > horizonKey) return false;           // past our look-ahead window
    generated += 1;
    if (rule.count && generated > rule.count) return false;
    if (!exSet.has(k) && k >= todayKey) {
      out.push({ ...event, start: occ, rrule: undefined, exDates: undefined, recurrenceId: undefined });
    }
    return true;
  };

  if (rule.freq === 'MONTHLY' || rule.freq === 'YEARLY') {
    const stepMonths = rule.freq === 'MONTHLY' ? rule.interval : 12 * rule.interval;
    for (let i = 0; i < 1200 && !stopped; i += 1) {
      const abs = sMo + i * stepMonths;
      const y = sY + Math.floor(abs / 12);
      const mo = ((abs % 12) + 12) % 12;
      let days = [];
      if (rule.byDay.length) {
        for (const { ord, wd } of rule.byDay) {
          if (ord) { const d = nthWeekdayOfMonth(y, mo, wd, ord); if (d) days.push(d); }
          else for (let d = 1; d <= daysInMonth(y, mo); d += 1) if (weekdayOf(y, mo, d) === wd) days.push(d);
        }
      } else if (rule.byMonthDay.length) {
        for (const d of rule.byMonthDay) days.push(d > 0 ? d : daysInMonth(y, mo) + 1 + d);
      } else {
        days.push(sD);
      }
      days = [...new Set(days)].filter((d) => d >= 1 && d <= daysInMonth(y, mo)).sort((a, b) => a - b);
      for (const d of days) if (!step(mk(y, mo, d))) { stopped = true; break; }
      if (!stopped && dateKey(mk(y, mo, 1), tz) > horizonKey) break;
    }
  } else if (rule.freq === 'WEEKLY' || rule.freq === 'DAILY') {
    const bydays = rule.byDay.length ? rule.byDay.map((b) => b.wd) : [event.start.getUTCDay()];
    const startMs = Date.UTC(sY, sMo, sD);
    for (let i = 0; i < 4000; i += 1) {
      const occ = mk(sY, sMo, sD + i);
      const k = dateKey(occ, tz);
      if ((uKey && k > uKey) || k > horizonKey) break;
      const dayMs = Date.UTC(occ.getUTCFullYear(), occ.getUTCMonth(), occ.getUTCDate());
      if (rule.freq === 'WEEKLY') {
        const weeks = Math.floor((dayMs - startMs) / (7 * 86400000));
        if (weeks % rule.interval !== 0 || !bydays.includes(occ.getUTCDay())) continue;
      } else if (i % rule.interval !== 0) {
        continue;
      }
      if (!step(occ)) break;
    }
  }

  return out;
}

// Replace RRULE masters with their concrete occurrences; pass everything else
// (plain events and RECURRENCE-ID overrides) through unchanged.
function expandRecurrences(events, todayKey, horizonKey) {
  return events.flatMap((e) => (e.rrule ? expandEvent(e, todayKey, horizonKey) : [e]));
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  const ics      = await fetchIcs();
  const events   = parseEvents(ics);
  const todayKey = dateKey(new Date(), TIME_ZONE);
  // Look ahead ~18 months when expanding open-ended recurrences (the carousel
  // only needs the next handful of events, but this bounds infinite RRULEs).
  const horizonKey = dateKey(new Date(Date.now() + 550 * 86400000), TIME_ZONE);

  // All-day events are parsed as UTC midnight on the event date, so their
  // calendar date lives in UTC; timed events use TIME_ZONE for their date.
  const upcoming = dedupeEvents(expandRecurrences(events, todayKey, horizonKey)
    .filter((e) => e.start && e.status !== 'CANCELLED'
      && dateKey(e.start, e.allDay ? 'UTC' : TIME_ZONE) >= todayKey)
    .sort((a, b) => a.start - b.start));

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
    return;
  }

  await writeFile(indexPath, updated);
  console.log(`Calendar events changed; wrote ${indexPath}`);
}

export { parseEvents, expandRecurrences, expandEvent, dedupeEvents, parseRRule, dateKey };

// Only run the updater when invoked directly (not when imported by tests).
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  await main();
}
