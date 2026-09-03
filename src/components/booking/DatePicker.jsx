import { useEffect, useId, useState } from 'react';
import RanchCalendar from '../Calendar.jsx';
import Checkbox from '../ui/Checkbox.jsx';
import RetreatCard from './RetreatCard.jsx';
import RetreatModal from './RetreatModal.jsx';
import { canExtend, checkoutsFor, isCheckInDay, isRetreatDate, nightsBetween, parse, retreatInStay, retreatsInMonth } from '../../stay.js';
import { D } from '../../store.jsx';
import { MONTH_NAMES } from '../../utils.js';

function today() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

function fmtDate(d) {
  return d.getDate() + ' ' + MONTH_NAMES[d.getMonth()] + ' ' + d.getFullYear();
}

/* A read-only "field" that looks like ui/Field but is a button — clicking
   it resets the date it shows, per the brief. A real Field wraps a text
   input, which is the wrong element for something that only ever opens a
   reset, not text entry. */
function DateField({ label, value, onClick, className = '' }) {
  const labelId = useId();
  return (
    <div className={className}>
      <span id={labelId} className="label-sm mb-1.5 block text-muted">{label}</span>
      <button
        type="button"
        onClick={onClick}
        /* The visible "Check-in"/"Check-out" caption is a sibling <span>,
           not a <label for>, since this is a button standing in for a
           field rather than an actual input — without aria-labelledby a
           screen-reader user tabbing here hears only the date ("6
           September 2026") with no indication of which field it is or
           that activating it resets it. Combining both ids keeps the date
           read first, matching the visible reading order. */
        aria-labelledby={labelId + ' ' + labelId + '-value'}
        className="flex h-[50px] w-full items-center gap-2 rounded-brand border border-line bg-fill px-4 text-left text-sm text-ink transition-colors hover:border-line-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent-focus focus-visible:outline-offset-2"
      >
        <img src="/icons/calendar.svg" alt="" aria-hidden="true" className="h-[18px] w-[18px] shrink-0" />
        <span id={labelId + '-value'}>{value}</span>
      </button>
    </div>
  );
}

/* Every retreat landing in the visible month, stacked as cards under the
   calendar — docs/figma/wires 02a–c v2, "if special retreats occur that
   month, show them stacking below the calendar." Re-renders whenever
   `month` changes, since it reads straight from D.retreats rather than
   caching anything. */
function RetreatList({ pid, month, onLearnMore }) {
  const list = retreatsInMonth(pid, month.y, month.m);
  if (!list.length) return null;
  return (
    <div className="mt-4 flex max-w-[420px] flex-col gap-3">
      {list.map((r) => (
        <RetreatCard key={r.date + r.name} retreat={r} pid={pid} onLearnMore={onLearnMore} />
      ))}
    </div>
  );
}

/* One-line stay description for the state-C summary card, built from
   D.includes rather than hard-coded — "{N}-night stay at {property} —
   includes daily {massage}, daily {hikes}, and all {meals}." Pulls the
   noun each item's own title already carries (Daily massage → massage,
   Daily hikes, fitness and yoga → hikes, All meals and snacks → meals)
   instead of copying the wire's literal sentence, so a future edit to
   D.includes's titles updates this line too. */
function stayDescription(pid, nights) {
  const word = (icon, prefix) => {
    const item = D.includes.find((i) => i.icon === icon);
    return item ? item.title.replace(prefix, '').split(/[ ,]/)[0].toLowerCase() : '';
  };
  const massage = word('spa', /^Daily /) || 'massage';
  const hikes = word('hike', /^Daily /) || 'hikes';
  const meals = word('dining', /^All /) || 'meals';
  const propertyShort = D.properties[pid].name.replace('The Ranch ', '');
  return nights + '-night stay at ' + propertyShort + ' — includes daily ' + massage + ', daily ' + hikes + ', and all ' + meals + '.';
}

/* ============================================================
   DatePicker
   ------------------------------------------------------------
   "CHOOSE YOUR DATES" per docs/figma/wires/02a–c v2 — the three states
   the brief names: A (no check-in yet — single calendar in mode="checkin",
   only isCheckInDay(pid) dates enabled, retreats stacked below), B
   (check-in set — filled Check-in field + a calendar in mode="checkout"
   restricted to checkoutsFor(pid, checkIn), same retreat cards below,
   now marking any check-out whose stay would include one), C (both set —
   two fields side by side, no calendar, and a summary card in place of
   the bare nights line: heading, a data-built description, the nested
   retreat card when the stay includes one, and the property's own
   extension toggle when canExtend(pid, checkIn, checkOut) allows it — a
   Saturday pre-night at Malibu, a Friday post-night at Hudson). Clicking
   either filled field resets it and drops back a state, per the brief's
   "changing either date returns to the right state." Picking a date is
   never intercepted — a retreat date commits like any other; "Learn
   more" on a card is the only way to open RetreatModal.

   Shared between the Program step page (`entry=pages`) and
   `ReserveDrawer` (`entry=drawer`, the default) — the drawer drives this
   same component off local draft state instead of the store directly, so
   the three-state machine, the retreat cards, and the extension checkbox
   can never drift into two different behaviours for the two entry modes.
   ============================================================ */
export default function DatePicker({
  pid,
  checkIn,
  checkOut,
  extension,
  retreatsOn,
  extensionsOn,
  onPickCheckIn,
  onPickCheckOut,
  onResetCheckIn,
  onResetCheckOut,
  onToggleExtra,
  onChooseRetreatDates,
}) {
  const checkInKey = checkIn ? checkIn.getTime() : null;
  const [month, setMonth] = useState(() => {
    const base = checkIn || today();
    return { y: base.getFullYear(), m: base.getMonth() };
  });
  const [learnMoreRetreat, setLearnMoreRetreat] = useState(null);

  /* Jump the visible month to wherever the guest just landed — the
     check-in's month once it is picked, back to today's month if the
     check-in field is reset. */
  useEffect(() => {
    const base = checkIn || today();
    setMonth({ y: base.getFullYear(), m: base.getMonth() });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [checkInKey]);

  function changeMonth(delta) {
    setMonth((m) => {
      let mo = m.m + delta;
      let y = m.y;
      if (mo < 0) { mo = 11; y -= 1; }
      if (mo > 11) { mo = 0; y += 1; }
      return { y, m: mo };
    });
  }

  function isEnabledCheckIn(date) {
    if (date < today()) return false;
    return isCheckInDay(pid, date);
  }
  const validCheckouts = checkIn ? checkoutsFor(pid, checkIn) : [];
  function isEnabledCheckOut(date) {
    return validCheckouts.some((d) => d.getTime() === date.getTime());
  }
  /* State A: the day itself is a retreat check-in. State B: the day is a
     candidate check-out whose resulting stay would pass through one. */
  function isRetreat(date) {
    if (!retreatsOn) return false;
    return checkIn ? !!retreatInStay(pid, checkIn, date) : isRetreatDate(pid, date);
  }

  function commit(date, mode) {
    if (mode === 'checkin') onPickCheckIn(date);
    else onPickCheckOut(date);
  }

  /* "Choose these dates" in RetreatModal — sets check-in to the retreat's
     own check-in, and check-out too when the property's rules give this
     check-in day exactly one 3-night option (Hudson's Thursday retreats;
     Malibu's Saturday/Sunday retreats have no 3-night block at all, so
     check-out stays for the guest to pick in state B). */
  function chooseTheseDates(retreat) {
    const ci = parse(retreat.date);
    const outs = checkoutsFor(pid, ci);
    const threeNight = outs.filter((d) => nightsBetween(ci, d) === 3);
    onChooseRetreatDates(ci, threeNight.length === 1 ? threeNight[0] : null);
    setLearnMoreRetreat(null);
  }

  const bothSet = !!(checkIn && checkOut);
  const nights = bothSet ? nightsBetween(checkIn, checkOut) + (extension ? 1 : 0) : 0;
  const extendable = extensionsOn && canExtend(pid, checkIn, checkOut);
  const extensionLabel = (D.properties[pid] && D.properties[pid].stayRules.extensionLabel) || 'Add an extra night';
  const stayRetreat = bothSet && retreatsOn ? retreatInStay(pid, checkIn, checkOut) : null;

  return (
    <div>
      {!bothSet && checkIn && (
        <DateField label="Check-in" value={fmtDate(checkIn)} onClick={onResetCheckIn} className="mb-6 max-w-xs" />
      )}

      {bothSet ? (
        <>
          <div className="grid max-w-[420px] grid-cols-2 gap-4">
            <DateField label="Check-in" value={fmtDate(checkIn)} onClick={onResetCheckIn} />
            <DateField label="Check-out" value={fmtDate(checkOut)} onClick={onResetCheckOut} />
          </div>

          <div className="mt-6 max-w-[420px] border border-line bg-white p-6">
            <div role="status" aria-live="polite">
              <h3 className="h-serif text-h5 text-ink">{nights}-night stay</h3>
              <p className="mt-2 text-sm text-body">{stayDescription(pid, nights)}</p>
            </div>

            {stayRetreat && (
              <>
                <p className="mt-4 text-sm font-medium text-ink">Includes a special retreat.</p>
                <RetreatCard retreat={stayRetreat} pid={pid} onLearnMore={setLearnMoreRetreat} className="mt-3" />
              </>
            )}

            {extendable && (
              <Checkbox
                className="mt-5"
                checked={!!extension}
                onChange={onToggleExtra}
                label={extensionLabel}
              />
            )}
          </div>
        </>
      ) : (
        <>
          <span className="label-sm mb-3 block text-ink">
            {checkIn ? 'Select check-out' : 'Select check-in'}
          </span>
          <div className="max-w-[420px] border border-line bg-white p-5">
            {!checkIn && (
              <p className="mb-3 text-xs text-muted">Select your earliest possible check-in date.</p>
            )}
            <RanchCalendar
              month={month}
              onMonth={changeMonth}
              selectedStart={checkIn}
              selectedEnd={checkOut}
              isEnabled={checkIn ? isEnabledCheckOut : isEnabledCheckIn}
              isRetreat={isRetreat}
              onPick={(d) => commit(d, checkIn ? 'checkout' : 'checkin')}
              mode={checkIn ? 'checkout' : 'checkin'}
            />
          </div>
          <RetreatList pid={pid} month={month} onLearnMore={setLearnMoreRetreat} />
        </>
      )}

      <RetreatModal
        open={!!learnMoreRetreat}
        retreat={learnMoreRetreat}
        pid={pid}
        onClose={() => setLearnMoreRetreat(null)}
        onChooseDates={chooseTheseDates}
      />
    </div>
  );
}
