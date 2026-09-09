/* ============================================================
   Stay rules
   ------------------------------------------------------------
   The Ranch sells fixed-length stays, not arbitrary date ranges — and the
   two properties run genuinely different booking mechanics, not one rule
   with different constants. Rewritten for the client's second feedback
   round (9 Sep 2026) — see docs/PRODUCTION-NOTES.md for the dated entry —
   which replaces both properties' rules outright rather than adjusting
   constants on the previous shape:

     Malibu — check-in Sunday only, a fixed 6-night core stay,
       Sunday → Saturday. Guests may add a Saturday night *before* the
       core stay, a Sunday night *after* it, or both (6/7/8 nights total).
       Both extra nights price at the property's own preNightRate — the
       brief has no separate post-night figure, so the same rate is used
       for both and flagged as an assumption (see PRODUCTION-NOTES).

     Hudson Valley — check-in Thursday or Monday, a fixed 3-night core
       stay: Thursday → Sunday, or Monday → Thursday. Guests may add the
       Sunday night that sits between the two patterns — before a Monday
       check-in, or after a Thursday→Sunday check-out — never both on the
       same stay, since a stay only ever runs one of the two patterns.
       The extra night prices at the room's own nightly rate, same as the
       rest of the stay.

   Every function here takes the property id first and is pure — no store,
   no React — so a page and the ReserveDrawer widget can both ask the same
   question and never disagree about the answer. Worked dates confirmed
   against the client's own examples: Malibu Sun 13 Sep 2026 → Sat 19 Sep
   only; Hudson Thu 17 Sep 2026 → Sun 20 Sep, and Mon 21 Sep 2026 → Thu 24
   Sep.
   ============================================================ */

import D from './data.js';
import { addDays, iso, parse, sameDay } from './utils.js';

const SUNDAY = 0;
const MONDAY = 1;
const THURSDAY = 4;

/* Both properties now use identical wording for the two extension
   checkboxes — "before"/"after" already say which end each one adds,
   so there is nothing left for a property-specific label to add. Shared
   here so DatePicker, ReserveDrawer, and Upgrade can never drift into
   slightly different copy for the same control. */
export const EXTENSION_LABELS = {
  pre: 'Add an extra night before your stay',
  post: 'Add an extra night after your stay',
};

/** Whether `date` is a valid check-in day at this property. */
export function isCheckInDay(pid, date) {
  if (!date) return false;
  const rules = D.properties[pid] && D.properties[pid].stayRules;
  if (!rules) return false;
  const dow = date.getDay();
  if (pid === 'hudson') return dow === THURSDAY || dow === MONDAY;
  if (pid === 'malibu') return dow === SUNDAY;
  return false;
}

/** The check-outs a given check-in allows, as Date objects. Returns []
    for a date that was never a valid check-in in the first place, rather
    than guessing. Both properties now offer exactly one core check-out
    per valid check-in — no more Friday check-outs, no more 5-night
    stays. */
export function checkoutsFor(pid, checkIn) {
  if (!checkIn) return [];
  const rules = D.properties[pid] && D.properties[pid].stayRules;
  if (!rules) return [];
  const dow = checkIn.getDay();

  if (pid === 'hudson') {
    if (dow === THURSDAY) return [addDays(checkIn, 3)]; /* Thu → Sun */
    if (dow === MONDAY) return [addDays(checkIn, 3)]; /* Mon → Thu */
    return [];
  }

  if (pid === 'malibu') {
    if (dow === SUNDAY) return [addDays(checkIn, 6)]; /* Sun → Sat */
    return [];
  }

  return [];
}

/** Which of a stay's two possible extra nights — `pre` (the night before
    check-in) and `post` (the night after check-out) — are available for
    this particular core stay. Malibu's core is always Sunday→Saturday, so
    both the Saturday pre-night and the Sunday post-night are always on
    offer together. Hudson's one extra night is the Sunday that sits
    between its two core patterns: offered as a pre-night before a Monday
    check-in, or a post-night after a Thursday→Sunday check-out — a given
    stay only ever runs one of those two patterns, so it only ever offers
    one direction, never both. */
export function extensionOptions(pid, checkIn, checkOut) {
  if (!checkIn || !checkOut) return { pre: false, post: false };
  const dow = checkIn.getDay();
  if (pid === 'malibu') return { pre: true, post: true };
  if (pid === 'hudson') {
    if (dow === MONDAY) return { pre: true, post: false };
    if (dow === THURSDAY) return { pre: false, post: true };
    return { pre: false, post: false };
  }
  return { pre: false, post: false };
}

/** Whether this stay can pick up either of its property's extra nights at
    all — a plain boolean for callers that only need to gate a block of UI
    on and off, not which direction(s) it offers. */
export function canExtend(pid, checkIn, checkOut) {
  const opts = extensionOptions(pid, checkIn, checkOut);
  return opts.pre || opts.post;
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

/** One-line stay description — "{N}-night stay in {property}" plus a
    fixed "Includes daily massage, guided hikes, and all meals." Used to
    pull its three nouns out of D.includes's own titles (Daily massage →
    massage, etc.) so an edit to the includes list updated this sentence
    for free; the client-feedback pass (8 Sep 2026) rewrote those titles
    to longer list copy ("Daily deep tissue massage", "Guided daily
    hikes", "Daily fitness, yoga, and meditation classes") that the
    extraction can no longer safely reduce to one clean noun each —
    hard-coded instead, per the brief's own fallback instruction. Shared
    between DatePicker's "Your Chosen Stay" card and ProgramChoice's
    tray/inline summary line. */
export function stayDescription(pid, nights) {
  const propertyShort = D.properties[pid].name.replace('The Ranch ', '');
  return {
    title: nights + '-night stay in ' + propertyShort,
    rest: 'Includes daily massage, guided hikes, and all meals.',
  };
}

export { addDays, iso, parse, sameDay };
