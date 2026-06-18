#!/usr/bin/env node
// Offline tests for the calendar recurrence handling in
// update-carousel-from-calendar.mjs.  The fixture mirrors the real VEVENT
// structure of the public Demarest Nature Center feed (captured 2026-06-18),
// where a leftover "this-and-following" segment anchored on Aug 1 — with Aug 1
// removed by its own EXDATE — used to surface a phantom carousel slide.
//
// Run:  node scripts/test-recurrence.mjs

import assert from 'node:assert/strict';
import { parseEvents, expandRecurrences, dedupeEvents, dateKey } from './update-carousel-from-calendar.mjs';

const TZ = 'America/New_York';
const IMG = 'https://www.demarestnaturecenter.org/photocontest/2026/brook_taide.jpg';

// Real recurring "Community Trail Walk" structure from the live ICS feed.
const FIXTURE = [
  // #1 Leftover Aug-1 segment: its only date is excluded by EXDATE -> no events.
  ['Monthly Community Trail Walk', '20260801T100000',
   'RRULE:FREQ=MONTHLY;UNTIL=20260905T035959Z;BYDAY=1SA', 'EXDATE;TZID=America/New_York:20260801T100000', null],
  // #2 Edited override for Sept 5 (legitimate).
  ['Monthly Community Trail Walk', '20260905T100000', null, null, '20260905T100000'],
  // #4 Active monthly master from Sept 5 onward (no UNTIL), Oct 3 excluded.
  ['Monthly Community Trail Walk', '20260905T100000',
   'RRULE:FREQ=MONTHLY;BYDAY=1SA', 'EXDATE;TZID=America/New_York:20261003T100000', null],
  // #5 Original series, ended June 6 2026.
  ['Community Trail Walk', '20240106T100000',
   'RRULE:FREQ=MONTHLY;UNTIL=20260606T035959Z;BYDAY=1SA', 'EXDATE;TZID=America/New_York:20260207T100000', null],
  // #7 Edited override for Nov 7 (legitimate).
  ['Monthly Community Trail Walk', '20261107T100000', null, null, '20261107T100000'],
  // #10 Middle segment June 6 -> Aug 1 (UNTIL July 31 local), July 4 excluded.
  ['Monthly Community Trail Walk', '20260606T100000',
   'RRULE:FREQ=MONTHLY;UNTIL=20260801T035959Z;BYDAY=1SA', 'EXDATE;TZID=America/New_York:20260704T100000', null],
  // #8 Standalone (non-recurring) Community Trail Walk on Oct 10.
  ['Community Trail Walk', '20261010T100000', null, null, null],
];

function vevent([summary, dtstart, rrule, exdate, recurrenceId]) {
  const lines = ['BEGIN:VEVENT', `SUMMARY:${summary}`, `DTSTART;TZID=America/New_York:${dtstart}`,
    `DESCRIPTION:${IMG}`];
  if (rrule) lines.push(rrule);
  if (exdate) lines.push(exdate);
  if (recurrenceId) lines.push(`RECURRENCE-ID;TZID=America/New_York:${recurrenceId}`);
  lines.push('STATUS:CONFIRMED', 'END:VEVENT');
  return lines.join('\r\n');
}

const ics = ['BEGIN:VCALENDAR', ...FIXTURE.map(vevent), 'END:VCALENDAR'].join('\r\n');

const todayKey   = '2026-06-18';
const horizonKey = '2027-12-31';

const events   = parseEvents(ics);
const upcoming = dedupeEvents(expandRecurrences(events, todayKey, horizonKey)
  .filter((e) => e.start && e.status !== 'CANCELLED'
    && dateKey(e.start, e.allDay ? 'UTC' : TZ) >= todayKey)
  .sort((a, b) => a.start - b.start));

const keys = upcoming.map((e) => dateKey(e.start, TZ));
console.log('Upcoming trail-walk dates:', keys.join(', '));

// The phantom Aug 1 walk must be gone.
assert.ok(!keys.includes('2026-08-01'), 'Aug 1 phantom slide must NOT appear');
// Legitimate occurrences must remain.
assert.ok(keys.includes('2026-09-05'), 'Sept 5 walk should appear');
assert.ok(keys.includes('2026-10-10'), 'Oct 10 standalone walk should appear');
assert.ok(keys.includes('2026-11-07'), 'Nov 7 walk should appear');
assert.ok(keys.includes('2026-12-05'), 'Dec 5 walk (from active master) should appear');
// Excluded / past dates must not leak in.
assert.ok(!keys.includes('2026-10-03'), 'Oct 3 is an EXDATE and must be skipped');
assert.ok(!keys.includes('2026-06-06'), 'June 6 is in the past and must be skipped');
assert.ok(!keys.includes('2026-07-04'), 'July 4 is an EXDATE and must be skipped');
// No duplicate dates after dedupe.
assert.equal(new Set(keys).size, keys.length, 'no duplicate dates');

console.log('All recurrence tests passed.');
