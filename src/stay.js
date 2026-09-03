/* ============================================================
   Stay rules
   ------------------------------------------------------------
   The Ranch sells fixed-length stays, not arbitrary date ranges — and the
   two properties run genuinely different booking mechanics, not one rule
   with different constants:

     Hudson Valley — check-in Thursday or Sunday.
       Sunday check-in  → Thursday (4 nights) or the following Sunday (7 nights)
       Thursday check-in → Sunday (3 nights) or the following Thursday (7 nights)
       Extension: one extra night *after* a Thursday check-out (to Friday).

     Malibu — check-in Saturday or Sunday.
       Sunday check-in   → Saturday (6 nights) or the following Sunday (7 nights)
       Saturday check-in → the following Saturday (7 nights) or Sunday (8 nights)
       Extension: a Saturday *pre-night* before a Sunday check-in, priced
       at the property's own preNightRate rather than the programme rate.
       "Shorter Days" (data flag `stayRules.shorterStays`) adds a Thursday
       check-in for a 3-night Thu→Sun stay, and a 4-night Sun→Thu option
       on top of the signature Sunday check-in.

   Every function here takes the property id first and is pure — no store,
   no React — so a page and the ReserveDrawer widget can both ask the same
   question and never disagree about the answer. Confirmed against
   docs/content/CONTENT-SOURCE.md section 2 and the worked dates in
   docs/BRIEF.md's successor task: Hudson Sun 6 Sep 2026 → Thu 10 Sep /
   Sun 13 Sep; Malibu Sun 6 Sep 2026 → Sat 12 Sep / Sun 13 Sep; Malibu
   Sat 5 Sep 2026 → Sat 12 Sep / Sun 13 Sep.
   ============================================================ */

import D from './data.js';
import { addDays, iso, parse, sameDay } from './utils.js';

const SUNDAY = 0;
const THURSDAY = 4;
const SATURDAY = 6;

/** Whether `date` is a valid check-in day at this property. */
export function isCheckInDay(pid, date) {
  if (!date) return false;
  const rules = D.properties[pid] && D.properties[pid].stayRules;
  if (!rules) return false;
  const dow = date.getDay();
  if (pid === 'hudson') return dow === SUNDAY || dow === THURSDAY;
  if (pid === 'malibu') {
    if (dow === SATURDAY || dow === SUNDAY) return true;
    if (dow === THURSDAY && rules.shorterStays) return true;
    return false;
  }
  return false;
}

/** The check-outs a given check-in allows, as Date objects. Returns []
    for a date that was never a valid check-in in the first place, rather
    than guessing. */
export function checkoutsFor(pid, checkIn) {
  if (!checkIn) return [];
  const rules = D.properties[pid] && D.properties[pid].stayRules;
  if (!rules) return [];
  const dow = checkIn.getDay();

  if (pid === 'hudson') {
    if (dow === SUNDAY) return [addDays(checkIn, 4), addDays(checkIn, 7)];
    if (dow === THURSDAY) return [addDays(checkIn, 3), addDays(checkIn, 7)];
    return [];
  }

  if (pid === 'malibu') {
    if (dow === SUNDAY) {
      const outs = [addDays(checkIn, 6), addDays(checkIn, 7)];
      if (rules.shorterStays) outs.unshift(addDays(checkIn, 4)); /* Sun→Thu, 4 nights */
      return outs;
    }
    if (dow === SATURDAY) return [addDays(checkIn, 7), addDays(checkIn, 8)];
    if (dow === THURSDAY && rules.shorterStays) return [addDays(checkIn, 3)]; /* Thu→Sun, 3 nights */
    return [];
  }

  return [];
}

/** Whether this stay can pick up its property's one kind of extra night —
    Hudson's Friday post-night (depends on the check-out day) or Malibu's
    Saturday pre-night (depends on the check-in day). `checkOut` is
    accepted but unused for Malibu, kept so callers don't have to branch
    on property before calling. */
export function canExtend(pid, checkIn, checkOut) {
  const rules = D.properties[pid] && D.properties[pid].stayRules;
  if (!rules) return false;
  if (pid === 'hudson') return !!checkOut && checkOut.getDay() === THURSDAY;
  if (pid === 'malibu') return !!checkIn && checkIn.getDay() === SUNDAY;
  return false;
}

/** Whole nights between two dates, floor-safe against DST by working in
    local midnights (both arguments are expected already at start-of-day). */
export function nightsBetween(checkIn, checkOut) {
  if (!checkIn || !checkOut) return 0;
  return Math.max(0, Math.round((checkOut - checkIn) / 864e5));
}

/** The retreat flagged on this date at this property, or null. Retreat
    dates are always valid check-in days — a retreat is a themed version of
    an ordinary stay, so it never needs a rule of its own to be selectable. */
export function retreatFor(pid, date) {
  if (!pid || !date) return null;
  const list = D.retreats[pid] || [];
  const target = iso(date);
  return list.find((r) => r.date === target) || null;
}

/** True when `date` is itself flagged as a retreat check-in — used by the
    calendar to tint the column. */
export function isRetreatDate(pid, date) {
  return !!retreatFor(pid, date);
}

/** The retreat that falls inside a candidate stay, or null — used by the
    check-out calendar (a check-out date whose resulting stay would pass
    through a retreat check-in carries the marker too, not just the
    check-in day itself) and by the state-C summary card (does *this*
    booked stay include a retreat). Half-open on the check-out end, same
    as every other range in this file: a retreat landing exactly on
    check-out is the next guest's stay, not this one's. */
export function retreatInStay(pid, checkIn, checkOut) {
  if (!pid || !checkIn || !checkOut) return null;
  const list = D.retreats[pid] || [];
  return list.find((r) => {
    const d = parse(r.date);
    return d >= checkIn && d < checkOut;
  }) || null;
}

/** Every retreat at this property landing in a given calendar month —
    what the stacked cards under the calendar render. */
export function retreatsInMonth(pid, y, m) {
  const list = D.retreats[pid] || [];
  return list.filter((r) => {
    const d = parse(r.date);
    return d.getFullYear() === y && d.getMonth() === m;
  });
}

/** The retreat a stored `program` choice's `id` refers to — a retreat's
    own `date` is used as its id (see ProgramChoice.jsx), since it is
    already unique per property. What StayRail and Confirmation read to
    print the programme's real name from `state.program`. */
export function retreatById(pid, id) {
  if (!pid || !id) return null;
  const list = D.retreats[pid] || [];
  return list.find((r) => r.date === id) || null;
}

/** One-line stay description, built from D.includes rather than
    hard-coded — "{N}-night stay at {property}" plus "Includes daily
    {massage}, daily {hikes}, and all {meals}." Pulls the noun each
    item's own title already carries (Daily massage → massage, Daily
    hikes, fitness and yoga → hikes, All meals and snacks → meals)
    instead of copying a wire's literal sentence, so a future edit to
    D.includes's titles updates every reader of this function at once.
    Shared between DatePicker's "Your Chosen Stay" card and
    ProgramChoice's tray/inline summary line — moved here (Sep 2026,
    program-choice pass) from DatePicker.jsx, where it started as a
    private helper, once a second component needed the same text. */
export function stayDescription(pid, nights) {
  const word = (icon, prefix) => {
    const item = D.includes.find((i) => i.icon === icon);
    return item ? item.title.replace(prefix, '').split(/[ ,]/)[0].toLowerCase() : '';
  };
  const massage = word('spa', /^Daily /) || 'massage';
  const hikes = word('hike', /^Daily /) || 'hikes';
  const meals = word('dining', /^All /) || 'meals';
  const propertyShort = D.properties[pid].name.replace('The Ranch ', '');
  return {
    title: nights + '-night stay at ' + propertyShort,
    rest: 'Includes daily ' + massage + ', daily ' + hikes + ', and all ' + meals + '.',
  };
}

export { addDays, iso, parse, sameDay };
