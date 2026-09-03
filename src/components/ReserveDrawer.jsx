import { useEffect, useRef, useState } from 'react';
import RanchCalendar from './Calendar.jsx';
import Button from './ui/Button.jsx';
import Counter from './ui/Counter.jsx';
import { fmtShort } from '../utils.js';
import { canExtend, checkoutsFor, isCheckInDay, iso, isRetreatDate, parse, retreatInStay } from '../stay.js';
import { D, MAX_ROOMS, newRoomSlot, useBooking, useToast } from '../store.jsx';
import { MAX_GUESTS_PER_ROOM, useConfig } from '../config.jsx';
import useMountTransition from '../useMountTransition.js';

const FOCUSABLE = 'a[href],button:not([disabled]),textarea,input:not([disabled]),select,[tabindex]:not([tabindex="-1"])';

/* "The Ranch Malibu, CA" — the abbreviated state suffix per
   docs/figma/styles/booking-widgets.png. No field in src/data.js carries
   the two-letter form (`category` is the long "Malibu, California"), so
   it is derived here rather than adding a new data field for one string. */
const STATE_ABBR = { malibu: 'CA', hudson: 'NY' };
function propertyLabel(pid) {
  return D.properties[pid].name + ', ' + STATE_ABBR[pid];
}

/* ============================================================
   ReserveDrawer — the booking widget
   ------------------------------------------------------------
   docs/figma/styles/booking-widgets.png "Vertical Booking Widget": CLOSE
   text link top-right, Location, Guests/Rooms side by side, Promo Code,
   a rule, Check-in/Check-out, the calendar, a rule, full-width CHECK
   RATES. It is the one place outside the Program step that can set the
   stay's dates — Landing opens it to start a search (optionally pre-set
   to one property, from the home page's property band), Layout's header
   opens it to edit a stay already in progress — so it leans on the same
   src/stay.js rules the Program step does rather than reimplementing the
   date logic.
   ============================================================ */
export default function ReserveDrawer({ open, onClose, onApply, ctaLabel = 'Check Rates', presetProperty = null }) {
  const { state, set } = useBooking();
  const config = useConfig();
  const toast = useToast();
  const { mounted, shown } = useMountTransition(open, 400);

  const [propOpen, setPropOpen] = useState(false);
  const [draft, setDraft] = useState(null);
  const [month, setMonth] = useState({ y: new Date().getFullYear(), m: new Date().getMonth() });
  const [retreatNote, setRetreatNote] = useState(null);

  const panelRef = useRef(null);
  const closeRef = useRef(null);
  const openerRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const ci = state.checkIn ? parse(state.checkIn) : null;
    setDraft({
      /* Multi-property builds start unset — the "Select a Location"
         placeholder state from the Figma sheet — rather than defaulting
         to the first property, so CHECK RATES stays genuinely disabled
         until the guest actually chooses. Single-property builds have no
         field to show, so they fall straight to the one property. */
      property: presetProperty || state.property || (config.multiProperty ? null : D.propertyList[0]),
      checkIn: ci,
      checkOut: state.checkOut ? parse(state.checkOut) : null,
      extension: state.extension || null,
      rooms: (state.rooms || []).length ? state.rooms.map((r) => ({ ...r })) : [newRoomSlot([])],
      promo: '',
      promoApplied: false,
    });
    setMonth(ci ? { y: ci.getFullYear(), m: ci.getMonth() } : { y: new Date().getFullYear(), m: new Date().getMonth() });
    setRetreatNote(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  /* Esc closes, independent of the focus trap below. */
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    if (open) document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  /* Focus moves into the drawer on open (the Close link — the first
     focusable element, per the Figma layout) and returns to whatever
     opened it on close; Tab is trapped inside the panel while open. */
  useEffect(() => {
    if (!open) return;
    openerRef.current = document.activeElement;
    const t = setTimeout(() => closeRef.current?.focus(), 20);

    function onTab(e) {
      if (e.key !== 'Tab') return;
      const panel = panelRef.current;
      if (!panel) return;
      const items = Array.from(panel.querySelectorAll(FOCUSABLE));
      if (!items.length) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
    document.addEventListener('keydown', onTab);
    return () => {
      clearTimeout(t);
      document.removeEventListener('keydown', onTab);
      openerRef.current?.focus?.();
    };
  }, [open]);

  /* Body scroll lock while the drawer is open. */
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, [open]);

  if (!mounted || !draft) return null;

  const validCheckouts = draft.checkIn && draft.property ? checkoutsFor(draft.property, draft.checkIn) : [];
  const propertyMissing = config.multiProperty && !draft.property;
  const canSubmit = !propertyMissing && !!draft.checkIn && !!draft.checkOut;

  function isEnabled(date) {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    if (date < today) return false;
    if (!draft.property) return false; /* pick a property before the calendar can validate a day against its own rules */
    if (!draft.checkIn || draft.checkOut) return isCheckInDay(draft.property, date);
    return validCheckouts.some((d) => d.getTime() === date.getTime());
  }

  function pick(date) {
    if (!draft.checkIn || draft.checkOut) {
      setDraft((d) => ({ ...d, checkIn: date, checkOut: null, extension: null }));
      const retreat = config.retreats && draft.property ? isRetreatDate(draft.property, date) : false;
      if (retreat) setRetreatNote(retreat);
      return;
    }
    setDraft((d) => ({ ...d, checkOut: date }));
  }

  function apply() {
    if (propertyMissing) { toast('Select a location to continue.'); return; }
    if (!draft.checkIn || !draft.checkOut) { toast('Select a check-in and check-out date.'); return; }
    const property = draft.property || D.propertyList[0];
    const propertyChanged = property !== state.property;
    const rooms = propertyChanged
      ? draft.rooms.map((r) => ({ ...r, roomId: null, upgradedFrom: null }))
      : draft.rooms;
    set({
      property,
      checkIn: iso(draft.checkIn),
      checkOut: iso(draft.checkOut),
      extension: draft.extension,
      rooms,
    });
    onClose();
    toast('Stay updated — ' + fmtShort(iso(draft.checkIn)) + ' – ' + fmtShort(iso(draft.checkOut)));
    onApply?.({ pendingRoom: rooms.findIndex((r) => !r.roomId), roomCount: rooms.length });
  }

  function setRoomCount(v) {
    setDraft((d) => ({
      ...d,
      rooms: v > d.rooms.length ? [...d.rooms, newRoomSlot(d.rooms)] : d.rooms.slice(0, v),
    }));
  }
  function setRoomGuests(i, v) {
    setDraft((d) => ({ ...d, rooms: d.rooms.map((x, j) => (j === i ? { ...x, adults: v } : x)) }));
  }

  const multiRoom = config.multiRoom;
  const extendable = config.extensions && canExtend(draft.property, draft.checkIn, draft.checkOut);
  const extensionLabel = (draft.property && D.properties[draft.property].stayRules.extensionLabel) || 'Add an extra night';

  return (
    <div role="dialog" aria-modal="true" aria-label="Book a stay" className="fixed inset-0 z-[1000]">
      <div
        className={'absolute inset-0 bg-dark/40 transition-opacity duration-400 motion-reduce:transition-none ' + (shown ? 'opacity-100' : 'opacity-0')}
        onClick={onClose}
      />
      <aside
        ref={panelRef}
        className={
          'absolute right-0 top-0 flex h-full w-full max-w-[460px] flex-col overflow-y-auto bg-light shadow-2xl ' +
          /* The slide is a large-field transform — the actual vestibular
             trigger reduced motion exists to remove. The open/closed state
             itself (shown ? translate-x-0 : translate-x-full) is unchanged,
             so the panel still ends up in the right place — it just gets
             there in one frame instead of 400ms of motion. */
          'transition-transform duration-400 ease-out motion-reduce:transition-none ' + (shown ? 'translate-x-0' : 'translate-x-full')
        }
      >
        <div className="flex flex-1 flex-col gap-5 px-6 py-8 md:px-8">
          <div className="flex items-center justify-end">
            <button
              ref={closeRef}
              type="button"
              onClick={onClose}
              className="btn-text inline-flex items-center gap-2 text-ink hover:text-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent-focus focus-visible:outline-offset-2"
            >
              Close
              <img src="/icons/close.svg" alt="" aria-hidden="true" className="h-2.5 w-2.5" />
            </button>
          </div>

          {config.multiProperty && (
            <div className="relative">
              <span className="label-sm mb-1.5 block text-muted">Location</span>
              <button
                type="button"
                aria-haspopup="listbox"
                aria-expanded={propOpen}
                onClick={() => setPropOpen((o) => !o)}
                onKeyDown={(e) => {
                  if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setPropOpen(true);
                  }
                }}
                className="flex h-[50px] w-full items-center justify-between gap-3 rounded-brand border border-line bg-fill px-4 text-left text-sm text-ink hover:border-line-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent-focus focus-visible:outline-offset-2"
              >
                <span className={draft.property ? 'text-ink' : 'text-muted'}>
                  {draft.property ? propertyLabel(draft.property) : 'Select a Location'}
                </span>
                <svg className={'h-3 w-3 shrink-0 text-muted transition-transform ' + (propOpen ? 'rotate-180' : '')} viewBox="0 0 12 12" aria-hidden="true">
                  <path d="M2 4 L6 8 L10 4" stroke="currentColor" strokeWidth="1" fill="none" strokeLinecap="square" />
                </svg>
              </button>
              {propOpen && (
                <ul
                  role="listbox"
                  aria-label="Locations"
                  className="absolute inset-x-0 top-[calc(100%+4px)] z-10 border border-line bg-white py-1 shadow-xl"
                  onKeyDown={(e) => {
                    /* APG listbox: Up/Down move selection, Home/End jump to
                       the ends, Escape closes and returns focus to the
                       trigger — the options were reachable by Tab alone
                       before this, which works but isn't the pattern
                       aria-haspopup="listbox" promises. */
                    const items = Array.from(e.currentTarget.querySelectorAll('[role="option"]'));
                    const i = items.indexOf(document.activeElement);
                    if (e.key === 'ArrowDown') { e.preventDefault(); items[Math.min(items.length - 1, i + 1)]?.focus(); }
                    else if (e.key === 'ArrowUp') { e.preventDefault(); items[Math.max(0, i - 1)]?.focus(); }
                    else if (e.key === 'Home') { e.preventDefault(); items[0]?.focus(); }
                    else if (e.key === 'End') { e.preventDefault(); items[items.length - 1]?.focus(); }
                    else if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); setPropOpen(false); }
                  }}
                >
                  {D.propertyList.map((pid) => (
                    <li key={pid}>
                      <button
                        type="button"
                        role="option"
                        aria-selected={draft.property === pid}
                        onClick={() => { setDraft((d) => ({ ...d, property: pid })); setPropOpen(false); }}
                        className="w-full px-4 py-2.5 text-left text-sm hover:bg-page focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-accent-focus"
                      >
                        {propertyLabel(pid)}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          <div>
            <span className="label-sm mb-1.5 block text-muted">{multiRoom ? 'Rooms & Guests' : 'Guests'}</span>
            {draft.rooms.length <= 1 ? (
              <div className="grid grid-cols-2 gap-3">
                <Counter
                  label="Guests"
                  ariaLabel="Guests"
                  value={draft.rooms[0].adults}
                  min={1}
                  max={MAX_GUESTS_PER_ROOM}
                  onChange={(v) => setRoomGuests(0, v)}
                />
                {multiRoom && (
                  <Counter label="Rooms" ariaLabel="Rooms" value={draft.rooms.length} min={1} max={MAX_ROOMS} onChange={setRoomCount} />
                )}
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <Counter label="Rooms" ariaLabel="Rooms" value={draft.rooms.length} min={1} max={MAX_ROOMS} onChange={setRoomCount} />
                {draft.rooms.map((r, i) => (
                  <div key={r.uid} className="flex items-center gap-2">
                    <span className="label-sm w-14 shrink-0 text-muted">Room {i + 1}</span>
                    <Counter
                      label="Guests"
                      ariaLabel={'Guests, Room ' + (i + 1)}
                      value={r.adults}
                      min={1}
                      max={MAX_GUESTS_PER_ROOM}
                      onChange={(v) => setRoomGuests(i, v)}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <span className="label-sm mb-1.5 block text-muted">Promo Code</span>
            <div className="flex h-[50px] items-center rounded-brand border border-line bg-fill px-4">
              <input
                type="text"
                aria-label="Promo code"
                value={draft.promo}
                readOnly={draft.promoApplied}
                onChange={(e) => setDraft((d) => ({ ...d, promo: e.target.value }))}
                className="min-w-0 flex-1 bg-transparent text-sm text-ink outline-none"
              />
              <button
                type="button"
                disabled={!draft.promo}
                onClick={() => setDraft((d) => ({ ...d, promoApplied: !d.promoApplied }))}
                className="label-sm shrink-0 text-accent underline underline-offset-2 hover:text-ink disabled:pointer-events-none disabled:text-disabled disabled:no-underline"
              >
                {draft.promoApplied ? 'Remove' : 'Apply'}
              </button>
            </div>
          </div>

          <hr className="border-line" />

          <div>
            <span className="label-sm mb-1.5 block text-muted">Choose Your Dates</span>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="label-sm mb-1.5 block text-muted">Check-In</span>
                <div className="flex h-[50px] items-center gap-1 rounded-brand border border-line bg-fill px-4">
                  <img src="/icons/calendar.svg" alt="" aria-hidden="true" className="h-[18px] w-[18px] shrink-0" />
                  <span className="min-w-0 flex-1 truncate text-sm text-ink">
                    {draft.checkIn ? fmtShort(iso(draft.checkIn)) : 'Select date'}
                  </span>
                  <img src="/icons/chevron-down.svg" alt="" aria-hidden="true" className="h-[18px] w-[18px] shrink-0" />
                </div>
              </div>
              <div>
                <span className="label-sm mb-1.5 block text-muted">Check-Out</span>
                <div className="flex h-[50px] items-center gap-1 rounded-brand border border-line bg-fill px-4">
                  <img src="/icons/calendar.svg" alt="" aria-hidden="true" className="h-[18px] w-[18px] shrink-0" />
                  <span className="min-w-0 flex-1 truncate text-sm text-ink">
                    {draft.checkOut ? fmtShort(iso(draft.checkOut)) : 'Select date'}
                  </span>
                  <img src="/icons/chevron-down.svg" alt="" aria-hidden="true" className="h-[18px] w-[18px] shrink-0" />
                </div>
              </div>
            </div>

            {extendable && (
              <label className="mt-3 flex cursor-pointer items-center justify-between gap-3 rounded-brand border border-line bg-fill px-4 py-3 text-sm text-ink">
                <span>{extensionLabel}</span>
                <input
                  type="checkbox"
                  checked={!!draft.extension}
                  onChange={(e) => setDraft((d) => ({
                    ...d,
                    extension: e.target.checked ? D.properties[d.property].stayRules.extensionType : null,
                  }))}
                  className="h-[18px] w-[18px] accent-accent"
                />
              </label>
            )}

            {retreatNote && (
              <p className="mt-3 rounded-brand border border-accent bg-white px-4 py-3 text-xs text-body">
                <strong className="font-medium text-ink">{retreatNote.name}</strong> — this check-in falls during a special retreat.
              </p>
            )}

            <div className="mt-3 rounded-brand border border-line bg-white p-4">
              <RanchCalendar
                month={month}
                onMonth={(delta) => setMonth((m) => {
                  let mo = m.m + delta, y = m.y;
                  if (mo < 0) { mo = 11; y--; } if (mo > 11) { mo = 0; y++; }
                  return { y, m: mo };
                })}
                selectedStart={draft.checkIn}
                selectedEnd={draft.checkOut}
                isEnabled={isEnabled}
                /* Same rule DatePicker uses: state A tints the retreat's own
                   check-in day, state B tints a candidate check-out whose
                   resulting stay would pass through one. No retreat cards
                   in the drawer — annotation H — just the identical
                   colour/marker behaviour on the grid itself. */
                isRetreat={(d) => {
                  if (!config.retreats || !draft.property) return false;
                  return draft.checkIn && !draft.checkOut
                    ? !!retreatInStay(draft.property, draft.checkIn, d)
                    : isRetreatDate(draft.property, d);
                }}
                onPick={pick}
                mode={draft.checkIn && !draft.checkOut ? 'checkout' : 'checkin'}
              />
            </div>
          </div>

          <hr className="border-line" />

          <Button variant="primary" onClick={apply} disabled={!canSubmit} className="mt-auto w-full">
            {ctaLabel}
          </Button>
        </div>
      </aside>
    </div>
  );
}
