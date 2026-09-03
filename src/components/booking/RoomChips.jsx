import Counter from '../ui/Counter.jsx';
import { MAX_ROOMS } from '../../store.jsx';
import { MAX_GUESTS_PER_ROOM } from '../../config.jsx';

/* ============================================================
   RoomChips
   ------------------------------------------------------------
   "ADD ROOMS & GUESTS" per docs/figma/wires/02a — one bordered chip per
   room slot (label + a Guests Counter), a dashed "+ Add Room" tile up to
   MAX_ROOMS, and an "x" to drop any room past the first. Wrapped in a
   fieldset/legend so the whole group reads as one control to a screen
   reader. When `multiRoom` is off, the second-and-on rooms and the add
   tile never render — the brief's "single room, no add tile" case.

   Shared between the Program step page (`entry=pages`) and
   `ReserveDrawer` (`entry=drawer`, the default) — one component, one
   place the chip layout and guest-count rules live, per
   docs/BRIEF.md's "Drawer entry" subsection. At the drawer's 396px inner
   content width (460px panel − 64px padding), two 190px chips + one
   16px gap land exactly at 396px, so the two-per-row layout the brief
   asks for falls out of the existing sizing without a drawer-specific
   variant.
   ============================================================ */
export default function RoomChips({ rooms, multiRoom, onGuestsChange, onAdd, onRemove }) {
  const visible = multiRoom ? rooms : rooms.slice(0, 1);

  return (
    <fieldset className="flex flex-wrap gap-4">
      <legend className="sr-only">Rooms and guests</legend>
      {visible.map((r, i) => (
        <div
          key={r.uid}
          className="relative flex w-[190px] shrink-0 flex-col gap-3 border border-line bg-light p-4"
        >
          {multiRoom && i > 0 && (
            <button
              type="button"
              onClick={() => onRemove(r.uid)}
              aria-label={'Remove Room ' + String(i + 1).padStart(2, '0')}
              className="absolute right-2 top-2 grid h-6 w-6 place-items-center text-muted hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent-focus focus-visible:outline-offset-2"
            >
              <img src="/icons/close.svg" alt="" aria-hidden="true" className="h-3 w-3" />
            </button>
          )}
          <span className="label-sm text-ink">Room {String(i + 1).padStart(2, '0')}</span>
          <Counter
            label="Guests"
            ariaLabel={'Guests, Room ' + String(i + 1).padStart(2, '0')}
            value={r.adults}
            min={1}
            max={MAX_GUESTS_PER_ROOM}
            onChange={(v) => onGuestsChange(r.uid, v)}
          />
        </div>
      ))}

      {multiRoom && rooms.length < MAX_ROOMS && (
        <button
          type="button"
          onClick={onAdd}
          className="flex w-[190px] shrink-0 items-center justify-center gap-2 border border-dashed border-line p-4 text-sm text-muted transition-colors hover:border-dark hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent-focus focus-visible:outline-offset-2"
        >
          <img src="/icons/plus.svg" alt="" aria-hidden="true" className="h-[14px] w-[14px]" />
          Add Room
        </button>
      )}
    </fieldset>
  );
}
