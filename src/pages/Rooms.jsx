import { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { PageTitle } from '../components/Chrome.jsx';
import RoomCard from '../components/RoomCard.jsx';
import { useStep } from '../components/Layout.jsx';
import { D, activeRoomIndex, bookedRooms, nextUnassigned, useBooking } from '../store.jsx';
import { cardLayout, useConfig } from '../config.jsx';
import usePageTitle from '../usePageTitle.js';

/* Step 4 · Room select (docs/BRIEF.md, wires 03a–03b) — PRIORITY. Cards
   are filtered to the property chosen in step 1; the Ranch has one rate
   per room, so choosing a room (in RoomCard) is the whole of the
   decision — this page just lists them and, for a multi-room booking,
   tracks which slot is being filled. */
export default function Rooms() {
  usePageTitle('Select Your Room');
  const { state, set } = useBooking();
  const config = useConfig();

  useEffect(() => {
    if (!state.property) set({ property: D.propertyList[0] });
  }, [state.property, set]);

  const allRooms = state.rooms || [];
  const multi = config.multiRoom && allRooms.length > 1;
  const pending = nextUnassigned(state);
  const activeIdx = activeRoomIndex(state);
  const editing = !!state.editRoom && allRooms.some((r) => r.uid === state.editRoom);
  const choosing = editing || pending !== -1;

  /* Choosing a room is the step — RoomCard moves the flow on as soon as
     every room in the booking has one. The Continue bar only appears when a
     guest comes back with rooms already chosen, so they can carry on
     without picking again. */
  const done = bookedRooms(state).length === allRooms.length && allRooms.length > 0;
  useStep({ enabled: done, canContinue: done, label: 'Continue' });

  /* A room is priced against the stay, so a deep link that skipped the
     dates has nothing to price — send it back to the step that sets them.
     Drawer entry has no /program route to land on (dates live in the
     drawer, opened from home); pages entry keeps sending it to Program. */
  if (!state.checkIn || !state.checkOut) {
    return <Navigate to={config.entry === 'drawer' ? '/' : '/program'} replace />;
  }

  const pid = state.property || D.propertyList[0];
  const rooms = D.roomsFor(pid);
  const grid = cardLayout(config) === 'vertical'
    ? 'grid gap-6 pb-4 md:grid-cols-2 xl:grid-cols-3'
    : 'flex flex-col gap-5 pb-4';

  return (
    <div>
      {multi && (
        <div
          role="status"
          aria-live="polite"
          className="mt-2 mb-6 flex flex-wrap items-center justify-between gap-4 bg-light px-5 py-4"
        >
          <div>
            <p className="eyebrow text-accent">
              {!choosing
                ? 'All ' + allRooms.length + ' Rooms Chosen'
                : (editing ? 'Editing Room ' : 'Choosing Room ') + (activeIdx + 1) + ' of ' + allRooms.length}
            </p>
            <p className="mt-1 text-sm text-body">
              {!choosing
                ? 'Pick a different room for any of them below, or continue.'
                : allRooms[activeIdx] ? allRooms[activeIdx].adults + ' Adult' + (allRooms[activeIdx].adults > 1 ? 's' : '') : ''}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {allRooms.map((r, i) => (
              <span
                key={r.uid}
                className={
                  'label-sm border px-3 py-1.5 ' +
                  /* This badge is always live status text ("Not chosen" is a real,
                     read state, not a disabled control) — text-disabled measured
                     2.06:1 here and fails 4.5:1; text-muted passes at 4.61+ and still
                     reads as the quietest of the three states. */
                  (choosing && i === activeIdx ? 'border-dark text-ink' : r.roomId ? 'border-line text-body' : 'border-line text-muted')
                }
              >
                Room {i + 1}{r.roomId ? ' · ' + (D.roomById(r.roomId)?.name || '') : ' · Not chosen'}
              </span>
            ))}
          </div>
        </div>
      )}

      <PageTitle title="Select Your Room" sub="Choose the room you want to stay in." flush={multi} />

      <div className={grid}>
        {rooms.map((room) => {
          const bookedHere = allRooms.some((r) => r.roomId === room.id);
          return (
            <RoomCard
              key={room.id}
              room={room}
              selected={bookedHere}
              ctaLabel={multi && activeIdx < allRooms.length - 1 ? 'Select for Room ' + (activeIdx + 1) : 'Select Room'}
            />
          );
        })}
      </div>
    </div>
  );
}
