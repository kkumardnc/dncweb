#!/usr/bin/env node
// Posts the next upcoming events from the public Google Calendar ICS feed to a
// Google Chat space via incoming webhook.  The webhook URL is read from the
// GCHAT_CALENDAR_URL environment variable.
//
// Run locally:  GCHAT_CALENDAR_URL=https://chat.googleapis.com/... \
//                 node scripts/post-calendar-to-gchat.mjs

const CALENDAR_ID = 'c_981c56b4d09b99b96af9481e68dcc181cf7102482f19fcbcf71f453dc493d6d2@group.calendar.google.com';
const ICS_URL = `https://calendar.google.com/calendar/ical/${encodeURIComponent(CALENDAR_ID)}/public/basic.ics`;
const EVENT_COUNT = 5;
const TIME_ZONE = 'America/New_York';

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
    else if (name === 'LOCATION')    cur.location    = unescapeIcsText(value);
    else if (name === 'SUMMARY')     cur.summary     = unescapeIcsText(value);
    else if (name === 'STATUS')      cur.status      = value;
    else if (name === 'UID')         cur.uid         = value;
  }
  return events;
}

function formatEvent(event) {
  const opts = event.allDay
    ? { weekday: 'short', month: 'short', day: 'numeric', timeZone: 'UTC' }
    : { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', timeZone: TIME_ZONE };
  const when  = event.start.toLocaleString('en-US', opts);
  const title = event.summary || '(untitled)';
  const where = event.location ? ` — ${event.location}` : '';
  return `• *${title}* — ${when}${where}`;
}

async function postToGchat(webhookUrl, text) {
  const res = await fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=UTF-8' },
    body: JSON.stringify({ text }),
  });
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`Webhook POST failed: ${res.status} ${res.statusText} ${body}`);
  }
}

// ── Main ──────────────────────────────────────────────────────────────────────

const webhookUrl = process.env.GCHAT_CALENDAR_URL;
if (!webhookUrl) {
  console.error('GCHAT_CALENDAR_URL environment variable is required.');
  process.exit(1);
}

const ics      = await fetchIcs();
const events   = parseEvents(ics);
const now      = Date.now();
const upcoming = events
  .filter((e) => e.start && e.start.getTime() >= now && e.status !== 'CANCELLED')
  .sort((a, b) => a.start - b.start)
  .slice(0, EVENT_COUNT);

console.log(`Found ${upcoming.length} upcoming event(s).`);

if (upcoming.length === 0) {
  console.log('No upcoming events; skipping webhook post.');
  process.exit(0);
}

const header = `*Upcoming DNC events (next ${upcoming.length})*`;
const body   = upcoming.map(formatEvent).join('\n');
const text   = `${header}\n${body}`;

upcoming.forEach((e) => {
  console.log(`  - ${e.summary || '(untitled)'} @ ${e.start.toISOString()}`);
});

await postToGchat(webhookUrl, text);
console.log('Posted to Google Chat webhook.');
