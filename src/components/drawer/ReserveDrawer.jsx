import { useEffect, useId, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DatePicker from '../booking/DatePicker.jsx';
import RoomChips from '../booking/RoomChips.jsx';
import LocationSelect from './LocationSelect.jsx';
import Button from '../ui/Button.jsx';
import { iso } from '../../stay.js';
import { D, MAX_ROOMS, newRoomSlot, useBooking, useToast } from '../../store.jsx';
import { flowSteps, useConfig } from '../../config.jsx';
import { fmtShort } from '../../utils.js';
import useMountTransition from '../../useMountTransition.js';

const FOCUSABLE = 'a[href],button:not([disabled]),textarea,input:not([disabled]),select,[tabindex]:not([tabindex="-1"])';

/* ============================================================
   ReserveDrawer — the booking widget
   ------------------------------------------------------------
   docs/figma/styles/booking-widgets.png "Vertical Booking Widget": CLOSE
   text link top-right, Location, Rooms & guests, Promo Code, a rule,
   Check-in/Check-out, the calendar, a rule, full-width CHECK RATES.

   Since the 3 Sep 2026 drawer-entry pass this is the whole of Location +
   Program's "rooms & guests" + "choose your dates" in one widget, not a
   simplified stand-in for them — `RoomChips` and `DatePicker` are the
   exact same components Program.jsx renders (docs/BRIEF.md, "Drawer
   entry"), driven off this drawer's own local draft state instead of the
   store directly, so nothing about the room-chip layout, the three-state
   date machine, or the stacked retreat cards can drift between the two
   entry modes. It is the one place outside the Program step that can set
   the stay's property and dates — Landing opens it to start a search
   (optionally pre-set to one property, from the home page's property
   band), Layout's header opens it to edit a stay already in progress —
   so submitting it always writes property/rooms/dates/extension to the
   store and lands on /rooms, in both entry modes: the drawer has already
   done the job Location and Program's pages would have.
   ============================================================ */
export default function ReserveDrawer({ open, onClose, onApply, ctaLabel = 'Check Rates', presetProperty = null }) {
  const { state, set } = useBooking();
  const config = useConfig();
  const toast = useToast();
  const navigate = useNavigate();
  const { mounted, shown } = useMountTransition(open, 300);
  const titleId = useId();

  const [propOpen, setPropOpen] = useState(false);
  const [draft, setDraft] = useState(null);

  const panelRef = useRef(null);
  const closeRef = useRef(null);
  const openerRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    setDraft({
      /* Multi-property builds start unset — the "Select a Location"
         placeholder state from the Figma sheet — rather than defaulting
         to the first property, so CHECK RATES stays genuinely disabled
         until the guest actually chooses. Single-property builds have no
         field to show, so they fall straight to the one property. */
      property: presetProperty || state.property || (config.multiProperty ? null : D.propertyList[0]),
      checkIn: state.checkIn ? new Date(state.checkIn + 'T00:00:00') : null,
      checkOut: state.checkOut ? new Date(state.checkOut + 'T00:00:00') : null,
      extension: state.extension || null,
      rooms: (state.rooms || []).length ? state.rooms.map((r) => ({ ...r })) : [newRoomSlot([])],
      promo: '',
      promoApplied: false,
    });
    setPropOpen(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  /* Esc closes the drawer — but only when a nested dialog (RetreatModal,
     opened from DatePicker's retreat cards) isn't the thing that actually
     has focus. Both listeners live on `document`, so without this check
     the drawer's own handler (registered first, since the drawer opens
     before any retreat card can be clicked) fires on every Escape and
     closes the whole drawer out from under the modal it was meant to
     dismiss instead. */
  useEffect(() => {
    const onKey = (e) => {
      if (e.key !== 'Escape') return;
      const panel = panelRef.current;
      const nestedDialog = panel && panel.querySelector('[role="dialog"][aria-modal="true"]');
      if (nestedDialog && nestedDialog.contains(document.activeElement)) return;
      onClose();
    };
    if (open) document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  /* Focus moves into the drawer on open (the Close link — the first
     focusable element, per the Figma layout) and returns to whatever
     opened it on close; Tab is trapped inside the panel while open —
     unless a nested dialog is open and already holds focus, in which
     case that dialog's own trap (ui/Modal.jsx) owns Tab instead. */
  useEffect(() => {
    if (!open) return;
    openerRef.current = document.activeElement;
    const t = setTimeout(() => closeRef.current?.focus(), 20);

    function onTab(e) {
      if (e.key !== 'Tab') return;
      const panel = panelRef.current;
      if (!panel) return;
      const nestedDialog = panel.querySelector('[role="dialog"][aria-modal="true"]');
      if (nestedDialog && nestedDialog.contains(document.activeElement)) return;
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

  const propertyMissing = config.multiProperty && !draft.property;
  const roomsOk = draft.rooms.every((r) => (r.adults || 0) >= 1);
  const canSubmit = !propertyMissing && !!draft.checkIn && !!draft.checkOut && roomsOk;

  function chooseProperty(pid) {
    /* Rules differ per property (different check-in days, different
       shapes of extra night) — a date valid at one is often not valid at
       the other, so changing Location clears whatever dates were picked
       rather than carrying over a combination the new property can't
       honour. Rooms/guests are unaffected: they're the guest's own party,
       not a property rule. */
    setDraft((d) => ({ ...d, property: pid, checkIn: null, checkOut: null, extension: null }));
  }

  function addRoom() {
    setDraft((d) => (d.rooms.length >= MAX_ROOMS ? d : { ...d, rooms: [...d.rooms, newRoomSlot(d.rooms)] }));
  }
  function removeRoom(uid) {
    setDraft((d) => ({ ...d, rooms: d.rooms.filter((r) => r.uid !== uid) }));
  }
  function setGuests(uid, v) {
    setDraft((d) => ({ ...d, rooms: d.rooms.map((r) => (r.uid === uid ? { ...r, adults: v } : r)) }));
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
    /* The drawer has just done the whole job Location and Program's pages
       would have, so it lands on wherever the flow itself starts —
       /rooms in drawer entry (Location/Program have no page to land on),
       /location or /program in pages entry, so those two routes stay
       reachable through ordinary navigation rather than only by a typed
       URL. Both read from the same flowSteps() the Stepper draws from,
       so this can never disagree with what the stepper calls "step 1". */
    navigate(flowSteps(config)[0]?.path || '/rooms');
    onApply?.({ pendingRoom: rooms.findIndex((r) => !r.roomId), roomCount: rooms.length, propertyChanged });
  }

  return (
    <div role="dialog" aria-modal="true" aria-labelledby={titleId} className="fixed inset-0 z-[1000]">
      <div
        className={'absolute inset-0 bg-dark/40 transition-opacity duration-300 motion-reduce:transition-none ' + (shown ? 'opacity-100' : 'opacity-0')}
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
          'transition-transform duration-300 ease-out motion-reduce:transition-none ' + (shown ? 'translate-x-0' : 'translate-x-full')
        }
      >
        <div className="flex flex-1 flex-col gap-5 px-6 py-8 md:px-8">
          <div className="flex items-end justify-between gap-4">
            <h2 id={titleId} className="h-serif leading-none text-ink text-[calc(var(--text-h5)-6px)]">Book Your Stay</h2>
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
            <LocationSelect value={draft.property} onChange={chooseProperty} open={propOpen} onOpenChange={setPropOpen} />
          )}

          <div>
            <span className="label-sm mb-1.5 block text-accent">{config.multiRoom ? 'Rooms & Guests' : 'Guests'}</span>
            <p className="mb-3 text-xs text-muted">Maximum 2 adult guests per room.</p>
            <RoomChips rooms={draft.rooms} multiRoom={config.multiRoom} onGuestsChange={setGuests} onAdd={addRoom} onRemove={removeRoom} />
          </div>

          <div>
            <span className="label-sm mb-1.5 block text-accent">Promo Code</span>
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
            <span className="label-sm mb-1.5 block text-accent">Choose Your Dates</span>
            {draft.property ? (
              <DatePicker
                pid={draft.property}
                checkIn={draft.checkIn}
                checkOut={draft.checkOut}
                extension={draft.extension}
                retreatsOn={config.retreats}
                extensionsOn={config.extensions}
                onPickCheckIn={(d) => setDraft((x) => ({ ...x, checkIn: d, checkOut: null, extension: null }))}
                onPickCheckOut={(d) => setDraft((x) => ({ ...x, checkOut: d }))}
                onResetCheckIn={() => setDraft((x) => ({ ...x, checkIn: null, checkOut: null, extension: null }))}
                onResetCheckOut={() => setDraft((x) => ({ ...x, checkOut: null, extension: null }))}
                onToggleExtra={(v) => setDraft((x) => ({ ...x, extension: v ? D.properties[x.property].stayRules.extensionType : null }))}
                onChooseRetreatDates={(ci, co) => setDraft((x) => ({ ...x, checkIn: ci, checkOut: co || null, extension: null }))}
                bare
              />
            ) : (
              <p className="text-sm text-muted">Select a location to see available dates.</p>
            )}
          </div>

          <hr className="border-line" />

          {/* CHECK RATES never scrolls away: it sticks to the bottom of
              the drawer's own scroll area, on the drawer ground, and only
              settles into the flow once everything above it is in view. */}
          <div className="sticky bottom-0 z-30 -mx-6 mt-auto bg-light px-6 pb-6 pt-4 md:-mx-8 md:px-8">
            <Button variant="primary" onClick={apply} disabled={!canSubmit} className="w-full">
              {ctaLabel}
            </Button>
          </div>
        </div>
      </aside>
    </div>
  );
}
