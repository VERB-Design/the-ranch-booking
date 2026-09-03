import { useEffect } from 'react';
import { useStep } from '../components/Layout.jsx';
import RoomChips from '../components/booking/RoomChips.jsx';
import DatePicker from '../components/booking/DatePicker.jsx';
import { D, MAX_ROOMS, newRoomSlot, useBooking } from '../store.jsx';
import { iso, parse } from '../stay.js';
import { nextPathAfter, useConfig } from '../config.jsx';
import usePageTitle from '../usePageTitle.js';

/* ============================================================
   Program — step 2 (docs/BRIEF.md section 3, wires 02a–02c)
   ------------------------------------------------------------
   The most important screen in the flow: rooms + guests, then the
   fixed-block date picker, in the same order the wires lay them out.
   Extensions (step 3) has no page of its own — it is the extra-night
   toggle DatePicker renders once canExtend(checkOut) and config.extensions
   both allow it, and the stepper already knows to mirror this step's
   status (see flowSteps in config.jsx).
   ============================================================ */
export default function Program() {
  usePageTitle('Program & Dates');
  const { state, set } = useBooking();
  const config = useConfig();

  /* Landing here without a property (a deep link, or multiProperty off
     with no Location step to set one) defaults it the same way Rooms.jsx
     does, so the retreat lookups and the rail below have something real
     to key off rather than silently rendering nothing. */
  useEffect(() => {
    if (!state.property) set({ property: D.propertyList[0] });
  }, [state.property, set]);

  const rooms = state.rooms || [];
  const checkIn = state.checkIn ? parse(state.checkIn) : null;
  const checkOut = state.checkOut ? parse(state.checkOut) : null;

  const roomsOk = rooms.length > 0 && rooms.every((r) => (r.adults || 0) >= 1);
  const datesOk = !!(checkIn && checkOut);

  useStep({
    continueTo: nextPathAfter(config, 'program'),
    canContinue: roomsOk && datesOk,
    label: 'Continue',
  });

  function setGuests(uid, v) {
    set({ rooms: rooms.map((r) => (r.uid === uid ? { ...r, adults: v } : r)) });
  }
  function addRoom() {
    if (rooms.length >= MAX_ROOMS) return;
    set({ rooms: [...rooms, newRoomSlot(rooms)] });
  }
  function removeRoom(uid) {
    set({ rooms: rooms.filter((r) => r.uid !== uid) });
  }

  const pid = state.property || D.propertyList[0];
  const stayRules = D.properties[pid].stayRules;

  function pickCheckIn(date) {
    set({ checkIn: iso(date), checkOut: null, extension: null });
  }
  function pickCheckOut(date) {
    set({ checkOut: iso(date) });
  }
  function resetCheckIn() {
    set({ checkIn: null, checkOut: null, extension: null });
  }
  function resetCheckOut() {
    set({ checkOut: null, extension: null });
  }
  function toggleExtra(v) {
    set({ extension: v ? stayRules.extensionType : null });
  }
  /* RetreatModal's "Choose these dates" — one commit for both fields
     rather than chaining pickCheckIn (which itself clears checkOut) into
     a second call, so a retreat with an unambiguous 3-night check-out
     lands on both dates in one state update instead of two renders. */
  function chooseRetreatDates(checkInDate, checkOutDate) {
    set({
      checkIn: iso(checkInDate),
      checkOut: checkOutDate ? iso(checkOutDate) : null,
      extension: null,
    });
  }

  return (
    <div>
      {/* No visible H1 in the wires — this section pair is the page's
          whole content — but the flow still needs one landmark heading
          for assistive tech to announce on route change. */}
      <h1 className="sr-only">Program select</h1>

      <section className="pt-8 md:pt-10">
        <h2 className="eyebrow mb-2 font-medium text-ink">Add rooms &amp; guests</h2>
        <p className="mb-6 max-w-[520px] text-sm text-body">
          Maximum 2 adult guests per room. For more information, call{' '}
          <a href={'tel:' + D.phone.replace(/[^\d+]/g, '')} className="text-accent underline underline-offset-2 hover:text-ink">
            {D.phone}
          </a>
          .
        </p>
        <RoomChips
          rooms={rooms}
          multiRoom={config.multiRoom}
          onGuestsChange={setGuests}
          onAdd={addRoom}
          onRemove={removeRoom}
        />
      </section>

      <hr className="my-8 border-line md:my-10" />

      <section className="pb-12">
        <h2 className="eyebrow mb-6 font-medium text-ink">Choose your dates</h2>
        <DatePicker
          pid={pid}
          checkIn={checkIn}
          checkOut={checkOut}
          extension={state.extension}
          retreatsOn={config.retreats}
          extensionsOn={config.extensions}
          onPickCheckIn={pickCheckIn}
          onPickCheckOut={pickCheckOut}
          onResetCheckIn={resetCheckIn}
          onResetCheckOut={resetCheckOut}
          onToggleExtra={toggleExtra}
          onChooseRetreatDates={chooseRetreatDates}
        />
      </section>
    </div>
  );
}
