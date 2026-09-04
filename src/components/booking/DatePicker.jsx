import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import useMountTransition from '../../useMountTransition.js';
import RanchCalendar from '../Calendar.jsx';
import Checkbox from '../ui/Checkbox.jsx';
import RetreatModal from './RetreatModal.jsx';
import { canExtend, checkoutsFor, isCheckInDay, isRetreatDate, nightsBetween, parse, retreatInStay, stayDescription } from '../../stay.js';
import { D } from '../../store.jsx';
import { MONTH_NAMES } from '../../utils.js';

function today() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

/* "17 Sep 2026" — the 3-letter month per the Sep 2026 creative-director
   pass, everywhere a picked date renders inside a field. */
function fmtDate(d) {
  return d.getDate() + ' ' + MONTH_NAMES[d.getMonth()].slice(0, 3) + ' ' + d.getFullYear();
}

/* A read-only "field" that looks like ui/Field but is a button — clicking
   it resets the date it shows, per the brief. A real Field wraps a text
   input, which is the wrong element for something that only ever opens a
   reset, not text entry.

   Since the calendar now renders above both fields (Sep 2026 pass), a
   field can be in one of three visual states: filled (a real button,
   clicking resets it), the one currently being chosen (unfilled, carries
   the same 2px-bottom-accent highlight ui/Field uses for focus, plus a
   placeholder — "Select check-in"/"Select check-out"), or unfilled and
   not yet reachable (quiet placeholder, no highlight). Only the filled
   state is interactive — there is nothing to reset on an empty field, so
   it renders as a plain, non-focusable field-look rather than a dead
   button. */
function DateField({ label, value, placeholder, active, onClick, className = '' }) {
  const labelId = useId();
  const shell = 'flex h-[50px] w-full items-center gap-2 rounded-brand border px-4 text-left text-sm transition-colors';

  if (value) {
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
          className={shell + ' border-line bg-fill text-ink hover:border-line-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent-focus focus-visible:outline-offset-2'}
        >
          <img src="/icons/calendar.svg" alt="" aria-hidden="true" className="h-[18px] w-[18px] shrink-0" />
          <span id={labelId + '-value'}>{value}</span>
        </button>
      </div>
    );
  }

  /* Empty field: a button too, since clicking it is what opens the
     calendar. `aria-expanded` tells a screen reader the calendar it
     controls is showing. */
  return (
    <div className={className}>
      <span id={labelId} className="label-sm mb-1.5 block text-muted">{label}</span>
      <button
        type="button"
        onClick={onClick}
        aria-labelledby={labelId + ' ' + labelId + '-value'}
        aria-expanded={!!active}
        className={
          shell + ' border-line bg-fill text-muted hover:border-line-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent-focus focus-visible:outline-offset-2 ' +
          (active ? 'shadow-[inset_0_-2px_0_var(--color-accent-focus)]' : '')
        }
      >
        <img src="/icons/calendar.svg" alt="" aria-hidden="true" className="h-[18px] w-[18px] shrink-0" />
        <span id={labelId + '-value'}>{placeholder}</span>
      </button>
    </div>
  );
}


/* ============================================================
   DatePicker
   ------------------------------------------------------------
   "CHOOSE YOUR DATES" per docs/figma/wires/02a–c v2, updated by the Sep
   2026 creative-director pass — the three states the brief names: A (no
   check-in yet — calendar in mode="checkin", only isCheckInDay(pid)
   dates enabled, the property's own stay-rules line inside the calendar
   block, retreats stacked below, the Check-in field highlighted below
   the calendar with a "Select check-in" placeholder), B (check-in set —
   calendar in mode="checkout" restricted to checkoutsFor(pid, checkIn),
   same retreat cards, the Check-out field now highlighted with "Select
   check-out"), C (both set — no calendar, two fields side by side, and a
   "Your Chosen Stay" summary in place of the bare nights line: eyebrow,
   a data-built description in Times, the nested retreat card when the
   stay includes one, and the property's own extension toggle when
   canExtend(pid, checkIn, checkOut) allows it — a Saturday pre-night at
   Malibu, a Friday post-night at Hudson). Clicking either filled field
   resets it and drops back a state, per the brief's "changing either
   date returns to the right state." Picking a date is never intercepted
   — a retreat date commits like any other; "Learn more" on a card is the
   only way to open RetreatModal.

   The calendar renders above the fields in every state that has one (A
   and B) — the fields stay side by side underneath, one filled/highlighted
   at a time rather than appearing only once picked, so the guest always
   sees both slots. `bare` drops the calendar's own white card + border
   (the drawer's own beige ground shows through instead) — Program keeps
   the bordered white card, since it sits on the page ground rather than
   inside a panel.

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
  bare: _bare = false,
}) {
  const checkInKey = checkIn ? checkIn.getTime() : null;
  const [month, setMonth] = useState(() => {
    const base = checkIn || today();
    return { y: base.getFullYear(), m: base.getMonth() };
  });
  const [learnMoreRetreat, setLearnMoreRetreat] = useState(null);
  /* The calendar is closed until a date field is clicked, and closes
     again once both dates are set — the fields are the resting state,
     the calendar is the tool that fills them. */
  const [open, setOpen] = useState(false);
  const popoverOpen = open && !(checkIn && checkOut);
  const { mounted: calMounted, shown: calShown } = useMountTransition(popoverOpen, 300);
  const wrapRef = useRef(null);
  /* The calendar always opens above the fields. It is rendered at the
     viewport level, anchored to the fields' top edge, so it can rise over
     the drawer content above it rather than being clipped by the
     drawer's own scroll box. When there is not enough room above for the
     whole panel, it keeps its full height and lets its lower edge come
     down over the fields instead of cropping the legend. Re-measured on
     resize, on scroll of the region the fields live in, and once more
     after mount, when the panel's own height is known. */
  const [anchor, setAnchor] = useState(null);
  const popoverRef = useRef(null);
  const measure = useCallback(() => {
    if (!wrapRef.current) return;
    const r = wrapRef.current.getBoundingClientRect();
    const h = popoverRef.current ? popoverRef.current.offsetHeight : 0;
    const roomAbove = r.top - 8 - 16;
    const top = h && h > roomAbove ? 16 : null;
    setAnchor({ left: r.left, width: r.width, top, bottom: top == null ? window.innerHeight - r.top + 8 : null });
  }, []);
  useEffect(() => {
    if (!popoverOpen || !wrapRef.current) return;
    const scroller = wrapRef.current.closest('[data-scroll-region]');
    measure();
    window.addEventListener('resize', measure);
    scroller?.addEventListener('scroll', measure);
    return () => {
      window.removeEventListener('resize', measure);
      scroller?.removeEventListener('scroll', measure);
    };
  }, [popoverOpen, measure]);
  /* Second pass once the panel is in the DOM and has a height to report. */
  useEffect(() => {
    if (!calMounted) return;
    const raf = requestAnimationFrame(measure);
    return () => cancelAnimationFrame(raf);
  }, [calMounted, measure]);

  /* The calendar floats over whatever sits below the fields, so it has to
     get out of the way on its own: a click anywhere outside the picker,
     or Escape, closes it. Escape is swallowed here so the drawer around
     it does not close on the same keypress. */
  useEffect(() => {
    if (!popoverOpen) return;
    function onPointer(e) {
      const inFields = wrapRef.current && wrapRef.current.contains(e.target);
      const inPopover = popoverRef.current && popoverRef.current.contains(e.target);
      if (!inFields && !inPopover) setOpen(false);
    }
    function onKey(e) {
      if (e.key !== 'Escape') return;
      e.stopPropagation();
      setOpen(false);
    }
    document.addEventListener('pointerdown', onPointer);
    document.addEventListener('keydown', onKey, true);
    return () => {
      document.removeEventListener('pointerdown', onPointer);
      document.removeEventListener('keydown', onKey, true);
    };
  }, [popoverOpen]);

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
    else {
      onPickCheckOut(date);
      setOpen(false);
    }
  }

  function openCheckIn() {
    onResetCheckIn();
    setOpen(true);
  }
  function openCheckOut() {
    if (checkIn) onResetCheckOut();
    else onResetCheckIn();
    setOpen(true);
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
    setOpen(threeNight.length !== 1);
    setLearnMoreRetreat(null);
  }

  const stayRules = D.properties[pid].stayRules;
  const bothSet = !!(checkIn && checkOut);
  const nights = bothSet ? nightsBetween(checkIn, checkOut) + (extension ? 1 : 0) : 0;
  const extendable = extensionsOn && canExtend(pid, checkIn, checkOut);
  const extensionLabel = stayRules.extensionLabel || 'Add an extra night';

  /* The field currently being filled is the only one that carries the
     accent-focus highlight — a field that already holds a date is
     "chosen," not "being chosen," even though it is technically the most
     recent one the guest touched. */
  const checkinActive = open && !checkIn;
  const checkoutActive = open && !!checkIn && !checkOut;

  return (
    <div>
      <div ref={wrapRef} className="relative max-w-[420px]">
        <div className="grid grid-cols-2 gap-4">
          <DateField
            label="Arrival"
            value={checkIn ? fmtDate(checkIn) : null}
            placeholder="Select date"
            active={checkinActive}
            onClick={openCheckIn}
          />
          <DateField
            label="Departure"
            value={checkOut ? fmtDate(checkOut) : null}
            placeholder="Select date"
            active={checkoutActive}
            onClick={openCheckOut}
          />
        </div>

        {/* The calendar is an overlay: it opens beneath the fields, over
            the content that follows, and fades in over the build's 300ms. */}
        {calMounted && anchor && createPortal(
          <div
            ref={popoverRef}
            role="dialog"
            aria-label={checkIn ? 'Choose a check-out date' : 'Choose a check-in date'}
            style={{ left: anchor.left, width: anchor.width, top: anchor.top ?? undefined, bottom: anchor.bottom ?? undefined, maxHeight: 'calc(100vh - 32px)' }}
            className={
              'fixed z-[2600] overflow-y-auto border border-line bg-light p-7 shadow-2xl ' +
              'transition-[opacity,transform] duration-300 ease-out motion-reduce:transition-none ' +
              (calShown ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-1')
            }
          >
            <RanchCalendar
              month={month}
              onMonth={changeMonth}
              selectedStart={checkIn}
              selectedEnd={checkOut}
              isEnabled={checkIn ? isEnabledCheckOut : isEnabledCheckIn}
              isRetreat={isRetreat}
              onPick={(d) => commit(d, checkIn ? 'checkout' : 'checkin')}
              mode={checkIn ? 'checkout' : 'checkin'}
              helper={stayRules.blocksCopy}
            />
          </div>,
          document.body
        )}
      </div>

      {bothSet && (
        <>
          <div className="mt-6 max-w-[420px]">
            <div role="status" aria-live="polite">
              <span className="label-sm block text-accent">Your Chosen Stay</span>
              <p className="h-serif mt-2 text-[24px] leading-tight text-ink">{stayDescription(pid, nights).title}</p>
              <p className="mt-1.5 text-sm text-body">{stayDescription(pid, nights).rest}</p>
            </div>

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
